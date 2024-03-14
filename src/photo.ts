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
    private _metadata: photoSchemaType|null = null;

    /**
     * Construct a new instance of the Photo class
     * @param dir - string directory of the album containing the photo (not
     *   including the photo's filename)
     * @param name - string filename of the photo
     */
    constructor(dir: string,
        /** The on-disk photo filename, e.g. `IMG_1234.jpg`. */
        readonly name: string)
    {
        this.path = resolve(pathJoin(dir, name));
    }

    private _getDateTime(tags: exifreader.Tags): Date {
        let date: Date;

        // Ref: https://github.com/mattiasw/ExifReader/blob/main/exif-reader.d.ts
        const exifDateTag = tags['DateTimeOriginal'];
        const xmpDateTag = tags['CreateDate'];
        const iptcDateTag = tags['Date Created'];

        if (exifDateTag) {
            /*
             * https://www.cipa.jp/std/documents/download_e.html?DC-008-Translation-2023-E
             * typical EXIF date format with up to two added fields:
             * '.SSS': three-digit sub-second precision added below
             * 'xxx':  timezone offset "±HH:MM", if offset provided
             */
            let exifFormat = 'yyyy:MM:dd HH:mm:ss.SSS';

            // normalize sub-second data to a max of 3 digits
            const subsec = (tags['SubSecTimeOriginal']?.description ?? '') + '000';
            let timestamp = `${exifDateTag.description}.${subsec.substring(0, 3)}`;

            // add timezone offset if available. typical format: "±HH:MM"
            // otherwise assume local time
            const offset = tags['OffsetTimeOriginal'];
            if (offset) {
                timestamp = `${timestamp}${offset.description}`;
                exifFormat = `${exifFormat}xxx`;
            }

            date = parseDate(timestamp, exifFormat, new Date());
        }
        else if (xmpDateTag) {
            // comes in a modified ISO-8601 form already
            date = parseISO(xmpDateTag.description);
        }
        else if (iptcDateTag) {
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
            const timecreated = tags['Time Created']?.description ?? '';
            const timestamp = `${iptcDateTag.description}T${timecreated}`;
            date = parseISO(timestamp);
        }
        else {
            console.warn(`WARNING: Cannot read create date from metadata in ` +
                        `${this.path}, using file creation time instead`);
            // alias birthtime from stat object as date
            ({ birthtime: date } = statSync(this.path));
        }
        return date;
    }

    private _getDimensions(tags: exifreader.Tags): {width: number, height: number} {
        let width: number, height: number;
        try {
            // with a space reads from file headers, no space is from metadata
            width = (tags['Image Width'] || tags['ImageWidth'])!.value;
            height = (tags['Image Height'] || tags['ImageHeight'])!.value;
        }
        catch (e) {
            throw new Error(`Cannot determine size of ${this.path}:\n${e}`);
        }
        return { width, height };
    }

    /**
     * Asynchronously compute the {@link photoSchema} metadata for the image.
     * The data is processed once and cached, so multiple executions will emit
     * the same data. The date information is searched in the file in this
     * order: EXIF tags, IPTC tags, XMP tags, and falls back to on-disk modified
     * time. Metadata timestamps are processed according to ISO-8601 and use
     * local time zone unless a timezone offset is included (like EXIF
     * `OffsetTimeDigitized`).
     * @returns a promise that, when resolved, provides photoSchema metadata for
     *  the image
     */
    public async metadata(): Promise<photoSchemaType> {
        if (this._metadata)
            return this._metadata;

        const tags = await exifreader.load(this.path);

        const { width, height } = this._getDimensions(tags);

        this._metadata = {
            filename: this.name,
            date: this._getDateTime(tags).toISOString(),
            width,
            height,
            landscape: width > height,
        };

        return this._metadata;
    }

}