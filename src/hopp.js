/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'
import Hopp from './tasks/mgr'
import createWatch from './tasks/watch'
import loadPlugins from './plugins/load'
import createParallel from './tasks/parallel'

const { debug } = require('./utils/log')('hopp')

/**
 * Create hopp object based on plugins.
 */
export default async directory => {
  ;(await loadPlugins(directory)).forEach(name => {
    let plugName = ''

    for (let i = 5; i < name.length; i += 1) {
      plugName += name[i] === '-' ? name[i++].toUpperCase() : name[i]
    }

    debug('adding plugin %s', name)
    
    // add the plugin to the hopp prototype so it can be
    // used for the rest of the build process
    Hopp.prototype[plugName] = function () {
      // instead of actually loading the plugin at this stage,
      // we will just pop its call into our internal call stack
      // for use later. this is useful when we are stepping through
      // an entire hoppfile but might only be running a single task

      this.callStack.push([
        name,
        arguments
      ])

      return this
    }
  })

  /**
   * Expose hopp class for task creation.
   */
  const init = src => new Hopp(src)
  
  init.all = createParallel
  init.watch = createWatch

  return init
}