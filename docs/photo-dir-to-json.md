<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [photo-dir-to-json](./photo-dir-to-json.md)

## photo-dir-to-json package

A library to emit structured JSON data from a portfolio of photos saved and organized in local directories.

## Remarks

The primary [Album](./photo-dir-to-json.album.md) class assumes a directory on disk that contains one or more photo files. A convenience [Portfolio](./photo-dir-to-json.portfolio.md) class can be used to quickly process a directory that contains albums as children.

## Classes

|  Class | Description |
|  --- | --- |
|  [Album](./photo-dir-to-json.album.md) | The Album class represents a local directory of photos and an optional input metadata JSON file that conforms to [metadataSchema](./photo-dir-to-json.metadataschema.md)<!-- -->. The class collates information about each photo inside of the album directory, combines it with the (optional but recommended) input metadata and provides it all in a single [albumSchema](./photo-dir-to-json.albumschema.md) metadata object. |
|  [Photo](./photo-dir-to-json.photo.md) | Photo class represents a single photo file. It allows for easy fetch of photo metadata (see [photoSchema](./photo-dir-to-json.photoschema.md)<!-- -->). |
|  [Portfolio](./photo-dir-to-json.portfolio.md) | Portfolio is a convenience class that automatically creates Album class instances for all subdirectories of a provided path. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [AlbumOptions](./photo-dir-to-json.albumoptions.md) | Optional album configuration. |
|  [PortfolioOptions](./photo-dir-to-json.portfoliooptions.md) | Optional Portfolio configuration. Include properties of [AlbumOptions](./photo-dir-to-json.albumoptions.md) that you would like passed to each Album instance. |

## Variables

|  Variable | Description |
|  --- | --- |
|  [albumSchema](./photo-dir-to-json.albumschema.md) | <p>Metadata output by this library. It consists of passed-through input metadata conforming to [metadataSchema](./photo-dir-to-json.metadataschema.md) combined with an array of [photoSchema](./photo-dir-to-json.photoschema.md) metadata for all photos inside the album directory.</p><p>Use this schema in your downstream application to easily load the JSON files, see the example under [albumSchemaType](./photo-dir-to-json.albumschematype.md)<!-- -->.</p> |
|  [metadataSchema](./photo-dir-to-json.metadataschema.md) | A schema corresponding to the input metadata for this library. |
|  [photoSchema](./photo-dir-to-json.photoschema.md) | <p>Metadata output by this library for a single image. This is not meant to be full EXIF data, just enough information about the photo to be useful to sort, display, appropriately size, and provide meaningful <code>alt</code> tag for the photo and its thumbnails on a website.</p><p>This schema is usually used in the context of albumSchema.</p><p>For more information on how the date field is processed see remarks under [Photo.metadata()](./photo-dir-to-json.photo.metadata.md)<!-- -->.</p> |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [albumSchemaType](./photo-dir-to-json.albumschematype.md) | A TypeScript type of [albumSchema](./photo-dir-to-json.albumschema.md)<!-- -->. |
|  [metadataSchemaType](./photo-dir-to-json.metadataschematype.md) | A TypeScript type of [metadataSchema](./photo-dir-to-json.metadataschema.md)<!-- -->. |
|  [photoSchemaType](./photo-dir-to-json.photoschematype.md) | A TypeScript type of [photoSchema](./photo-dir-to-json.photoschema.md)<!-- -->. |

