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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/log.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */
/* eslint no-console: 'off' */

/**
 * Selected colors - borrowed from `debug`.
 */
var colors = [2, 3, 4, 5, 1];

/**
 * This color is reserved for `hopp` logs.
 */
var HOPP_COLOR = 6;

/**
 * Manage distributed colors.
 */
var color = -1;
function nextColor() {
  color += 1;
  color = color === colors.length ? 0 : color;

  return colors[color];
}

/**
 * Basic attempt to figure out if colors should
 * be used or not.
 */
var useColors = process.stdout.isTTY;

/**
 * Create error mark.
 */
var ERROR = useColors ? '\x1B[31m\u2716\x1B[39m' : '✖';

/**
 * Wraps a string with color escapes.
 */
function wrapColor(str) {
  var color = str === 'hopp' ? HOPP_COLOR : nextColor();
  return useColors ? '\x1B[3' + color + 'm' + str + '\x1B[39m' : str;
}

/**
 * Dimify string.
 */
function dim(str) {
  return '\x1B[90m' + str + '\x1B[39m';
}

/**
 * Complete record of logging events.
 */
var debugOutput = [];

/**
 * Create generic logger function.
 */
function fmt(namespace, log) {
  return function (msg) {
    var str = _util2.default.format.apply(console, [' ' + (log === 'error' ? ERROR : ' ') + ' ' + namespace + ' ' + (log === 'debug' ? dim(msg) : msg)].concat([].slice.call(arguments, 1)));

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
var cache = {};

/**
 * Create debug-like loggers attached to given
 * namespace & stdout+stderr.
 * @param {String} namespace the namespace to lock your logger into
 * @return {Object} contains log, debug, and error methods
 */
module.exports = function (namespace) {
  // check cache
  var nm = namespace;
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
module.exports.saveLog = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _fs.writeFile)(_path2.default.join(directory, 'hopp-debug.log'), debugOutput.join(_os2.default.EOL));

          case 2:

            console.error('\nSaved debug info to: %s.', directory);
            console.error('Please use this log file to submit an issue @ %shttps://github.com/hoppjs/hopp/issues%s.', '\x1B[4m', '\x1B[24m');

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=log.js.map