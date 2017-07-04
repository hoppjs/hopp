/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc..
 */

import path from 'path'
import Hopp from './tasks/mgr'
import * as cache from './cache'
import createSteps from './tasks/steps'
import createWatch from './tasks/watch'
import loadPlugins from './tasks/loadPlugins'
import createParallel from './tasks/parallel'

const { debug } = require('./utils/log')('hopp')

/**
 * Normalizes a plugin/preset name to be added to
 * the prototype.
 */
function normalize (name) {
  let normalized = ''

  for (let i = 12; i < name.length; i += 1) {
    normalized += name[i] === '-' ? name[i++].toUpperCase() : name[i]
  }

  return normalized
}

/**
 * Generates a proxy method that allows all the plugin calls to be
 * cached.
 * 
 * Instead of actually loading the plugin at this stage, we will just
 * pop its call into our internal call stack for use later. this is
 * useful when we are stepping through an entire hoppfile but might
 * only be running a single task.
 */
function createMethod (type, name, plugName, method, directory) {
  return function () {
    const args = [...arguments]

    if (type === 'plugin') {
      this.d.stack.push([
        name,
        args,
        method
      ])
    } else {
      const preset = require(path.resolve(directory, 'node_modules', name))
      const substack = preset.apply(null, args)

      substack.forEach(row => {
        const [name] = row

        if (name[0] === '/') {
          this.d.stack.push(row)
        } else {
          this[name].apply(this, row[1])
        }
      })
    }

    return this
  }
}

/**
 * Add single plugin to prototype.
 */
function addPlugin (name, plugins, directory) {
  const type = name.indexOf('plugin') !== -1 ? 'plugin' : 'preset'
  const plugName = normalize(name)

  debug('adding %s %s as %s', type, name, plugName)

  // check for conflicts
  if (Hopp.prototype.hasOwnProperty(plugName)) {
    throw new Error(`Conflicting ${type}: ${name} (${plugName} already exists)`)
  }

  // add the plugin to the hopp prototype so it can be
  // used for the rest of the build process
  // this function is the proxy of the 'default' function
  Hopp.prototype[plugName] = createMethod(type, name, plugName, 'default', directory)

  // add any other methods
  for (const method of plugins[name]) {
    if (method !== '__esModule' && method !== 'config' && method !== 'default') {
      Hopp.prototype[plugName][method] = createMethod(type, name, plugName, method, directory)
    }
  }
}

/**
 * Create hopp object based on plugins.
 */
export default directory => {
  const plugins = loadPlugins(directory)

  for (const name in plugins) {
    addPlugin(name, plugins, directory)
  }

  /**
   * Expose hopp class for task creation.
   */
  const init = src => new Hopp(src)

  init.all = createParallel
  init.steps = createSteps
  init.watch = createWatch

  /**
   * API for loading local plugins.
   */
  init.load = function (pathToPlugin) {
    debug('loading local plugin: %s', pathToPlugin)

    // try and grab name from package.json
    // otherwise use the directory's name
    const pluginName = (() => {
      try {
        return require(pathToPlugin + '/package.json').name
      } catch (_) {
        return path.basename(pathToPlugin)
      }
    })()

    // add to list
    plugins[pluginName] = Object.keys(require(pathToPlugin))

    // run normal add
    addPlugin(pluginName, plugins, directory)
  }

  return init
}
