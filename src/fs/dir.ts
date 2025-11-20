import { Dirent, readdirSync } from 'fs';
import { basename, join as pathJoin, resolve } from 'path';

/**
 * A set of helper functions for a local directory.
 * @internal
 */
export class Directory {
    private _subdirs: null | Directory[] = null;
    private _name: string;
    readonly path;

    constructor(path: string) {
        this.path = resolve(path);
        this._name = basename(path);
    }

    get name() {
        return this._name;
    }

    private contents(): Dirent[] {
        return readdirSync(this.path, { withFileTypes: true });
    }

    public getSubDirectoriesSync(except: string[]): Directory[] {
        if (this._subdirs === null) {
            this._subdirs = this.contents()
                .filter((f) => f.isDirectory())
                .filter((f) => !except.includes(f.name))
                .map((f) => pathJoin(f.parentPath, f.name))
                .map((p) => new Directory(p));
        }
        return this._subdirs;
    }

    public getFilesSync(): string[] {
        return this.contents()
            .filter((f) => f.isFile())
            .map((f) => f.name);
    }
}
