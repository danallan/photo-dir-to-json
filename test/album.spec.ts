import { describe, test, vi } from 'vitest';
import { Album } from '../src/album.js';
import { albumSchema } from '../src/schema/index.js';
import { resolve, join as pathJoin } from 'path';
import { readFileSync, rmSync } from 'fs';

// all test images
const images = './test/Images';

// a narrowly defined album for snapshots
const albumdir = './test/Album'
const metadataDir = './test/metadata';
const metadataFile = '_metadata.json';

describe('getters', () => {
    test('name is basename', ({ expect }) => {
        const album = new Album(images);
        expect(album.name).toEqual('Images');
    });

    test('path returns absolute path', ({ expect }) => {
        const album = new Album(albumdir);
        const path = resolve(albumdir);
        expect(album.path).toEqual(path);
    });

    test('slug is lowercase name by default', ({ expect }) => {
        const album = new Album(albumdir);
        expect(album.slug).toEqual('album');
    });

    test('title equals name by default', ({ expect }) => {
        const album = new Album(albumdir);
        expect(album.title).toEqual(album.name);
    });

    test('photos includes all jpg, jpeg, png, webp, no json', ({ expect }) => {
        const photos = (new Album(images)).photos;
        expect(photos.length).toBe(13);

        const names = photos.map(p => p.name);
        expect(names).toContain('exif.jpg');
        expect(names).toContain('exif.png');
        expect(names).toContain('exif.webp');
    });

    test('photos can be empty', ({ expect }) => {
        const photos = (new Album(metadataDir)).photos;
        expect(photos).toEqual([]);
    });
});

describe('options object', () => {
    test('cannot specify both metadataDir and metadataFile', ({ expect }) => {
        const opts = { metadataDir, metadataFile };
        expect(() => { new Album(albumdir, opts); }).toThrow();
    });

    test('allowedExtensions overrides default', ({ expect }) => {
        const consoleSpy = vi.spyOn(console, 'error');
        expect(consoleSpy.mock.calls.length).toBe(0);

        const opts = { allowedExtensions: ['png'] };
        const photos = (new Album(images, opts)).photos;
        const names = photos.map(p => p.name);

        // all PNG files
        expect(names).toEqual(['exif.png', 'wide.png']);

        // should also trigger console errors for unskipped files
        // don't forget that _metadata.json by default does not emit error
        expect(consoleSpy).toHaveBeenCalledTimes(11);

        consoleSpy.mockRestore();
    });

    test('skippedExtensions overrides default', ({ expect }) => {
        const opts = {
            allowedExtensions: [],
            skippedExtensions: ['json', 'jpg', 'png', 'webp'],
        };
        const consoleSpy = vi.spyOn(console, 'error');
        (new Album(images, opts)).photos;

        // expect no warnings
        expect(consoleSpy).not.toBeCalled();

        consoleSpy.mockRestore();
    });
});

describe('metadata', () => {
    test('title getter is overwritten by metadata', ({ expect }) => {
        const album = new Album(albumdir, { metadataFile });
        expect(album.title).toBe('Test album');
    });

    test('slug getter is overwritten by metadata', ({ expect }) => {
        const album = new Album(albumdir, { metadataFile });
        expect(album.slug).toBe('/path/and-a-slug-title');
    });

    test('throws error when thumb specified but file not found', ({ expect }) => {
        const opts = { metadataFile: '_metadata-missing_title.json' };
        expect(() => { new Album(albumdir, opts) }).toThrow(/Required/);
    });

    test('throws error when thumb specified but file not found', ({ expect }) => {
        const opts = { metadataFile: '_metadata-missing_thumb.json' };
        expect(() => { new Album(albumdir, opts) }).toThrow(/Thumb not found/);
    });

    test('throws error when metadata file has extra property', ({ expect }) => {
        const opts = { metadataFile: '_metadata-strict.json' };
        expect(() => { new Album(albumdir, opts) }).toThrow(/unrecognized_keys/)
    });

    test('read from metadataDir', ({ expect }) => {
        const album = new Album(albumdir, { metadataDir });
        expect(album.slug).toBe('metadata-from-dir');
    });

    test('full from file matches snapshot', async ({ expect }) => {
        const album = new Album(albumdir, { metadataFile });
        const metadata = await album.metadata();
        expect(metadata).toMatchSnapshot();
    });

    test('full from dir matches snapshot', async ({ expect }) => {
        const album = new Album(albumdir, { metadataDir });
        const metadata = await album.metadata();
        expect(metadata).toMatchSnapshot();
    });
});

test('saveMetadata() writes valid JSON', async ({ expect }) => {
    const album = new Album(albumdir, { metadataFile });
    const json = pathJoin(metadataDir, 'out.json');
    await album.saveMetadata(json);

    // now read it back, shouldn't throw
    const contents = readFileSync(json, 'utf8');
    const written = albumSchema.parse(JSON.parse(contents));

    // sanity check
    expect(written.title).toBe(album.title);
    expect(written.photos.length).toBe(1);

    // cleanup
    rmSync(json);
});