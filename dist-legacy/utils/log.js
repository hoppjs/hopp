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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJkZWJ1Z091dHB1dCIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImZvcm1hdCIsImFwcGx5IiwiY29uc29sZSIsImNvbmNhdCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsInB1c2giLCJlbnYiLCJIT1BQX0RFQlVHIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIiwic2F2ZUxvZyIsImRpcmVjdG9yeSIsImpvaW4iLCJFT0wiXSwibWFwcGluZ3MiOiI7O0FBT0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OzsyY0FYQTs7Ozs7QUFLQTs7QUFRQTs7O0FBR0EsSUFBTUEsU0FBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQWY7O0FBRUE7OztBQUdBLElBQU1DLGFBQWEsQ0FBbkI7O0FBRUE7OztBQUdBLElBQUlDLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBU0MsU0FBVCxHQUFxQjtBQUNuQkQsV0FBUyxDQUFUO0FBQ0FBLFVBQVFBLFVBQVVGLE9BQU9JLE1BQWpCLEdBQTBCLENBQTFCLEdBQThCRixLQUF0Qzs7QUFFQSxTQUFPRixPQUFPRSxLQUFQLENBQVA7QUFDRDs7QUFFRDs7OztBQUlBLElBQU1HLFlBQVlDLFFBQVFDLE1BQVIsQ0FBZUMsS0FBakM7O0FBRUE7OztBQUdBLElBQU1DLFFBQVFKLFlBQVksd0JBQVosR0FBc0MsR0FBcEQ7O0FBRUE7OztBQUdBLFNBQVNLLFNBQVQsQ0FBb0JDLEdBQXBCLEVBQTBCO0FBQ3hCLE1BQU1ULFFBQVFTLFFBQVEsTUFBUixHQUFpQlYsVUFBakIsR0FBOEJFLFdBQTVDO0FBQ0EsU0FBT0UsdUJBQXVCSCxLQUF2QixTQUFnQ1MsR0FBaEMsZ0JBQWtEQSxHQUF6RDtBQUNEOztBQUVEOzs7QUFHQSxTQUFTQyxHQUFULENBQWNELEdBQWQsRUFBb0I7QUFDbEIsc0JBQW9CQSxHQUFwQjtBQUNEOztBQUVEOzs7QUFHQSxJQUFNRSxjQUFjLEVBQXBCOztBQUVBOzs7QUFHQSxTQUFTQyxHQUFULENBQWFDLFNBQWIsRUFBd0JDLEdBQXhCLEVBQTZCO0FBQzNCLFNBQU8sVUFBVUMsR0FBVixFQUFlO0FBQ3BCLFFBQU1OLE1BQU0sZUFBS08sTUFBTCxDQUFZQyxLQUFaLENBQ1ZDLE9BRFUsRUFFVixRQUFLSixRQUFRLE9BQVIsR0FBa0JQLEtBQWxCLEdBQTBCLEdBQS9CLFVBQXNDTSxTQUF0QyxVQUFtREMsUUFBUSxPQUFSLEdBQWtCSixJQUFJSyxHQUFKLENBQWxCLEdBQTZCQSxHQUFoRixHQUNHSSxNQURILENBQ1UsR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsRUFBeUIsQ0FBekIsQ0FEVixDQUZVLENBQVo7O0FBTUE7QUFDQVgsZ0JBQVlZLElBQVosQ0FBaUIseUJBQU1kLEdBQU4sQ0FBakI7O0FBRUE7QUFDQSxRQUFJSyxRQUFRLE9BQVIsSUFBbUJWLFFBQVFvQixHQUFSLENBQVlDLFVBQVosS0FBMkIsT0FBbEQsRUFBMkQ7QUFDekQsYUFBT1AsUUFBUUosUUFBUSxPQUFSLEdBQWtCLE9BQWxCLEdBQTRCQSxHQUFwQyxFQUF5Q0wsR0FBekMsQ0FBUDtBQUNEO0FBQ0YsR0FkRDtBQWVEOztBQUVEOzs7QUFHQSxJQUFNaUIsUUFBUSxFQUFkOztBQUVBOzs7Ozs7QUFNQUMsT0FBT0MsT0FBUCxHQUFpQixxQkFBYTtBQUM1QjtBQUNBLE1BQU1DLEtBQUtoQixTQUFYO0FBQ0EsTUFBSWEsTUFBTUcsRUFBTixDQUFKLEVBQWUsT0FBT0gsTUFBTUcsRUFBTixDQUFQOztBQUVmO0FBQ0FoQixjQUFZTCxVQUFVSyxTQUFWLENBQVo7O0FBRUE7QUFDQSxTQUFRYSxNQUFNRyxFQUFOLElBQVk7QUFDbEJmLFNBQUtGLElBQUlDLFNBQUosRUFBZSxLQUFmLENBRGE7QUFFbEJpQixXQUFPbEIsSUFBSUMsU0FBSixFQUFlLE9BQWYsQ0FGVztBQUdsQmtCLFdBQU9uQixJQUFJQyxTQUFKLEVBQWUsT0FBZjtBQUhXLEdBQXBCO0FBS0QsQ0FkRDs7QUFnQkE7OztBQUdBYyxPQUFPQyxPQUFQLENBQWVJLE9BQWY7QUFBQSx1REFBeUIsaUJBQU1DLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQ2pCLG1CQUFVLGVBQUtDLElBQUwsQ0FBVUQsU0FBVixFQUFxQixnQkFBckIsQ0FBVixFQUFrRHRCLFlBQVl1QixJQUFaLENBQWlCLGFBQUdDLEdBQXBCLENBQWxELENBRGlCOztBQUFBOztBQUd2QmpCLG9CQUFRYSxLQUFSLENBQWMsNEJBQWQsRUFBNENFLFNBQTVDO0FBQ0FmLG9CQUFRYSxLQUFSLENBQWMsMEZBQWQsRUFBMEcsU0FBMUcsRUFBdUgsVUFBdkg7O0FBSnVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQXpCOztBQUFBO0FBQUE7QUFBQTtBQUFBIiwiZmlsZSI6ImxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvZy5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuLyogZXNsaW50IG5vLWNvbnNvbGU6ICdvZmYnICovXG5cbmltcG9ydCBvcyBmcm9tICdvcydcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHN0cmlwIGZyb20gJ3N0cmlwLWFuc2knXG5pbXBvcnQgeyB3cml0ZUZpbGUgfSBmcm9tICcuLi9mcydcblxuLyoqXG4gKiBTZWxlY3RlZCBjb2xvcnMgLSBib3Jyb3dlZCBmcm9tIGBkZWJ1Z2AuXG4gKi9cbmNvbnN0IGNvbG9ycyA9IFsyLCAzLCA0LCA1LCAxXVxuXG4vKipcbiAqIFRoaXMgY29sb3IgaXMgcmVzZXJ2ZWQgZm9yIGBob3BwYCBsb2dzLlxuICovXG5jb25zdCBIT1BQX0NPTE9SID0gNlxuXG4vKipcbiAqIE1hbmFnZSBkaXN0cmlidXRlZCBjb2xvcnMuXG4gKi9cbmxldCBjb2xvciA9IC0xXG5mdW5jdGlvbiBuZXh0Q29sb3IoKSB7XG4gIGNvbG9yICs9IDFcbiAgY29sb3IgPSBjb2xvciA9PT0gY29sb3JzLmxlbmd0aCA/IDAgOiBjb2xvclxuXG4gIHJldHVybiBjb2xvcnNbY29sb3JdXG59XG5cbi8qKlxuICogQmFzaWMgYXR0ZW1wdCB0byBmaWd1cmUgb3V0IGlmIGNvbG9ycyBzaG91bGRcbiAqIGJlIHVzZWQgb3Igbm90LlxuICovXG5jb25zdCB1c2VDb2xvcnMgPSBwcm9jZXNzLnN0ZG91dC5pc1RUWVxuXG4vKipcbiAqIENyZWF0ZSBlcnJvciBtYXJrLlxuICovXG5jb25zdCBFUlJPUiA9IHVzZUNvbG9ycyA/ICdcXHUwMDFiWzMxbeKcllxcdTAwMWJbMzltJyA6ICfinJYnXG5cbi8qKlxuICogV3JhcHMgYSBzdHJpbmcgd2l0aCBjb2xvciBlc2NhcGVzLlxuICovXG5mdW5jdGlvbiB3cmFwQ29sb3IoIHN0ciApIHtcbiAgY29uc3QgY29sb3IgPSBzdHIgPT09ICdob3BwJyA/IEhPUFBfQ09MT1IgOiBuZXh0Q29sb3IoKVxuICByZXR1cm4gdXNlQ29sb3JzID8gYFxcdTAwMWJbMyR7Y29sb3J9bSR7c3RyfVxcdTAwMWJbMzltYCA6IHN0clxufVxuXG4vKipcbiAqIERpbWlmeSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRpbSggc3RyICkge1xuICByZXR1cm4gYFxcdTAwMWJbOTBtJHtzdHJ9XFx1MDAxYlszOW1gXG59XG5cbi8qKlxuICogQ29tcGxldGUgcmVjb3JkIG9mIGxvZ2dpbmcgZXZlbnRzLlxuICovXG5jb25zdCBkZWJ1Z091dHB1dCA9IFtdXG5cbi8qKlxuICogQ3JlYXRlIGdlbmVyaWMgbG9nZ2VyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBmbXQobmFtZXNwYWNlLCBsb2cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBjb25zdCBzdHIgPSB1dGlsLmZvcm1hdC5hcHBseShcbiAgICAgIGNvbnNvbGUsXG4gICAgICBbYCAke2xvZyA9PT0gJ2Vycm9yJyA/IEVSUk9SIDogJyAnfSAke25hbWVzcGFjZX0gJHtsb2cgPT09ICdkZWJ1ZycgPyBkaW0obXNnKSA6IG1zZ31gXVxuICAgICAgICAuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICApXG5cbiAgICAvLyBhZGQgdG8gcmVjb3JkXG4gICAgZGVidWdPdXRwdXQucHVzaChzdHJpcChzdHIpKVxuXG4gICAgLy8gbG9nIHRvIGNvbnNvbGVcbiAgICBpZiAobG9nICE9PSAnZGVidWcnIHx8IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgIT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBjb25zb2xlW2xvZyA9PT0gJ2RlYnVnJyA/ICdlcnJvcicgOiBsb2ddKHN0cilcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDYWNoZSBsb2dnZXJzIGZvciByZXBlYXQgY2FsbHMuXG4gKi9cbmNvbnN0IGNhY2hlID0ge31cblxuLyoqXG4gKiBDcmVhdGUgZGVidWctbGlrZSBsb2dnZXJzIGF0dGFjaGVkIHRvIGdpdmVuXG4gKiBuYW1lc3BhY2UgJiBzdGRvdXQrc3RkZXJyLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSB0aGUgbmFtZXNwYWNlIHRvIGxvY2sgeW91ciBsb2dnZXIgaW50b1xuICogQHJldHVybiB7T2JqZWN0fSBjb250YWlucyBsb2csIGRlYnVnLCBhbmQgZXJyb3IgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IG5hbWVzcGFjZSA9PiB7XG4gIC8vIGNoZWNrIGNhY2hlXG4gIGNvbnN0IG5tID0gbmFtZXNwYWNlXG4gIGlmIChjYWNoZVtubV0pIHJldHVybiBjYWNoZVtubV1cblxuICAvLyBjb2xvcml6ZSBuYW1lc3BhY2VcbiAgbmFtZXNwYWNlID0gd3JhcENvbG9yKG5hbWVzcGFjZSlcblxuICAvLyByZXR1cm4gbG9nZ2Vyc1xuICByZXR1cm4gKGNhY2hlW25tXSA9IHtcbiAgICBsb2c6IGZtdChuYW1lc3BhY2UsICdsb2cnKSxcbiAgICBkZWJ1ZzogZm10KG5hbWVzcGFjZSwgJ2RlYnVnJyksXG4gICAgZXJyb3I6IGZtdChuYW1lc3BhY2UsICdlcnJvcicpXG4gIH0pXG59XG5cbi8qKlxuICogV3JpdGUgZGVidWcgbG9nIHRvIGZpbGUgb24gZmFpbHVyZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMuc2F2ZUxvZyA9IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIGF3YWl0IHdyaXRlRmlsZShwYXRoLmpvaW4oZGlyZWN0b3J5LCAnaG9wcC1kZWJ1Zy5sb2cnKSwgZGVidWdPdXRwdXQuam9pbihvcy5FT0wpKVxuXG4gIGNvbnNvbGUuZXJyb3IoJ1xcblNhdmVkIGRlYnVnIGluZm8gdG86ICVzLicsIGRpcmVjdG9yeSlcbiAgY29uc29sZS5lcnJvcignUGxlYXNlIHVzZSB0aGlzIGxvZyBmaWxlIHRvIHN1Ym1pdCBhbiBpc3N1ZSBAICVzaHR0cHM6Ly9naXRodWIuY29tL2hvcHBqcy9ob3BwL2lzc3VlcyVzLicsICdcXHUwMDFCWzRtJywgJ1xcdTAwMUJbMjRtJylcbn1cbiJdfQ==