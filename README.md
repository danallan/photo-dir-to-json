# photo-dir-to-json

A collection of useful (to me, anyway) functions to emit structured JSON
data and resize photos from a portfolio of photos saved and organized in local
directories.

This is mainly intended for occasional processing of image directories during a publish step. As an intermediate publish tool it includes two major features:

1. Emit a single JSON object per album collecting metadata related to that
   album (like its description) and brief display-related metadata for
   the photos in the album (e.g., width, height, filename, age).
2. Resize all of the photos in an album into another directory, so you don't
   need to publish full-size images to the internet.

This is not meant to be used directly in a Node-based server application.
Instead, use this library as part of a publish process and ingest the
emitted JSON file in your server or static web page builder.

# Installation

With NPM:

`npm install photo-dir-to-json`

or with Yarn:

`yarn add photo-dir-to-json`

# Input metadata

If your album has any metadata, create a JSON file with the following format.
All of this data is just passed through to the output metadata.

If specified, the Album class will validate that the `thumb` value is actually a
file that exists in the album directory.

All remaining metadata has no meaning to this library and it is intended to just
collect and emit metadata from your portfolio to your publishing app.

If you provide a JSON file, only `title` is required, all other fields are
optional:
```
{
    "title": "My album",
    "description": "An album of photos",
    "thumb": "IMG_1234.jpg", //preferred album thumb img filename
    "slug": "/expected/url/to/MyAlbum",
    "unlisted": "false",
    "keywords": ["array of keywords", "landscapes", "art"]
}
```

# Directory structure

All photos are expected to be JPEG, PNG, or WebP types by default with
extensions `jpg`, `jpeg`, `png`, or `webp`. Additional image types are possible,
limited by valid types that can be read by the [sharp
library](https://sharp.pixelplumbing.com/).

An album is just a directory that contains one or more photo files.

A portfolio is a directory that contains one or more album directories.

Sample directory structure:

```
Portfolio/
  Album1/
    _metadata.json
    IMG_1234.jpg
    IMG_1235.jpg
  Album2/
    _metadata.json
    P7130000.jpg
    P7130001.jpg
```

# Examples

## Load a portfolio, fetch one album's metadata

```ts
import { Portfolio } from 'photo-dir-to-json';

const path = '/Volumes/Photos/Portfolio';
const portfolio = new Portfolio(path, {
    metadataFile: '_metadata.json',
});

const firstOutput = await portfolio.albums[0].metadata();
```

If you specify a `metadataFile`, it must be inside
the album directory alongside the photos.

## Load a portfolio, specifying a metadata dir

Using this directory structure:
```
Portfolio/
  Album1/
    IMG_1234.jpg
    IMG_1235.jpg
  Album2/
    P7130000.jpg
    P7130001.jpg
  metadata/
    Album1.json
    Album2.json
```

```ts
import { Portfolio } from 'photo-dir-to-json';

const path = '/Volumes/Photos/Portfolio';
const data = '/Volumes/Photos/Portfolio/metadata';
new Portfolio(path, {
  metadataDir: data,
  skipAlbumNames: ['metadata']
});
```

If you specify a metadata dir, the json file name in that directory *must* match
the album directory name and include a `.json`. In the structure above,
`Album1.json` is used for `Album1`.

Whether or not the match is case-sensitive depends on your file system. On
macOS, for example, the file system is not case sensitive by default. So the
`Album1` directory can have a matching metadata file named
`metadata/album1.json` or `metadata/Album1.json`.

Additionally, you can specify which directories inside of a portfolio should
*not* be converted into Albums. In this case, since the metadata folder lives
inside the Portfolio folder, we explicitly skip that directory from Album
creation with `skipAlbumNames`.

## Load a single album directly

Using the same structure as above.

```ts
import { Album } from 'photo-dir-to-json';

const albumPath = '/Volumes/Photos/Portfolio/Album2';
const data = '/Volumes/Photos/Portfolio/metadata';

const album = new Album(albumPath, {
  metadataDir: data,
});
```

## Sample program

Load a portfolio, iterate over every album, resize images to a new directory,
then write the final album metadata for resized images to a directory.

The directory structure is as shown in 'Directory structure', above. The
resized images will be saved to `/Volumes/Photos/Resized`, and all metadata
files will be written to directory `/Volumes/Photos/Resized-metadata`, with
each metadata JSON file matching the name of the album (e.g., `Album1.json`
and `Album2.json`).

```ts
import { Portfolio } from 'photo-dir-fun-ts';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join as pathJoin } from 'path';

const photosInput = '/Volumes/Photos/Portfolio';
const photosOutput = '/Volumes/Photos/Resized';
const metadataOutput = '/Volumes/Photos/Resized-metadata';

const portfolio = new Portfolio(photosInput, {
    metadataFile: '_metadata.json',
});

console.log(`Found ${portfolio.albums.length} albums in portfolio`);

// prepare out resize and metadata output folders
if (!existsSync(photosOutput)) {
  mkdirSync(photosOutput);
}
if (!existsSync(metadataOutput)) {
  mkdirSync(metadataOutput);
}

for (const album of portfolio.albums) {
  // resize photos to fit inside a 1600px square, preserving
  // aspect ratio, metadata, and a 90% quality
  const newMetadata = await album.resizePhotos({
    largeSideMax: 1600,
    dir: photosOutput,
    quality: 90,
  });
  console.log(`Album '${album.title}': resized ${album.photos.length} photos`);

  // save metadata file to a JSON file based on the album's directory name
  const jsonFile = `${album.name.toLowerCase()}.json`;
  const jsonPath = pathJoin(metadataOutput, jsonFile);
  writeFileSync(jsonPath, JSON.stringify(newMetadata));
}
```

# API

See [API documentation](docs/photo-dir-to-json.md) for more information and more
examples.

# License

[MIT License](/LICENSE.txt).