/**
 * @file src/modified.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import * as cache from './cache'
import UN from './utils/uninum'
import { stat } from './fs'

let statCache

export default async files => {
  const mod = []

  /**
   * Load from cache.
   */
  if (statCache === undefined) {
    statCache = cache.val('sc') || {}
  }

  /**
   * Update cache.
   */
  for (let file of files) {
    const lmod = +(await stat(file)).mtime

    if (lmod !== statCache[file]) {
      statCache[file] = lmod
      mod.push(file)
    }
  }

  cache.val('sc', statCache)

  // end
  return mod
}