/**
 * @file src/utils/log.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */
/* eslint no-console: 'off' */

import os from 'os'
import util from 'util'
import path from 'path'
import strip from 'strip-ansi'
import { writeFileSync } from 'fs'

/**
 * Selected colors - borrowed from `debug`.
 */
const colors = [2, 3, 4, 5, 1]

/**
 * This color is reserved for `hopp` logs.
 */
const HOPP_COLOR = 6

/**
 * Manage distributed colors.
 */
let color = -1
function nextColor () {
  color += 1
  color = color === colors.length ? 0 : color

  return colors[color]
}

/**
 * Basic attempt to figure out if colors should
 * be used or not.
 */
const useColors = process.stdout.isTTY

/**
 * Create error mark.
 */
const ERROR = useColors ? '\u001b[31m✖\u001b[39m' : '✖'

/**
 * Warning. npm-style.
 */
const WARN = useColors ? '\u001b[43m\u001b[30mWARN\u001b[39m\u001b[49m' : 'WARN'

/**
 * Wraps a string with color escapes.
 */
function wrapColor (str) {
  const color = str === 'hopp' ? HOPP_COLOR : nextColor()
  return useColors ? `\u001b[3${color}m${str}\u001b[39m` : str
}

/**
 * Dimify string.
 */
function dim (str) {
  return `\u001b[90m${str}\u001b[39m`
}

/**
 * Complete record of logging events.
 */
const debugOutput = []

/**
 * Create generic logger function.
 */
function fmt (namespace, log) {
  return function (msg) {
    const args = [` ${log === 'error' ? ERROR : ' '} ${namespace} ${log === 'debug' ? dim(msg) : msg}${log === 'warn' ? ' ' + WARN : ''}`]

    for (let i = 1; i < arguments.length; i++) {
      args.push(arguments[i])
    }

    // create log string
    const str = util.format.apply(console, args)

    // add to record
    debugOutput.push(str)

    // log to console
    if (log !== 'debug' || process.env.HOPP_DEBUG === 'true') {
      return console[log === 'debug' || log === 'warn' ? 'error' : log](str)
    }
  }
}

/**
 * Cache loggers for repeat calls.
 */
const cache = Object.create(null)

/**
 * Create debug-like loggers attached to given
 * namespace & stdout+stderr.
 * @param {String} namespace the namespace to lock your logger into
 * @return {Object} contains log, debug, and error methods
 */
module.exports = namespace => {
  // check cache
  const nm = namespace
  if (cache[nm]) return cache[nm]

  // colorize namespace
  namespace = wrapColor(namespace)

  // return loggers
  return (cache[nm] = {
    log: fmt(namespace, 'log'),
    debug: fmt(namespace, 'debug'),
    error: fmt(namespace, 'error'),
    warn: fmt(namespace, 'warn')
  })
}

/**
 * Write debug log to file on failure.
 */
module.exports.saveLog = directory => {
  writeFileSync(path.join(directory, 'hopp-debug.log'), debugOutput.map(strip).join(os.EOL))

  console.error('\nSaved debug info to: %s.', directory)
  console.error('Please use this log file to submit an issue @ %shttps://github.com/hoppjs/hopp/issues%s.', '\u001B[4m', '\u001B[24m')
}
