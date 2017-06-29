/**
 * @file src/plugins/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Loads the list of plugins defined in the package.json.
 * @param {String} path to directory with package.json
 * @return {Promise} resolves with array of paths to plugins
 */
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
  ).filter(dep => {
    const start = dep.substr(0, 12)
    return start === 'hopp-plugin-' || start === 'hopp-preset-'
  })
}
