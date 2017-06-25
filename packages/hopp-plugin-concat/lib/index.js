/**
 * @file index.src.js
 * @license MIT
 */

/**
 * For node v4.
 */
require('regenerator-runtime/runtime')

/**
 * This enables the concatenation.
 */
export const config = {
  mode: 'buffer',
  bundle: true
}

/**
 * We don't need to do any real transformation.
 */
export default async (ctx, data) => {
  return data
}
