/**
 * @file index.src.js
 * @license MIT
 */

require('regenerator-runtime/runtime')

const fs = require('fs')
const path = require('path')
const babel = require('babel-core')

/**
 * Buffering is needed for babel.
 */
export const config = {
  mode: 'buffer'
}

/**
 * Proxy babel-core.
 */
export default async (ctx, data) => {
  if (ctx.args.length > 1) {
    throw new Error('Unexpected number of arguments.')
  }

  /**
   * Add file metadata to babel options.
   */
  const options = Object.assign({}, ctx.args[0] || {}, {
    filename: path.basename(data.file)
  })

  /**
   * Transform via babel.
   */
  const output = babel.transform(data.body, options)

  /**
   * Write sourcemap.
   */
  if (options.sourceMap) {
    await new Promise((resolve, reject) => {
      fs.writeFile(data.dest.substr(0, data.dest.lastIndexOf('.')) + '.map', JSON.stringify(output.map), err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  /**
   * Replace code.
   */
  data.body = `${output.code}\n\n//# sourceMappingURL=${path.basename(data.dest)}.map`

  /**
   * Return final object.
   */
  return data
}
