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

    /**
     * Iterate over all Albums in the portfolio and write the computed metadata
     * for each to disk.
     * @param computePath - a function that accepts an Album parameter and
     *   returns the full path where the album's JSON metadata will be written.
     * @example Write all metadata to files based on album's directory name
     *
     * ```ts
     * import { Portfolio } from 'photo-dir-to-json';
     * import { join } from 'path';
     *
     * const path = '/Volumes/Photos/Portfolio';
     * const output = '/srv/website/photo-data';
     *
     * const portfolio = new Portfolio(path, {
     *   metadataFile: '_metadata.json',
     * });
     *
     * await portfolio.saveAllMetadata((album) => {
     *   return join(output, `${album.name.toLowerCase()}.json`);
     * });
     * ```
     */
    public async saveAllMetadata(computePath: (a: Album) => string) {
        for (const album of this.albums) {
            const path = computePath(album);
            await album.saveMetadata(path);
        }
    }
}