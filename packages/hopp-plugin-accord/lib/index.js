/**
 * @file index.src.js
 * @license MIT
 */

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
  const options = ctx.args[1] || {}

  // compile with accord
  data.body = (await accord.load(ctx.args[0]).render(data.body.toString('utf8'), options)).result

  // continue
  return data
}
