import { test } from 'vitest';
import { albumSchema, Portfolio } from '../src/index.js';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join as pathJoin } from 'path';

const dir = './test';

// enumerate all subdirs of './test' here except 'Album' and 'Images'
const skipAlbumNames = ['__snapshots__', 'Images-bad', 'metadata'];

test('load a directory of albums', ({ expect }) => {
    const portfolio = new Portfolio(dir);
    expect(portfolio.albums.length).toBeGreaterThanOrEqual(5);
});

test('can skip albums', ({ expect }) => {
    const portfolio = new Portfolio(dir, { skipAlbumNames });
    expect(portfolio.albums.length).toBe(2);
});

test('saveAllMetadata()', async ({ expect }) => {
    const metadataOutDir = './test/metadata/portfolio-out';
    if (!existsSync(metadataOutDir))
        mkdirSync(metadataOutDir);

    // remember the files we write out for later sanity check
    type memo = { slug: string, path: string };
    const output: memo[] = [];

    const portfolio = new Portfolio(dir, { skipAlbumNames });
    await portfolio.saveAllMetadata((album) => {
        const path = pathJoin(metadataOutDir, album.name.toLocaleLowerCase());
        output.push({ slug: album.slug, path });
        return path;
    });

    // we must have written some out
    expect(output.length).toBe(2);

    // sanity check every file is parseable and has appropriate data
    for (const { slug, path } of output) {
        const contents = readFileSync(path, 'utf8');
        const written = albumSchema.parse(JSON.parse(contents));

        expect(written.slug).toBe(slug);
        expect(written.photos.length).toBeGreaterThanOrEqual(1);
    }

    // clean up
    rmSync(metadataOutDir, { recursive: true });
});