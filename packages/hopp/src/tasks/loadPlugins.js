/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import { stat } from '../fs'
import * as cache from '../cache'

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
export default async directory => {
  const pkgFile = directory + '/package.json'
  const pkg = require(pkgFile)
  const pkgStat = +(await stat(pkgFile)).mtime

  let [savedStat, list] = cache.val('pl') || []

  /**
   * Return cached result if unmodified.
   */
  if (savedStat === pkgStat) {
    return list
  }

  /**
   * Filter for appropriate dependencies.
   */
  list = [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.devDependencies || {}),
    Object.keys(pkg.peerDependencies || {})
  ).filter(dep => {
    const start = dep.substr(0, 12)
    return start === 'hopp-plugin-' || start === 'hopp-preset-'
  })

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
