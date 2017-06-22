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
function fmt(namespace, log, msg) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJkZWJ1Z091dHB1dCIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImZvcm1hdCIsImFwcGx5IiwiY29uc29sZSIsImNvbmNhdCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsInB1c2giLCJlbnYiLCJIT1BQX0RFQlVHIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIiwic2F2ZUxvZyIsImRpcmVjdG9yeSIsImpvaW4iLCJFT0wiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OzsyY0FWQTs7Ozs7O0FBWUE7OztBQUdBLElBQU1BLFNBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixDQUFmOztBQUVBOzs7QUFHQSxJQUFNQyxhQUFhLENBQW5COztBQUVBOzs7QUFHQSxJQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkJELFdBQVMsQ0FBVDtBQUNBQSxVQUFRQSxVQUFVRixPQUFPSSxNQUFqQixHQUEwQixDQUExQixHQUE4QkYsS0FBdEM7O0FBRUEsU0FBT0YsT0FBT0UsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxJQUFNRyxZQUFZQyxRQUFRQyxNQUFSLENBQWVDLEtBQWpDOztBQUVBOzs7QUFHQSxJQUFNQyxRQUFRSixZQUFZLHdCQUFaLEdBQXNDLEdBQXBEOztBQUVBOzs7QUFHQSxTQUFTSyxTQUFULENBQW9CQyxHQUFwQixFQUEwQjtBQUN4QixNQUFNVCxRQUFRUyxRQUFRLE1BQVIsR0FBaUJWLFVBQWpCLEdBQThCRSxXQUE1QztBQUNBLFNBQU9FLHVCQUF1QkgsS0FBdkIsU0FBZ0NTLEdBQWhDLGdCQUFrREEsR0FBekQ7QUFDRDs7QUFFRDs7O0FBR0EsU0FBU0MsR0FBVCxDQUFjRCxHQUFkLEVBQW9CO0FBQ2xCLHNCQUFvQkEsR0FBcEI7QUFDRDs7QUFFRDs7O0FBR0EsSUFBTUUsY0FBYyxFQUFwQjs7QUFFQTs7O0FBR0EsU0FBU0MsR0FBVCxDQUFhQyxTQUFiLEVBQXdCQyxHQUF4QixFQUE2QkMsR0FBN0IsRUFBa0M7QUFDaEMsU0FBTyxVQUFVQSxHQUFWLEVBQWU7QUFDcEIsUUFBTU4sTUFBTSxlQUFLTyxNQUFMLENBQVlDLEtBQVosQ0FDVkMsT0FEVSxFQUVWLFFBQUtKLFFBQVEsT0FBUixHQUFrQlAsS0FBbEIsR0FBMEIsR0FBL0IsVUFBc0NNLFNBQXRDLFVBQW1EQyxRQUFRLE9BQVIsR0FBa0JKLElBQUlLLEdBQUosQ0FBbEIsR0FBNkJBLEdBQWhGLEdBQ0dJLE1BREgsQ0FDVSxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxFQUF5QixDQUF6QixDQURWLENBRlUsQ0FBWjs7QUFNQTtBQUNBWCxnQkFBWVksSUFBWixDQUFpQix5QkFBTWQsR0FBTixDQUFqQjs7QUFFQTtBQUNBLFFBQUlLLFFBQVEsT0FBUixJQUFtQlYsUUFBUW9CLEdBQVIsQ0FBWUMsVUFBWixLQUEyQixPQUFsRCxFQUEyRDtBQUN6RCxhQUFPUCxRQUFRSixRQUFRLE9BQVIsR0FBa0IsT0FBbEIsR0FBNEJBLEdBQXBDLEVBQXlDTCxHQUF6QyxDQUFQO0FBQ0Q7QUFDRixHQWREO0FBZUQ7O0FBRUQ7OztBQUdBLElBQU1pQixRQUFRLEVBQWQ7O0FBRUE7Ozs7OztBQU1BQyxPQUFPQyxPQUFQLEdBQWlCLHFCQUFhO0FBQzVCO0FBQ0EsTUFBTUMsS0FBS2hCLFNBQVg7QUFDQSxNQUFJYSxNQUFNRyxFQUFOLENBQUosRUFBZSxPQUFPSCxNQUFNRyxFQUFOLENBQVA7O0FBRWY7QUFDQWhCLGNBQVlMLFVBQVVLLFNBQVYsQ0FBWjs7QUFFQTtBQUNBLFNBQVFhLE1BQU1HLEVBQU4sSUFBWTtBQUNsQmYsU0FBS0YsSUFBSUMsU0FBSixFQUFlLEtBQWYsQ0FEYTtBQUVsQmlCLFdBQU9sQixJQUFJQyxTQUFKLEVBQWUsT0FBZixDQUZXO0FBR2xCa0IsV0FBT25CLElBQUlDLFNBQUosRUFBZSxPQUFmO0FBSFcsR0FBcEI7QUFLRCxDQWREOztBQWdCQTs7O0FBR0FjLE9BQU9DLE9BQVAsQ0FBZUksT0FBZjtBQUFBLHVEQUF5QixpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFDakIsbUJBQVUsZUFBS0MsSUFBTCxDQUFVRCxTQUFWLEVBQXFCLGdCQUFyQixDQUFWLEVBQWtEdEIsWUFBWXVCLElBQVosQ0FBaUIsYUFBR0MsR0FBcEIsQ0FBbEQsQ0FEaUI7O0FBQUE7O0FBR3ZCakIsb0JBQVFhLEtBQVIsQ0FBYyw0QkFBZCxFQUE0Q0UsU0FBNUM7QUFDQWYsb0JBQVFhLEtBQVIsQ0FBYywwRkFBZCxFQUEwRyxTQUExRyxFQUF1SCxVQUF2SDs7QUFKdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBekI7O0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9nLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBvcyBmcm9tICdvcydcbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHN0cmlwIGZyb20gJ3N0cmlwLWFuc2knXG5pbXBvcnQgeyB3cml0ZUZpbGUgfSBmcm9tICcuLi9mcydcblxuLyoqXG4gKiBTZWxlY3RlZCBjb2xvcnMgLSBib3Jyb3dlZCBmcm9tIGBkZWJ1Z2AuXG4gKi9cbmNvbnN0IGNvbG9ycyA9IFsyLCAzLCA0LCA1LCAxXVxuXG4vKipcbiAqIFRoaXMgY29sb3IgaXMgcmVzZXJ2ZWQgZm9yIGBob3BwYCBsb2dzLlxuICovXG5jb25zdCBIT1BQX0NPTE9SID0gNlxuXG4vKipcbiAqIE1hbmFnZSBkaXN0cmlidXRlZCBjb2xvcnMuXG4gKi9cbmxldCBjb2xvciA9IC0xXG5mdW5jdGlvbiBuZXh0Q29sb3IoKSB7XG4gIGNvbG9yICs9IDFcbiAgY29sb3IgPSBjb2xvciA9PT0gY29sb3JzLmxlbmd0aCA/IDAgOiBjb2xvclxuXG4gIHJldHVybiBjb2xvcnNbY29sb3JdXG59XG5cbi8qKlxuICogQmFzaWMgYXR0ZW1wdCB0byBmaWd1cmUgb3V0IGlmIGNvbG9ycyBzaG91bGRcbiAqIGJlIHVzZWQgb3Igbm90LlxuICovXG5jb25zdCB1c2VDb2xvcnMgPSBwcm9jZXNzLnN0ZG91dC5pc1RUWVxuXG4vKipcbiAqIENyZWF0ZSBlcnJvciBtYXJrLlxuICovXG5jb25zdCBFUlJPUiA9IHVzZUNvbG9ycyA/ICdcXHUwMDFiWzMxbeKcllxcdTAwMWJbMzltJyA6ICfinJYnXG5cbi8qKlxuICogV3JhcHMgYSBzdHJpbmcgd2l0aCBjb2xvciBlc2NhcGVzLlxuICovXG5mdW5jdGlvbiB3cmFwQ29sb3IoIHN0ciApIHtcbiAgY29uc3QgY29sb3IgPSBzdHIgPT09ICdob3BwJyA/IEhPUFBfQ09MT1IgOiBuZXh0Q29sb3IoKVxuICByZXR1cm4gdXNlQ29sb3JzID8gYFxcdTAwMWJbMyR7Y29sb3J9bSR7c3RyfVxcdTAwMWJbMzltYCA6IHN0clxufVxuXG4vKipcbiAqIERpbWlmeSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRpbSggc3RyICkge1xuICByZXR1cm4gYFxcdTAwMWJbOTBtJHtzdHJ9XFx1MDAxYlszOW1gXG59XG5cbi8qKlxuICogQ29tcGxldGUgcmVjb3JkIG9mIGxvZ2dpbmcgZXZlbnRzLlxuICovXG5jb25zdCBkZWJ1Z091dHB1dCA9IFtdXG5cbi8qKlxuICogQ3JlYXRlIGdlbmVyaWMgbG9nZ2VyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBmbXQobmFtZXNwYWNlLCBsb2csIG1zZykge1xuICByZXR1cm4gZnVuY3Rpb24gKG1zZykge1xuICAgIGNvbnN0IHN0ciA9IHV0aWwuZm9ybWF0LmFwcGx5KFxuICAgICAgY29uc29sZSxcbiAgICAgIFtgICR7bG9nID09PSAnZXJyb3InID8gRVJST1IgOiAnICd9ICR7bmFtZXNwYWNlfSAke2xvZyA9PT0gJ2RlYnVnJyA/IGRpbShtc2cpIDogbXNnfWBdXG4gICAgICAgIC5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgIClcblxuICAgIC8vIGFkZCB0byByZWNvcmRcbiAgICBkZWJ1Z091dHB1dC5wdXNoKHN0cmlwKHN0cikpXG5cbiAgICAvLyBsb2cgdG8gY29uc29sZVxuICAgIGlmIChsb2cgIT09ICdkZWJ1ZycgfHwgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyAhPT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGNvbnNvbGVbbG9nID09PSAnZGVidWcnID8gJ2Vycm9yJyA6IGxvZ10oc3RyKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENhY2hlIGxvZ2dlcnMgZm9yIHJlcGVhdCBjYWxscy5cbiAqL1xuY29uc3QgY2FjaGUgPSB7fVxuXG4vKipcbiAqIENyZWF0ZSBkZWJ1Zy1saWtlIGxvZ2dlcnMgYXR0YWNoZWQgdG8gZ2l2ZW5cbiAqIG5hbWVzcGFjZSAmIHN0ZG91dCtzdGRlcnIuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIHRoZSBuYW1lc3BhY2UgdG8gbG9jayB5b3VyIGxvZ2dlciBpbnRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRhaW5zIGxvZywgZGVidWcsIGFuZCBlcnJvciBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gbmFtZXNwYWNlID0+IHtcbiAgLy8gY2hlY2sgY2FjaGVcbiAgY29uc3Qgbm0gPSBuYW1lc3BhY2VcbiAgaWYgKGNhY2hlW25tXSkgcmV0dXJuIGNhY2hlW25tXVxuXG4gIC8vIGNvbG9yaXplIG5hbWVzcGFjZVxuICBuYW1lc3BhY2UgPSB3cmFwQ29sb3IobmFtZXNwYWNlKVxuXG4gIC8vIHJldHVybiBsb2dnZXJzXG4gIHJldHVybiAoY2FjaGVbbm1dID0ge1xuICAgIGxvZzogZm10KG5hbWVzcGFjZSwgJ2xvZycpLFxuICAgIGRlYnVnOiBmbXQobmFtZXNwYWNlLCAnZGVidWcnKSxcbiAgICBlcnJvcjogZm10KG5hbWVzcGFjZSwgJ2Vycm9yJylcbiAgfSlcbn1cblxuLyoqXG4gKiBXcml0ZSBkZWJ1ZyBsb2cgdG8gZmlsZSBvbiBmYWlsdXJlLlxuICovXG5tb2R1bGUuZXhwb3J0cy5zYXZlTG9nID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgYXdhaXQgd3JpdGVGaWxlKHBhdGguam9pbihkaXJlY3RvcnksICdob3BwLWRlYnVnLmxvZycpLCBkZWJ1Z091dHB1dC5qb2luKG9zLkVPTCkpXG5cbiAgY29uc29sZS5lcnJvcignXFxuU2F2ZWQgZGVidWcgaW5mbyB0bzogJXMuJywgZGlyZWN0b3J5KVxuICBjb25zb2xlLmVycm9yKCdQbGVhc2UgdXNlIHRoaXMgbG9nIGZpbGUgdG8gc3VibWl0IGFuIGlzc3VlIEAgJXNodHRwczovL2dpdGh1Yi5jb20vaG9wcGpzL2hvcHAvaXNzdWVzJXMuJywgJ1xcdTAwMUJbNG0nLCAnXFx1MDAxQlsyNG0nKVxufVxuIl19