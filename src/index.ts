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

export { Portfolio, PortfolioOptions } from './portfolio';
export { Album, AlbumOptions } from './album';
export { Photo } from './photo';
export { metadataSchema, albumSchema, photoSchema } from './schema';
export type {
    metadataSchemaType,
    albumSchemaType,
    photoSchemaType
} from './schema';

import { Portfolio } from './portfolio';
export default Portfolio;