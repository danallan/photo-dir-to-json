import { describe, test, vi } from 'vitest';
import { Photo } from '../src/index.js';
import { resolve, join as pathJoin } from 'path';
import { statSync, utimesSync } from 'fs';
import exifreader from 'exifreader';

const images = 'test/Images';

test('get path() returns absolute path', ({ expect }) => {
    const jpg = new Photo(images, 'img_Name123.jpg');
    const path = resolve(`${images}/img_Name123.jpg`);
    expect(jpg.path).toEqual(path);
});

test('get name() is correct', ({ expect }) => {
    const jpg = new Photo(images, 'img_Name123.jpg');
    expect(jpg.name).toEqual('img_Name123.jpg');
});

test('throws with invalid photo file', async ({ expect }) => {
    // empty.jpg is an empty file
    const empty = new Photo('test/Images-bad', 'empty.jpg');
    await expect(async () => {
        await empty.metadata();
    }).rejects.toThrow(/Invalid image format/);
});

['jpg', 'png', 'webp'].forEach((ext) => {
    describe(`${ext.toUpperCase()} files`, () => {
        test('loads file, metadata filename is correct', async ({ expect }) => {
            const d = await new Photo(images, `exif.${ext}`).metadata();
            expect(d.filename).toBe(`exif.${ext}`);
        });

        test('correctly parses image dimensions: landscape', async ({ expect }) => {
            const d = await new Photo(images, `wide.${ext}`).metadata();
            expect(d.width).toBe(90);
            expect(d.height).toBe(30);
            expect(d.landscape).toBe(true);
        });

        test('correctly parses image dimensions: square/portrait', async ({ expect }) => {
            const d = await new Photo(images, `exif.${ext}`).metadata();
            expect(d.width).toBe(16);
            expect(d.height).toBe(16);
            expect(d.landscape).toBe(false);
        });

        test('date uses EXIF creation time', async ({ expect }) => {
            // `exiftool "-DateTimeOriginal=2023:01:01 00:00:01"`
            const d = await new Photo(images, `exif.${ext}`).metadata();

            // TZ unspecified, construct local time representation
            const date = new Date(2023, 0, 1, 0, 0, 1);

            expect(d.date).toBe(date.toISOString());
        });
    });
});

describe('date parsing', () => {
    test('EXIF with OffsetTime is respected', async ({ expect }) => {
        // `exiftool "-ExifIFD:OffsetTimeOriginal=+13:45" exif-offset.jpg`
        // +13:45 is CHADT, Chatham Islands, NZ during DST
        const d = await new Photo(images, 'exif-offset.jpg').metadata();

        expect(d.date).toBe('2022-12-31T10:15:01.000Z');
    });

    test('EXIF with SubSecTime is respected', async ({ expect }) => {
        // `exiftool "-ExifIFD:SubSecTimeOriginal=789" exif-subsec.jpg`
        const d = await new Photo(images, 'exif-subsec.jpg').metadata();

        // TZ unspecified, construct local time representation
        const date = new Date(2023, 0, 1, 0, 0, 1, 789);

        expect(d.date).toBe(date.toISOString());
    });

    test('XMP used when no EXIF', async ({ expect }) => {
        // `exiftool "-XMP:CreateDate=2021-01-01T12:00:01.002+02:00" xmp.jpg`
        // also applied to exif* files
        const d = await new Photo(images, 'xmp.jpg').metadata();
        expect(d.date).toBe('2021-01-01T10:00:01.002Z');
    });

    test('XMP missing time', async ({ expect }) => {
        // `exiftool "-XMP:CreateDate=2021-01-01" xmp-no_time.jpg`
        // also applied to exif* files
        const d = await new Photo(images, 'xmp-no_time.jpg').metadata();

        // TZ unspecified, construct local time representation
        const date = new Date(2021, 0, 1, 0, 0, 0);

        expect(d.date).toBe(date.toISOString());
    });

    test('IPTC used when no EXIF and no XMP', async ({ expect }) => {
        // dates: `exiftool "-IPTC:DateCreated=20220101" iptc.jpg`
        // times: `exiftool "-IPTC:TimeCreated=000001+0000" iptc.jpg`
        // above also applied to exif.jpg and xmp.jpg
        const d = await new Photo(images, 'iptc.jpg').metadata();
        expect(d.date).toBe('2022-01-01T00:00:01.000Z');
    });

    test('IPTC missing TimeCreated', async ({ expect }) => {
        // set date as above, removed time with:
        // `exiftool "-IPTC:TimeCreated=" iptc-no_time.jpg`
        const d = await new Photo(images, 'iptc-no_time.jpg').metadata();

        // TZ unspecified, construct local time representation
        const date = new Date(2022, 0, 1, 0, 0, 0);

        expect(d.date).toBe(date.toISOString());
    });

    test('falls back to file creation time when no metadata', async ({ expect }) => {
        // btime is immutable on linux, so let's just dynamically check
        // verify with `stat -t %c`
        const img = 'no_date.jpg';
        const file = pathJoin(images, img);
        const now = new Date();

        // set atime and mtime to a newer time than the btime
        utimesSync(file, now, now);
        const { birthtime } = statSync(file);

        const d = await new Photo(images, img).metadata();
        expect(d.date).toBe(birthtime.toISOString());
    });
});

describe('optional metadata', () => {
    test('id, alt not present by default', async ({ expect }) => {
        const d = await new Photo(images, 'exif.jpg').metadata();
        expect(d).not.toHaveProperty('id');
        expect(d).not.toHaveProperty('alt');
    });
    test('id present when defined', async ({ expect }) => {
        const d = await new Photo(images, 'xmp.jpg').metadata();
        expect(d.id).toBe('i-hR6hQk');
    });
    test('alt', async ({ expect }) => {
        const d = await new Photo(images, 'xmp.jpg').metadata();
        expect(d.alt).toBe('Descriptive text');
    });
});

test('metadata is not read from file twice', async ({ expect }) => {
    const exifreaderSpy = vi.spyOn(exifreader, 'load');

    const photo = new Photo(images, 'exif.jpg');
    await photo.metadata();
    await photo.metadata();

    expect(exifreaderSpy).toBeCalledTimes(1);

    exifreaderSpy.mockRestore();
});
