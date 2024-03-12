<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [photo-dir-to-json](./photo-dir-to-json.md) &gt; [metadataSchema](./photo-dir-to-json.metadataschema.md)

## metadataSchema variable

A schema corresponding to the input metadata for this library.

**Signature:**

```typescript
metadataSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    thumb: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    unlisted: z.ZodOptional<z.ZodBoolean>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
    thumb?: string | undefined;
    slug?: string | undefined;
    unlisted?: boolean | undefined;
    keywords?: string[] | undefined;
}, {
    title: string;
    description?: string | undefined;
    thumb?: string | undefined;
    slug?: string | undefined;
    unlisted?: boolean | undefined;
    keywords?: string[] | undefined;
}>
```

## Remarks

JSON files that conform to this schema should be stored alongside or near albums on disk. You can use the schema and corresponding type in your own applications if you'd like to easily write scripts that conform to the spec, or use this information to hand-write your own.

If specified, the Album class will validate that the `thumb` value is actually a file that exists in the album directory.

All remaining metadata has no meaning to this library and it is intended to just collect and emit metadata from your portfolio to your publishing app.

If you provide a JSON file, only `title` is required, all other fields are optional.

## Example

Contents of a metadata json file validated with this schema

```json
{
  "title": "My Album",
  "description": "An album of photos",
  "thumb": "IMG_1234.jpg",
  "slug": "my-album",
  "unlisted": "false",
  "keywords": ["array of keywords", "landscapes", "art"]
}
```
