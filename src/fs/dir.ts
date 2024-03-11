import { Dirent, readdirSync } from 'fs';
import { basename, join as pathJoin } from 'path';

/**
 * A set of helper functions for a local directory.
 * @internal
 */
export class Directory {
    private _contents: null | Dirent[] = null;
    private _subdirs: null | Directory[] = null;
    private _name: string;

    constructor(readonly path: string) {
        this._name = basename(path);
    }

    get name() {
        return this._name;
    }

    private contents(): Dirent[] {
        if (this._contents !== null)
            return this._contents;

        this._contents = readdirSync(this.path, { withFileTypes: true });
        return this._contents;
    }

    public getSubDirectoriesSync(except: string[]): Directory[] {
        if (this._subdirs === null) {
            this._subdirs = this.contents()
                                .filter(f => f.isDirectory())
                                .filter(f => !except.includes(f.name))
                                .map(f => pathJoin(f.path, f.name))
                                .map(p => new Directory(p));
        }
        return this._subdirs;
    }

    public getFilesSync(): string[] {
        return this.contents()
            .filter(f => f.isFile())
            .map(f => f.name);
    }
}