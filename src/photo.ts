import sharp from 'sharp';
import { statSync } from 'fs';
import { join as pathJoin } from 'path';

import { Directory } from './fs';
import { photoSchemaType } from './schema';

/**
 * Configuration needed when performing a photo resize.
 * @public
 */
export interface PhotoResizeParams {
    /**
     * The directory to save the resized photo. The photo is saved with the same
     * filename. **WARNING:** existing files are overwritten.
     */
    dir: string,
    /**
     * The maximum size in pixels for the *longest* side of the photo. The
     * height for portrait photos and width for landscape. Aspect ratio is
     * always preserved.
     */
    largeSideMax: number,
    /**
     * The maximum size in pixels for the *shortest* side of the photo. The
     * width for portrait photos and height for landscape. Aspect ratio is
     * always preserved.
     *
     * If this is not defined, the photo is guaranteed to fit inside a square
     * with sides `largeSideMax`. If defined, it must be a value smaller than
     * `largeSideMax` to have any effect. The resulting photo will fit within
     * the size of the rectangle specified by the large and small side maximums.
     */
    smallSideMax?: number,
    /**
     * Integer from 1-100, default 80. Defines the output quality of saved
     * images for JPG, WebP, and TIFF file types.
     */
    quality?: number,
}

/**
 * Photo class represents a single photo file. It allows for easy fetch of photo
 * metadata (see `photoSchema`) and resizing.
 * @public
 */
export class Photo {
    private _directory: Directory;
    private _sharpData: sharp.Metadata|null = null;

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

    /**
     * Asynchronously compute the `photoSchema` metadata for the image.
     * The data is not cached, multiple executions re-computes the metadata.
     * Relies on the sharp library to interpret the image width and height.
     * @returns a promise that, when resolved, provides photoSchema metadata for
     *  the image
     */
    public async metadata(): Promise<photoSchemaType> {
        // allow an exception to propagate if image can't be read
        if (!this._sharpData)
            this._sharpData = await sharp(this.path).metadata();

        // fetch modified time
        const { mtime } = statSync(this.path);

        const w = this._sharpData.width || 0;
        const h = this._sharpData.height || 0;

        return {
            filename: this.name,
            date: mtime.toString(),
            w,
            h,
            landscape: w > h,
        };
    }

    /**
     * Asynchronously resize the photo (preserving EXIF, ICC, XMP, and IPTC
     * metadata, if any) and save the resulting photo to the specified path and
     * return the new photo's `photoSchema` metadata. The photo is resized to
     * fit within the specified dimensions without any cropping or padding: its
     * aspect ratio is preserved no matter the values provided.
     *
     * **WARNING**: if a file with the same name as the original image already
     * exists at the specified path it will be overwritten.
     * @param params - Specify the resize parameters in `PhotoResizeParams`
     *   type, including the directory to save the resized photo, the pixel
     *   bounds, and save quality.
     * @returns photoSchema metadata for the newly resized image
     */
    public async resize(params: PhotoResizeParams): Promise<photoSchemaType> {
        const metadata = await this.metadata();

        const short = params.smallSideMax ?? params.largeSideMax;

        const width = metadata.landscape ? params.largeSideMax : short;
        const height = metadata.landscape? short : params.largeSideMax;

        if (width >= metadata.w && height >= metadata.h)
            console.error(`WARNING: ${this.name} is being resized to fit in` +
                `${width} x ${height}, which is greater than or equal to `+
                `its current dimension ${metadata.w} by ${metadata.h}`
            );

        const quality = params.quality ?? 80;

        const output = await sharp(this.path)
            .keepMetadata()
            .resize(width, height, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality, force: false })
            .webp({ quality, force: false })
            .tiff({ quality, force: false})
            .toFile(pathJoin(params.dir, this.name));

        return {
            ...metadata,
            w: output.width,
            h: output.height
        };
    }

}