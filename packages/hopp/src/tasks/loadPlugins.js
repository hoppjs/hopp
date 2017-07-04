/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import { stat, exists } from '../fs'
import * as cache from '../cache'

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
export default async directory => {
  const pkgFile = directory + '/package.json'

  // ignore if there is no package.json file
  if (!await exists(pkgFile)) {
    return
  }

  const pkg = require(pkgFile)
  const pkgStat = +(await stat(pkgFile)).mtime

  let [savedStat, list] = cache.val('pl') || [0, {}]

  /**
   * Return cached result if unmodified.
   */
  if (savedStat === pkgStat) {
    return list
  }

  /**
   * Filter for appropriate dependencies.
   */
  list = {}
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg.hasOwnProperty(key)) {
      for (const dep in pkg[key]) {
        if (pkg[key].hasOwnProperty(dep)) {
          const start = dep.substr(0, 12)

          if (start === 'hopp-plugin-' || start === 'hopp-preset-') {
            list[dep] = Object.keys(
              require(`${directory}/node_modules/${dep}`)
            )
          }
        }
      }
    }
  }

  /**
   * Store in cache.
   */
  cache.val('pl', [
    pkgStat,
    list
  ])

  /**
   * Return saved list.
   */
  return list
}
