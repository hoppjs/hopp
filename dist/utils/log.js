'use strict';

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _fs = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Selected colors - borrowed from `debug`.
 */
const colors = [2, 3, 4, 5, 1];

/**
 * This color is reserved for `hopp` logs.
 */
/**
 * @file src/utils/log.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */
/* eslint no-console: 'off' */

const HOPP_COLOR = 6;

/**
 * Manage distributed colors.
 */
let color = -1;
function nextColor() {
  color += 1;
  color = color === colors.length ? 0 : color;

  return colors[color];
}

/**
 * Basic attempt to figure out if colors should
 * be used or not.
 */
const useColors = process.stdout.isTTY;

/**
 * Create error mark.
 */
const ERROR = useColors ? '\u001b[31m✖\u001b[39m' : '✖';

/**
 * Wraps a string with color escapes.
 */
function wrapColor(str) {
  const color = str === 'hopp' ? HOPP_COLOR : nextColor();
  return useColors ? `\u001b[3${color}m${str}\u001b[39m` : str;
}

/**
 * Dimify string.
 */
function dim(str) {
  return `\u001b[90m${str}\u001b[39m`;
}

/**
 * Complete record of logging events.
 */
const debugOutput = [];

/**
 * Create generic logger function.
 */
function fmt(namespace, log) {
  return function (msg) {
    const str = _util2.default.format.apply(console, [` ${log === 'error' ? ERROR : ' '} ${namespace} ${log === 'debug' ? dim(msg) : msg}`].concat([].slice.call(arguments, 1)));

    // add to record
    debugOutput.push((0, _stripAnsi2.default)(str));

    // log to console
    if (log !== 'debug' || process.env.HOPP_DEBUG !== 'false') {
      return console[log === 'debug' ? 'error' : log](str);
    }
  };
}

/**
 * Cache loggers for repeat calls.
 */
const cache = {};

/**
 * Create debug-like loggers attached to given
 * namespace & stdout+stderr.
 * @param {String} namespace the namespace to lock your logger into
 * @return {Object} contains log, debug, and error methods
 */
module.exports = namespace => {
  // check cache
  const nm = namespace;
  if (cache[nm]) return cache[nm];

  // colorize namespace
  namespace = wrapColor(namespace);

  // return loggers
  return cache[nm] = {
    log: fmt(namespace, 'log'),
    debug: fmt(namespace, 'debug'),
    error: fmt(namespace, 'error')
  };
};

/**
 * Write debug log to file on failure.
 */
module.exports.saveLog = async directory => {
  await (0, _fs.writeFile)(_path2.default.join(directory, 'hopp-debug.log'), debugOutput.join(_os2.default.EOL));

  console.error('\nSaved debug info to: %s.', directory);
  console.error('Please use this log file to submit an issue @ %shttps://github.com/hoppjs/hopp/issues%s.', '\u001B[4m', '\u001B[24m');
};
//# sourceMappingURL=log.js.map