/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import glob from 'glob'
import * as cache from './cache'

export default (pattern, cwd) => new Promise((resolve, reject) => {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern]
  }

  let files = []
  const caches = cache.val('gc') || {}

  // glob eval all
  Promise.all(pattern.map(pttn => new Promise(res => {
    const opts = { cwd }

    if (caches[pttn]) {
      opts.cache = caches[pttn]
    }

    caches[pttn] = (new glob.Glob(pttn, opts, (err, results) => {
      if (err) reject(err)
      else {
        files = files.concat(results)
        res()
      }
    })).cache
  }))).then(() => {
    cache.val('gc', caches)
    resolve(files)
  })
})