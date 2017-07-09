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
 * 
 * suffix and prefix features
 * @param suffix || null @param prefix || null
 * appending additional suffix and prefix to each data.
 */
export default async (ctx, data) => {
  /**
   * unexpected num of arguments handling
   */
  if (ctx.args.length > 1) {
    throw new Error('Unexpected numbers of arguments.')
  }

  /**
   * options assign
   */
  var opts = Object.assign({}, ctx.args[0] || {})

  // suffix 
  if (opts.suffix) {
    data.size += opts.suffix.length
    data.body = Buffer.from(opts.suffix + data.body.toString())
  }

  // prefix
  if (opts.prefix) {
    data.size += opts.prefix.length
    data.body = Buffer.from(data.body.toString() + opts.prefix)
  }

  return data
}
