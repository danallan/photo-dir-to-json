import exifreader from 'exifreader';
import { parse as parseDate, parseISO } from 'date-fns';
import { statSync } from 'fs';
import { join as pathJoin, resolve } from 'path';

import { photoSchemaType } from './schema/index.js';

/**
 * Photo class represents a single photo file. It allows for easy fetch of photo
 * metadata (see {@link photoSchema}).
 * @public
 */
export class Photo {
    /**
     * On-disk absolute path to the file, e.g.
     * `/Volume/Photos/Album1/IMG_1234.jpg`
     */
    readonly path: string;
    private _metadata: photoSchemaType | null = null;

    /**
     * Construct a new instance of the Photo class
     * @param dir - string directory of the album containing the photo (not
     *   including the photo's filename)
     * @param name - string filename of the photo
     */
    constructor(
        dir: string,
        /** The on-disk photo filename, e.g. `IMG_1234.jpg`. */
        readonly name: string
    ) {
        this.path = resolve(pathJoin(dir, name));
    }

    private _getDateTime(tags: exifreader.ExpandedTags): Date {
        let date: Date;

        // Ref: https://github.com/mattiasw/ExifReader/blob/main/exif-reader.d.ts
        const exifDateTag = tags.exif && tags.exif['DateTimeOriginal'];
        const xmpDateTag = tags.xmp && tags.xmp['CreateDate'];
        const iptcDateTag = tags.iptc && tags.iptc['Date Created'];

        if (exifDateTag) {
            /*
             * https://www.cipa.jp/std/documents/download_e.html?DC-008-Translation-2023-E
             * typical EXIF date format with up to two added fields:
             * '.SSS': three-digit sub-second precision added below
             * 'xxx':  timezone offset "±HH:MM", if offset provided
             */
            let exifFormat = 'yyyy:MM:dd HH:mm:ss.SSS';

            // normalize sub-second data to a max of 3 digits
            const subsec =
                (tags.exif!['SubSecTimeOriginal']?.description ?? '') + '000';
            let timestamp = `${exifDateTag.description}.${subsec.substring(0, 3)}`;

            // add timezone offset if available. typical format: "±HH:MM"
            // otherwise assume local time
            const offset = tags.exif!['OffsetTimeOriginal'];
            if (offset) {
                timestamp = `${timestamp}${offset.description}`;
                exifFormat = `${exifFormat}xxx`;
            }

            date = parseDate(timestamp, exifFormat, new Date());
        } else if (xmpDateTag) {
            // comes in a modified ISO-8601 form already
            date = parseISO(xmpDateTag.description);
        } else if (iptcDateTag) {
            /*
             * https://iptc.org/std/IIM/4.2/specification/IIMV4.2.pdf
             * DateCreated:
             * > Represented in the form CCYYMMDD to designate the date the
             *   intellectual content of the objectdata was created rather than
             *   the date of the creation of the physical representation.
             *   Follows ISO 8601 standard."
             *
             * TimeCreated:
             * > Not repeatable, 11 octets, consisting of graphic characters.
             *   Represented in the form HHMMSS±HHMM to designate the time the
             *   intellectual content of the objectdata current source material
             *   was created rather than the creation of the physical
             *   representation. Follows ISO 8601 standard."
             */
            const timecreated = tags.iptc!['Time Created']?.description ?? '';
            const timestamp = `${iptcDateTag.description}T${timecreated}`;
            date = parseISO(timestamp);
        } else {
            console.warn(
                `WARNING: Cannot read create date from metadata in ` +
                    `${this.path}, using file creation time instead`
            );
            // alias birthtime from stat object as date
            ({ birthtime: date } = statSync(this.path));
        }
        return date;
    }

