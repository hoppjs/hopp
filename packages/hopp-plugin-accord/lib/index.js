/**
 * @file index.src.js
 * @license MIT
 */

import fs from 'fs'
import path from 'path'
import accord from 'accord'

/**
 * For node v4.
 */
require('regenerator-runtime/runtime')

/**
 * Config defaults.
 */
export const config = {
  mode: 'buffer'
}

export default async (ctx, data) => {
  if (ctx.args.length !== 1 && ctx.args.length !== 2) {
    throw new Error('Unexpected number of arguments.')
  }

  // get options
  const options = Object.assign({}, ctx.args[1] || {})

  // compile with accord
  const compiled = await accord.load(ctx.args[0]).render(data.body.toString('utf8'), options)

  // generate source map
  if (options.sourcemap) {
    await new Promise((resolve, reject) => {
      fs.writeFile(data.dest + '.map', JSON.stringify(compiled.sourcemap), err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  // set code
  data.body = compiled.result

  // add sourcemap link
  if (options.sourcemap) {
    data.body += `\n\n//# sourceMappingURL=${path.basename(data.dest)}.map`
  }

  // continue
  return data
}
