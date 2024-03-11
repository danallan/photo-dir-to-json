import { Directory } from './fs/dir';
import { Album, AlbumOptions } from './album';

/**
 * Optional Portfolio configuration. Include properties of `AlbumOptions` that
 * you would like passed to each Album instance.
 * @public
 */
export interface PortfolioOptions extends AlbumOptions {
    /**
     * A list of subdirectory names inside of the Portfolio path to skip.
     */
    skipAlbumNames?: string[],
}

/**
 * Portfolio is a convenience class that automatically creates Album class
 * instances for all subdirectories of a provided path.
 * @public
 */
export class Portfolio {
    private _directory: Directory;
    /**
     * List of Album instances for each subdirectory of the Portfolio path.
     */
    readonly albums: Album[];

    /**
     * Instantiate all subdirectories of the provided path as Albums. This
     * processes all subdirectories except `opts.metadataDir`, if provided.
     * @param path - String path to the directory containing albums
     * @param opts - Any `AlbumOptions` properties specified here will be
     *  passed to each new Album class instance.
     */
    constructor(
            /** String path to the Portfolio directory */
            readonly path: string,
            opts?: PortfolioOptions)
    {
        this._directory = new Directory(path);

        const skip = opts?.skipAlbumNames ?? [];

        this.albums = this._directory.getSubDirectoriesSync(skip).map((d) => {
            return new Album(d.path, opts);
        });
    }
}