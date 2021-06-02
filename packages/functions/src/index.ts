/**
 * # Functions
 *
 * Common glTF modifications, written using the core API.
 *
 * Most of these functions are _Transforms_, applying a modification to the {@link Document}, used
 * with {@link Document.transform}. This project includes many common transforms already, and
 * others can be quickly implemented using the same APIs. Other functions, like {@link bounds},
 * provide non-mutating functionality on top of the existing glTF-Transform property types.
 *
 * ## Installation
 *
 * Install:
 *
 * ```shell
 * npm install --save @gltf-transform/functions
 * ```
 *
 * Import:
 *
 * ```typescript
 * import { center, quantize, weld } from '@gltf-transform/functions';
 * ```
 *
 * @module functions
 */

export * from './center';
export * from './colorspace';
export * from './dedup';
export * from './inspect';
export * from './instance';
export * from './metal-rough';
export * from './partition';
export * from './prune';
export * from './quantize';
export * from './resample';
export * from './sequence';
export * from './tangents';
export * from './texture-resize';
export * from './unweld';
export * from './weld';