    private _getDimensions(tags: exifreader.ExpandedTags): {
        width: number;
        height: number;
    } {
        let width, height;

        if (tags.riff) {
            width = tags.riff['ImageWidth']!;
            height = tags.riff['ImageHeight']!;
        } else if (tags.pngFile) {
            width = tags.pngFile['Image Width']!;
            height = tags.pngFile['Image Height']!;
        } else {
            width = tags.file!['Image Width']!;
            height = tags.file!['Image Height']!;
        }

        return { width: width.value, height: height.value };
    }

    /**
     * Fetches the XMP-dc (Dublin Core namespace) `identifier` field:
     * https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/identifier
     * @param tags - Expanded Tags object from exifreader
     * @returns XMP-dc:identifier string, if present, else undefined
     */
    private _getXmpIdentifier(
        tags: exifreader.ExpandedTags
    ): string | undefined {
        return tags.xmp?.identifier?.description;
    }

    /**
     * Fetche the XMP-dc (Dublin Core namespace) `description` field:
     * https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#http://purl.org/dc/terms/description
     * @param tags - Expanded Tags object from exifreader
     * @returns XMP-dc:description string, if present, else undefined
     */
    private _getXmpDescription(
        tags: exifreader.ExpandedTags
    ): string | undefined {
        return tags.xmp?.description?.description;
    }

    /**
     * Asynchronously compute the {@link photoSchema} metadata for the image.
     * The data is processed once and cached, so multiple executions will emit
     * the same data. Date is fetched first from metadata and falls back to
     * on-disk creation time if not available, see remarks.
     *
     * @remarks
     * Date information is searched from the photo file in the following
     * sequence, in order of preference:
     *
     * 1. EXIF metadata via `DateTimeOriginal`. When using EXIF, sub-second
     *    resolution from `SubSecTimeOriginal` and timezone offset
     *    `OffsetTimeOriginal` are applied to the timestamp if available.
     *
     * 2. XMP metadata via `CreateDate`.
     *
     * 3. IPTC metadata via `DateCreated`. `TimeCreated` is appended to the
     *    timestamp if available.
     *
     * 4. file's creation (birth) time on-disk.
     *
     * The date is emitted in UTC and uses timezone offset when available. If
     * the timezone offset is missing then dates are assumed to be in local time
     * during the conversion to UTC.
     *
     * Examples:
     *
     * 1. EXIF date is `2024:01:01 12:00:00` and the EXIF offset time is set as
     *    `+02:00`. The emitted time is then `2024-01-01T10:00:00.000Z`,
     *    regardless of your computer's time zone setting.
     *
     * 2. EXIF metadata is `2024:01:01 12:00:00` with a missing offset, and your
     *    computer's time zone is set to `-05:00` (America/New_York), the date
     *    will be output as `2024-01-01T17:00:00.000Z`. When the date is
     *    processed by the downstream application it will be emitted to match
     *    the appearance in the metadata when using local time.
     *
     * If you know the time zone offset for a photo it is always better to
     * explicitly set the offset (like `OffsetTimeOriginal` EXIF field) in the
     * photo file. {@link https://exiftool.org/ | ExifTool} is one way to set
     * this field in your files.
     *
     * For more information on tag specifics, see:
     * {@link https://www.iptc.org/std/photometadata/documentation/mappingguidelines/#exif-note-on-date-created | IPTC Photo Mapping Guidelines: EXIF Note on Date Created}
     *
     * @returns a promise that, when resolved, provides photoSchema metadata for
     *  the image
     */
    public async metadata(): Promise<photoSchemaType> {
        if (this._metadata) return this._metadata;

        let tags;
        try {
            tags = await exifreader.load(this.path, { expanded: true });
        } catch (_) {
            throw new Error(`Invalid image format: ${this.path}`);
        }

        const { width, height } = this._getDimensions(tags);

        this._metadata = {
            filename: this.name,
            date: this._getDateTime(tags).toISOString(),
            width,
            height,
            landscape: width > height,
        };

        const id = this._getXmpIdentifier(tags);
        if (id) this._metadata.id = id;

        const desc = this._getXmpDescription(tags);
        if (desc) this._metadata.alt = desc;

        return this._metadata;
    }
}
