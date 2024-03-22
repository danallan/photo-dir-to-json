import * as z from 'zod';

/**
 * A schema corresponding to the input metadata for this library.
 * @remarks
 * JSON files that conform to this schema should be stored alongside or near
 * albums on disk. You can use the schema and corresponding type in your own
 * applications if you'd like to easily write scripts that conform to the spec,
 * or use this information to hand-write your own.
 *
 * If specified, the Album class will validate that the `thumb` value is
 * actually a file that exists in the album directory with an extension that is
 * specified in {@link AlbumOptions | AlbumOptions.allowedExtensions}.
 *
 * Similarly, if specified, the Album class will validate that all items in the
 * `order` array are files that exist in the album directory with exensions
 * specified in {@link AlbumOptions | AlbumOptions.allowedExtensions}. It is not
 * required for you to specify all or even any of the photos in the `order`
 * property. Your downstream app should handle a partially defined ordering
 * accordingly.
 *
 * All remaining metadata has no meaning to this library and it is intended to
 * just collect and emit metadata from your portfolio to your publishing app.
 *
 * If you provide a JSON file, only `title` is required, all other fields are
 * optional.
 * @example Contents of a metadata json file validated with this schema
 * ```json
 * {
 *   "title": "My Album",
 *   "description": "An album of photos",
 *   "thumb": "IMG_1234.jpg",
 *   "slug": "my-album",
 *   "unlisted": "false",
 *   "keywords": ["array of keywords", "landscapes", "art"],
 *   "order": ["IMG_7890.jpg", "IMG_1234.jpg"]
 * }
 * ```
 * @public
 */
export const metadataSchema = z
    .object({
        title: z.string(),
        description: z.string().optional(),
        /** preferred album thumb image filename in the album */
        thumb: z.string().optional(),
        /** a slug is a URL path, like /photos/album1 */
        slug: z.string().optional(),
        /** an unlisted album is published but not linked to */
        unlisted: z.boolean().optional(),
        /** album-wide keywords for SEO */
        keywords: z.array(z.string()).optional(),
        /** list of image filenames for custom ordering */
        order: z.array(z.string()).optional(),
    })
    .strict();

/**
 * A TypeScript type of {@link metadataSchema}.
 * @example Bring type awareness to your application when writing a file
 *  that conforms to metadataSchema.
 *
 * ```ts
 * import { metadataSchemaType } from 'photo-dir-to-json';
 * import { writeFileSync } from 'fs';
 *
 * const metadata: metadataSchemaType = {
 *   title: "My Album",
 *   description: "An album of photos",
 *   thumb: "IMG_1234.jpg",
 *   slug: "/expected/url/to/MyAlbum",
 * };
 *
 * // write metadata to disk for ingestion by photo-dir-to-json
 * const jsonFile = '/path/to/album/metadata.json';
 * writeFileSync(jsonPath, JSON.stringify(metadata));
 * ```
 *
 * @public
 */
export type metadataSchemaType = z.infer<typeof metadataSchema>;
