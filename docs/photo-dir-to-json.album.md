<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [photo-dir-to-json](./photo-dir-to-json.md) &gt; [Album](./photo-dir-to-json.album.md)

## Album class

The Album class represents a local directory of photos and an optional input metadata JSON file that conforms to [metadataSchema](./photo-dir-to-json.metadataschema.md)<!-- -->. The class collates information about each photo inside of the album directory, combines it with the (optional but recommended) input metadata and provides it all in a single [albumSchema](./photo-dir-to-json.albumschema.md) metadata object.

**Signature:**

```typescript
export declare class Album 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(path, options)](./photo-dir-to-json.album._constructor_.md) |  | Constructs a new instance of the <code>Album</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [name](./photo-dir-to-json.album.name.md) | <code>readonly</code> | string | The on-disk name of the album's directory. If the path is <code>/Volume/Photos/Album1</code> the name is <code>Album1</code>. |
|  [path](./photo-dir-to-json.album.path.md) | <code>readonly</code> | string | On-disk path to the album, e.g. <code>/Volume/Photos/Album1</code>. |
|  [photos](./photo-dir-to-json.album.photos.md) | <code>readonly</code> | [Photo](./photo-dir-to-json.photo.md)<!-- -->\[\] | List of Photo classes for all images found in the album path. Only files with extensions from [\`allowedExtensions\` property](./photo-dir-to-json.albumoptions.md) are processed, all others are ignored. Any ignored file extensions not specified in [\`skippedExtensions\` property](./photo-dir-to-json.albumoptions.md) prints a warning to the console notifying you that they were skipped. |
|  [slug](./photo-dir-to-json.album.slug.md) | <code>readonly</code> | string | The <code>slug</code> field defined in the Album metadata, defaulting to the Album's on-disk directory name lower cased. For example, if the slug is not specified in the input metadata, the slug for an album located at <code>/Volume/Photos/Album1</code> becomes <code>album1</code>. |
|  [title](./photo-dir-to-json.album.title.md) | <code>readonly</code> | string | By default, album title is the album directory name but is overridden by the <code>title</code> property in album metadata when supplied. |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [metadata()](./photo-dir-to-json.album.metadata.md) |  | Returns the full metadata for the album including all photos inside. |
|  [saveMetadata(file)](./photo-dir-to-json.album.savemetadata.md) |  | Write the Album's generated metadata to a JSON file on disk. Please ensure the directories exist and the caller has permissions to write to the path. The file at the specified path will be overwritten if it exists. |
