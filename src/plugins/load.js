/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'

export default async directory => {
  const pkg = (() => {
    try {
      return require(directory + '/package.json')
    } catch (_) {
      return {}
    }
  })()

  /**
   * Filter for appropriate dependencies.
   */
  return [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.devDependencies || {}),
    Object.keys(pkg.peerDependencies || {})
  ).filter(dep => dep.startsWith('hopp-'))
   .map(dep => `${directory}/node_modules/${dep}`)
}