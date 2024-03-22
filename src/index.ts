/**
 * A library to emit structured JSON data from a portfolio of photos saved and
 * organized in local directories.
 *
 * @remarks
 * The primary {@link Album} class assumes a directory on disk that contains
 * one or more photo files. A convenience {@link Portfolio} class can be
 * used to quickly process a directory that contains albums as children.
 *
 * @packageDocumentation
 */

export { Portfolio, PortfolioOptions } from './portfolio.js';
export { Album, AlbumOptions } from './album.js';
export { Photo } from './photo.js';
export { metadataSchema, albumSchema, photoSchema } from './schema/index.js';
export type {
    metadataSchemaType,
    albumSchemaType,
    photoSchemaType,
} from './schema/index.js';

import { Portfolio } from './portfolio.js';
export default Portfolio;
