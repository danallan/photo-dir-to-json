import exifreader from 'exifreader';
import { parse as parseDate, parseISO } from 'date-fns';
import { statSync } from 'fs';
import { join as pathJoin } from 'path';

import { Directory } from './fs/index.js';
import { photoSchemaType } from './schema/index.js';

/**
 * Photo class represents a single photo file. It allows for easy fetch of photo
 * metadata (see {@link photoSchema}).
 * @public
 */
export class Photo {
    private _directory: Directory;
    private _metadata: photoSchemaType|null = null;

    /**
     * Construct a new instance of the Photo class
     * @param path - string directory of the album containing the photo (not
     *   including the photo's filename)
     * @param name - string filename of the photo
     */
    constructor(path: string,
        /** The on-disk photo filename, e.g. `IMG_1234.jpg`. */
        readonly name: string)
    {
        this._directory = new Directory(path);
    }

    /**
     * On-disk path to the file, e.g. `/Volume/Photos/Album1/IMG_1234.jpg`
     * @returns string path
     */
    get path(): string {
        return pathJoin(this._directory.path, this.name);
    }

    private _getDateTime(tags: exifreader.Tags): Date {
        let date: Date;

        const exifDateTag = tags['DateTimeDigitized'];
        const altDateTag = (
            tags['DateCreated'] || // IPTC
            tags['CreateDate'] // XMP
        );

        if (exifDateTag) {
            // typical EXIF date format with an added two-digit
            // sub-second precision which we add below
            let exifFormat = 'yyyy:MM:dd HH:mm:ss.SS';

            // typically 2 digits of sub-second precision, if available
            const subsec = (tags['SubSecTimeDigitized']?.description ?? '00').substring(0, 2);
            let timestamp = `${exifDateTag.description}.${subsec}`;

            // add timezone offset if available. typical format: "±HH:MM"
            const offset = tags['OffsetTimeDigitized'];
            if (offset) {
                timestamp = `${timestamp}${offset.description}`;
                exifFormat = `${exifFormat}X`;
            }

            date = parseDate(timestamp, exifFormat, new Date());
        }
        else if (altDateTag) {
            // these tags come in a modified ISO-8601 form already
            date = parseISO(altDateTag.description);
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