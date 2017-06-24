/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc..
 */

import Hopp from './tasks/mgr'
import createSteps from './tasks/steps'
import createWatch from './tasks/watch'
import loadPlugins from './tasks/loadPlugins'
import createParallel from './tasks/parallel'

const { debug } = require('./utils/log')('hopp')

/**
 * Create hopp object based on plugins.
 */
export default async directory => {
  ;(await loadPlugins(directory)).forEach(name => {
    let plugName = ''

    // convert plugin name to camelcase
    for (let i = 12; i < name.length; i += 1) {
      plugName += name[i] === '-' ? name[i++].toUpperCase() : name[i]
    }

    debug('adding plugin %s as %s', name, plugName)

    // add the plugin to the hopp prototype so it can be
    // used for the rest of the build process
    Hopp.prototype[plugName] = function () {
      // instead of actually loading the plugin at this stage,
      // we will just pop its call into our internal call stack
      // for use later. this is useful when we are stepping through
      // an entire hoppfile but might only be running a single task

      this.d.stack.push([
        name,
        [].slice.call(arguments)
      ])

      return this
    }
  })

  /**
   * Expose hopp class for task creation.
   */
  const init = src => new Hopp(src)

  init.all = createParallel
  init.steps = createSteps
  init.watch = createWatch

  return init
}
