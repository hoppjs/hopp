/**
 * @file index.src.js
 * @license MIT
 */

import notifier from 'node-notifier'

/**
 * For node v4.
 */
require('regenerator-runtime/runtime')

/**
 * Find difference.
 */
function diff (strA, strB) {
  for (let i = 0; i < Math.min(strA.length, strB.length); i++) {
    if (strA[i] !== strB[i]) {
      return `${strA.substr(i)} -> ${strB.substr(i)}`
    }
  }

  return strA
}

export default async (ctx, data) => {
  if (data.done) {
    notifier.notify(Object.assign({
      title: 'Build completed!',
      message: diff(data.file, data.dest)
    }, ctx.args[0] || {}))
  }

  return data
}
