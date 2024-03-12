# photo-dir-to-json

A collection of useful (to me, anyway) functions to emit structured JSON data
from a portfolio of photos saved and organized in local directories.

This is mainly intended for occasional processing of image directories during a
publish step. It will process folders containing sets of image files and provide
a JSON objects that collect metadata related to that album (like its
description) and brief display-related metadata for the photos in the album
(e.g., width, height, filename, date).

This is not meant to be used directly in a Node-based server application.
Instead, use this library as part of a publish process and ingest the emitted
JSON file in your server or static web page builder.

# Installation

With NPM:

`npm install photo-dir-to-json`

or with Yarn:

`yarn add photo-dir-to-json`

# Directory structure

All photos are expected to be JPEG, PNG, or WebP types by default with
extensions `jpg`, `jpeg`, `png`, or `webp`. Additional image types are possible,
limited by valid types that can be read by the [ExifReader
library](https://github.com/mattiasw/ExifReader#readme).

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

# Input album metadata

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

# Examples

## Load a portfolio, save one album's metadata

```ts
import { Portfolio } from 'photo-dir-to-json';

const path = '/Volumes/Photos/Portfolio';
const portfolio = new Portfolio(path, {
    metadataFile: '_metadata.json',
});

const outputJSON = '/srv/website/photo-data/album.json';
await portfolio.albums[0].saveMetadata(outputJSON);
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

## Save all metadata

Load a portfolio, iterate over every album and save each metadata into JSON
files.

```ts
import { Portfolio } from 'photo-dir-to-json';
import { dirname, join } from 'path';

const path = '/Volumes/Photos/Portfolio';
const output = '/srv/website/photo-data';

const portfolio = new Portfolio(path, {
    metadataFile: '_metadata.json',
});

await portfolio.saveAllMetadata((album) => {
  const filepath = join(output, `${album.slug}.json`);

  // create subdirectories in the output dir for slugs that
  // contain the path separator '/'
  mkdirSync(dirname(filepath), { recursive: true });

  return filepath;
});

```

# API

See [API documentation](docs/photo-dir-to-json.md) for more information and more
examples.

# License

[MIT License](/LICENSE.txt).