/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import path from 'path'
import loadPlugins from './plugins/load'
import Hopp from './tasks/mgr'

const { log, debug, error } = require('./utils/log')('hopp')

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
    
    Hopp.prototype[plugName] = function () {
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
  return src => new Hopp(src)
}