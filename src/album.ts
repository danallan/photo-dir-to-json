import { Directory } from './fs';
import { Photo, PhotoResizeParams } from './photo';
import {
    albumSchemaType,
    photoSchemaType,
    metadataSchema,
    metadataSchemaType
} from './schema';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join as pathJoin, extname, relative } from 'path';

/**
 * Optional album configuration.
 * @public
*/
export interface AlbumOptions {
    /** The path to a directory containing album metadata file.
      * If this is specified, the metadata file is assumed to match the album's
      * directory name. This cannot be specified with `metadataFile`.
      */
    metadataDir?: string,
    /** The name of the metadata file inside of the album directory. E.g.,
      * `_metadata.json`. This cannot be specified with `metadataDir`.
      */
    metadataFile?: string,
    /** A list of case-insensitive extensions to match photo files inside the
      * album. The files must be supported by the sharp image processing
      * library. Default: ['jpg', 'jpeg', 'png', 'webp']
      */
    allowedExtensions?: string[],
    /** Suppress warnings for files that are skipped in the album with these
      * case-insensitive extensions. Default: ['json', 'ds_store']
      */
    skippedExtensions?: string[],
}

/**
 * The Album class represents a local directory of photos and an optional input
 * metadata JSON file that conforms to `metadataSchema`. The class collates
 * information about each photo inside of the album directory, combines it with
 * the (optional but recommended) input metadata and provides it all in a single
 * `albumSchema` metadata object. Additionally, the class provides a resize
 * method to easily resize all photos in the album and save them to another
 * directory.
 * @public
 */
export class Album {
    private _allowedExtensions: Set<string>;
    private _skippedExtensions: Set<string>;
    private _metadata: metadataSchemaType;
    private _photos: Photo[] | null = null;
    private _directory: Directory;

    /**
     *
     * @param path - The on-disk path to the album
     * @param options - Optionally specify the location of album metadata file
     *   and override default extensions used for including photos
     */
    constructor(path: string, options?: AlbumOptions) {
        this._directory = new Directory(path);

        const opts = options ?? {};

        // prefix all extensions with a period to properly compare againt
        // result of path.extname()
        const allow = opts.allowedExtensions ?? ['jpg', 'jpeg', 'png', 'webp'];
        this._allowedExtensions = new Set(allow.map(e => `.${e.toLowerCase()}`));

        const skip = opts.skippedExtensions ?? ['json', 'ds_store'];
        this._skippedExtensions = new Set(skip.map(e => `.${e.toLowerCase()}`));

        if (opts.metadataDir && opts.metadataFile)
            throw new Error("Error: cannot specify both `metadataDir` and `metadataFile` in AlbumOptions");

        // try to load metadata from specified place, if unspecified set default
        let metadataFile: string|null = null;
        if (opts.metadataDir)
            metadataFile = pathJoin(opts.metadataDir, `${this.name}.json`);
        if (opts.metadataFile)
            metadataFile = pathJoin(this.path, opts.metadataFile);

        this._metadata = (metadataFile)
            ? this._loadMetadata(metadataFile)
            : { title: this.name };

        // verify the thumb exists in this album
        if (this._metadata.thumb && !existsSync(pathJoin(this.path, this._metadata.thumb)))
            throw new Error(`Thumb ${this._metadata.thumb} not found in album ${this.name}`);
    }

    /**
     *
     * @param file - full path to album metadata json file
     * @returns parsed metadata
     */
    private _loadMetadata(file: string): metadataSchemaType {
        const contents = readFileSync(file, 'utf8');
        return metadataSchema.parse(JSON.parse(contents));
    }

    /**
     *
     * @param filename - full path to photo file on disk
     * @returns true if filename extension is in allowedExtensions, false otherwise
     */
    private _selectOnlyPhotos(filename: string) {
        const extension = extname(filename).toLowerCase();
        if (this._allowedExtensions.has(extension))
            return true;
        if (!this._skippedExtensions.has(extension))
            console.error(`WARNING: skipping file ${filename} in album ${this.name}`);
        return false;
    }

    /**
     * List of Photo classes for all images found in the album path. Only files
     * with extensions from `allowedExtensions` are processed, all others are
     * ignored. Any ignored file extensions not specified in `skippedExtensions`
     * prints a warning to the console notifying you that they were skipped.
     * @returns List of Photo instances for all valid photos in the album
     */
    get photos(): Photo[] {
        if (this._photos === null) {
            this._photos = this._directory.getFilesSync()
                .filter(f => this._selectOnlyPhotos(f))
                .map(f => new Photo(this.path, f));
        }
        return this._photos;
    }

    /**
     * By default, album title is the album directory name but is overridden by
     * the `title` property in album metadata when supplied.
     * @returns the album title
     */
    get title(): string {
        return this._metadata.title;
    }

    /**
     * On-disk path to the album, e.g. `/Volume/Photos/Album1`.
     * @returns string path
     */
    get path(): string {
        return this._directory.path;
    }

    /**
     * The on-disk name of the album's directory. If the path is
     * `/Volume/Photos/Album1` the name is `Album1`.
     * @returns directory name of the album
     */
    get name(): string {
        return this._directory.name;
    }

    private _albumMetadata(photos: photoSchemaType[]): albumSchemaType {
        return {
            title: this._metadata.title,
            description: this._metadata.description,
            keywords: this._metadata.keywords,
            slug: this._metadata.slug || this.name.toLowerCase(),
            thumb: this._metadata.thumb,
            unlisted: this._metadata.unlisted === true,
            photos,
        }
    }

    /**
     * Returns the full metadata for the album including all photos inside.
     * @returns A promise that resolves to full album metadata after photo
     *   metadata is read from disk
     * @public
     */
    public async metadata(): Promise<albumSchemaType> {
        let photos: photoSchemaType[] = [];
        for (const photo of this.photos) {
            photos.push(await photo.metadata());
        }
        return this._albumMetadata(photos);
    }

    /**
     * Resize all photos of the album to a specified size and to a specified
     * location. This method makes a best-effort attempt to verify the path
     * provided for the resize is different from the directory containing the
     * originals.
     *
     * **WARNING**: if a file with the same name as the original image already
     * exists at the specified path it will be overwritten.
     * @param params - Specify the resize parameters in `PhotoResizeParams`
     *   type, including the directory to save the resized photo, the pixel
     *   bounds, and save quality.
     * @returns The full album metadata including the resized photos.
     * @public
     */
    public async resizePhotos(params: PhotoResizeParams): Promise<albumSchemaType> {
        params.dir = pathJoin(params.dir, this.name);

        if (relative(params.dir, this.path) === '') {
            throw new Error(`Cannot output resized photos to the same `+
                            `directory as source files`);
        }

        if (!existsSync(params.dir)) {
            mkdirSync(params.dir, { recursive: true });
        }

        const photos: photoSchemaType[] = [];
        for (const photo of this.photos) {
            photos.push(await photo.resize(params));
        }
        return this._albumMetadata(photos);
    }
}