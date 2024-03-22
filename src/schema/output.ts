import * as z from 'zod';
import { metadataSchema } from './metadata.js';

/**
 * Metadata output by this library for a single image. This is not meant to be
 * full EXIF data, just enough information about the photo to be useful to sort,
 * display, appropriately size, and provide meaningful `alt` tag for the photo
 * and its thumbnails on a website.
 *
 * This schema is usually used in the context of albumSchema.
 *
 * For more information on how the date field is processed see remarks under
 * {@link Photo.metadata}.
 * @example Sample metadata corresponding to this schema
 * ```json
 * {
 *   "filename": "IMG_2851.jpg", // on-disk file name
 *   "date": "2009-12-09T00:33:19.000Z", // date taken in ISO-8601 format
 *   "width": 1064, // photo width in pixels
 *   "height": 1600, // photo height in pixels
 *   "landscape": false, // true if width is greater than height
 *   "id": "image-id-str", // XMP (Dublin Core) `dc:identifier`, if present
 *   "alt": "Photo description", // XMP `dc:description`, if present
 * }
 * ```
 * @public
 */
export const photoSchema = z
    .object({
        filename: z.string(),
        date: z.string(),
        landscape: z.boolean(),
        width: z.number(),
        height: z.number(),
        id: z.string().optional(),
        alt: z.string().optional(),
    })
    .strict();

/**
 * A TypeScript type of {@link photoSchema}.
 * @public
 */
export type photoSchemaType = z.infer<typeof photoSchema>;

/**
 * Metadata output by this library. It consists of passed-through input metadata
 * conforming to {@link metadataSchema} combined with an array of
 * {@link photoSchema} metadata for all photos inside the album directory.
 *
 * Use this schema in your downstream application to easily load the JSON files,
 * see the example under {@link albumSchemaType}.
 *
 * @remarks
 * Although the schema extends {@link metadataSchema}, several of the fields are
 * no longer optional and are written with defaults by the library:
 *
 * 1. `title` defaults to album on-disk folder name, case preserved (e.g.
 *    'Album1')
 *
 * 2. `slug` defaults to album on-disk folder name, lower cased (e.g. 'album1')
 *
 * 3. `unlisted` defaults to false
 *
 * @example Sample output JSON file
 * ```json
 * {
 *   "title": "My Album",
 *   "description": "An album of photos",
 *   "thumb": "IMG_2851.jpg",
 *   "slug": "my-album",
 *   "unlisted": "false",
 *   "keywords": ["array of keywords", "landscapes", "art"],
 *   "order": ["IMG_2944.jpg", "IMG_2851.jpg"],
 *   "photos": [{
 *     "filename": "IMG_2851.jpg",
 *     "date": "2009-12-09T00:33:19.000Z",
 *     "width": 1064,
 *     "height": 1600,
 *     "landscape": false
 *   },
 *   {
 *     "filename": "IMG_2944.jpg",
 *     "date": "2009-12-09T00:36:57.000Z",
 *     "width": 1600,
 *     "height": 1064,
 *     "landscape": true
 *   }]
 * }
 * ```
 * @public
 */
export const albumSchema = metadataSchema
    .extend({
        unlisted: z.boolean(),
        slug: z.string(),
        photos: z.array(photoSchema),
    })
    .strict();

/**
 * A TypeScript type of {@link albumSchema}.
 * @example Bring type awareness to your application when loading a file
 *  that conforms to albumSchema.
 *
 * ```ts
 * import { albumSchemaType, albumSchema } from 'photo-dir-to-json';
 *
 * function loadAlbumMetadata(file: string): albumSchemaType {
 *   const contents = readFileSync(file, 'utf8');
 *   return albumSchema.parse(JSON.parse(contents));
 * }
 * ```
 * @public
 */
export type albumSchemaType = z.infer<typeof albumSchema>;
