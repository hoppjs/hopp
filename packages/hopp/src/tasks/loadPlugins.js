/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import * as cache from '../cache'
import { statSync, existsSync } from 'fs'

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
export default directory => {
  const pkgFile = directory + '/package.json'

  // ignore if there is no package.json file
  if (!existsSync(pkgFile)) {
    return
  }

  const pkg = require(pkgFile)
  const pkgStat = +statSync(pkgFile).mtime

  let [savedStat, list] = cache.val('pl') || []

  /**
   * Return cached result if unmodified.
   */
  if (savedStat === pkgStat) {
    return [true, list]
  }

  /**
   * Filter for appropriate dependencies.
   */
  list = Object.create(null)
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg.hasOwnProperty(key)) {
      for (const dep in pkg[key]) {
        const start = dep.substr(0, 12)

        if (start === 'hopp-plugin-' || start === 'hopp-preset-') {
          list[dep] = Object.keys(
            require(`${directory}/node_modules/${dep}`)
          )
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
  return [false, list]
}
