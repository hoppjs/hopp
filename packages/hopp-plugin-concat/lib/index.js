/**
 * @file index.src.js
 * @license MIT
 */
let tmp = false
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
 * suffix and prefix features added
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
   *  @param suffix adding string at the end of the each file
   *  @param prefix adding string at the beginning of the first packet
   */
  const opts = ctx.args[0] || {}
  
  if (config.bundle && !tmp) {
    // prefix
    if (opts.prefix) {
      data.size += opts.prefix.length
      data.body = opts.prefix + data.body.toString()
    }
    // suffix
    if (opts.suffix) {
      data.size += opts.suffix.length
      data.body = data.body.toString() + opts.suffix
    }
    tmp = true
  }

  return data
}
