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
 * @copyright 2017 Karim Alibhai.
 */

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
function fmt(namespace, log, msg) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJkZWJ1Z091dHB1dCIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImZvcm1hdCIsImFwcGx5IiwiY29uc29sZSIsImNvbmNhdCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsInB1c2giLCJlbnYiLCJIT1BQX0RFQlVHIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIiwic2F2ZUxvZyIsImRpcmVjdG9yeSIsImpvaW4iLCJFT0wiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7QUFHQSxNQUFNQSxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FBZjs7QUFFQTs7O0FBakJBOzs7Ozs7QUFvQkEsTUFBTUMsYUFBYSxDQUFuQjs7QUFFQTs7O0FBR0EsSUFBSUMsUUFBUSxDQUFDLENBQWI7QUFDQSxTQUFTQyxTQUFULEdBQXFCO0FBQ25CRCxXQUFTLENBQVQ7QUFDQUEsVUFBUUEsVUFBVUYsT0FBT0ksTUFBakIsR0FBMEIsQ0FBMUIsR0FBOEJGLEtBQXRDOztBQUVBLFNBQU9GLE9BQU9FLEtBQVAsQ0FBUDtBQUNEOztBQUVEOzs7O0FBSUEsTUFBTUcsWUFBWUMsUUFBUUMsTUFBUixDQUFlQyxLQUFqQzs7QUFFQTs7O0FBR0EsTUFBTUMsUUFBUUosWUFBWSx1QkFBWixHQUFzQyxHQUFwRDs7QUFFQTs7O0FBR0EsU0FBU0ssU0FBVCxDQUFvQkMsR0FBcEIsRUFBMEI7QUFDeEIsUUFBTVQsUUFBUVMsUUFBUSxNQUFSLEdBQWlCVixVQUFqQixHQUE4QkUsV0FBNUM7QUFDQSxTQUFPRSxZQUFhLFdBQVVILEtBQU0sSUFBR1MsR0FBSSxZQUFwQyxHQUFrREEsR0FBekQ7QUFDRDs7QUFFRDs7O0FBR0EsU0FBU0MsR0FBVCxDQUFjRCxHQUFkLEVBQW9CO0FBQ2xCLFNBQVEsYUFBWUEsR0FBSSxZQUF4QjtBQUNEOztBQUVEOzs7QUFHQSxNQUFNRSxjQUFjLEVBQXBCOztBQUVBOzs7QUFHQSxTQUFTQyxHQUFULENBQWFDLFNBQWIsRUFBd0JDLEdBQXhCLEVBQTZCQyxHQUE3QixFQUFrQztBQUNoQyxTQUFPLFVBQVVBLEdBQVYsRUFBZTtBQUNwQixVQUFNTixNQUFNLGVBQUtPLE1BQUwsQ0FBWUMsS0FBWixDQUNWQyxPQURVLEVBRVYsQ0FBRSxJQUFHSixRQUFRLE9BQVIsR0FBa0JQLEtBQWxCLEdBQTBCLEdBQUksSUFBR00sU0FBVSxJQUFHQyxRQUFRLE9BQVIsR0FBa0JKLElBQUlLLEdBQUosQ0FBbEIsR0FBNkJBLEdBQUksRUFBcEYsRUFDR0ksTUFESCxDQUNVLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLEVBQXlCLENBQXpCLENBRFYsQ0FGVSxDQUFaOztBQU1BO0FBQ0FYLGdCQUFZWSxJQUFaLENBQWlCLHlCQUFNZCxHQUFOLENBQWpCOztBQUVBO0FBQ0EsUUFBSUssUUFBUSxPQUFSLElBQW1CVixRQUFRb0IsR0FBUixDQUFZQyxVQUFaLEtBQTJCLE9BQWxELEVBQTJEO0FBQ3pELGFBQU9QLFFBQVFKLFFBQVEsT0FBUixHQUFrQixPQUFsQixHQUE0QkEsR0FBcEMsRUFBeUNMLEdBQXpDLENBQVA7QUFDRDtBQUNGLEdBZEQ7QUFlRDs7QUFFRDs7O0FBR0EsTUFBTWlCLFFBQVEsRUFBZDs7QUFFQTs7Ozs7O0FBTUFDLE9BQU9DLE9BQVAsR0FBaUJmLGFBQWE7QUFDNUI7QUFDQSxRQUFNZ0IsS0FBS2hCLFNBQVg7QUFDQSxNQUFJYSxNQUFNRyxFQUFOLENBQUosRUFBZSxPQUFPSCxNQUFNRyxFQUFOLENBQVA7O0FBRWY7QUFDQWhCLGNBQVlMLFVBQVVLLFNBQVYsQ0FBWjs7QUFFQTtBQUNBLFNBQVFhLE1BQU1HLEVBQU4sSUFBWTtBQUNsQmYsU0FBS0YsSUFBSUMsU0FBSixFQUFlLEtBQWYsQ0FEYTtBQUVsQmlCLFdBQU9sQixJQUFJQyxTQUFKLEVBQWUsT0FBZixDQUZXO0FBR2xCa0IsV0FBT25CLElBQUlDLFNBQUosRUFBZSxPQUFmO0FBSFcsR0FBcEI7QUFLRCxDQWREOztBQWdCQTs7O0FBR0FjLE9BQU9DLE9BQVAsQ0FBZUksT0FBZixHQUF5QixNQUFNQyxTQUFOLElBQW1CO0FBQzFDLFFBQU0sbUJBQVUsZUFBS0MsSUFBTCxDQUFVRCxTQUFWLEVBQXFCLGdCQUFyQixDQUFWLEVBQWtEdEIsWUFBWXVCLElBQVosQ0FBaUIsYUFBR0MsR0FBcEIsQ0FBbEQsQ0FBTjs7QUFFQWpCLFVBQVFhLEtBQVIsQ0FBYyw0QkFBZCxFQUE0Q0UsU0FBNUM7QUFDQWYsVUFBUWEsS0FBUixDQUFjLDBGQUFkLEVBQTBHLFdBQTFHLEVBQXVILFlBQXZIO0FBQ0QsQ0FMRCIsImZpbGUiOiJsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2cuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IG9zIGZyb20gJ29zJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgc3RyaXAgZnJvbSAnc3RyaXAtYW5zaSdcbmltcG9ydCB7IHdyaXRlRmlsZSB9IGZyb20gJy4uL2ZzJ1xuXG4vKipcbiAqIFNlbGVjdGVkIGNvbG9ycyAtIGJvcnJvd2VkIGZyb20gYGRlYnVnYC5cbiAqL1xuY29uc3QgY29sb3JzID0gWzIsIDMsIDQsIDUsIDFdXG5cbi8qKlxuICogVGhpcyBjb2xvciBpcyByZXNlcnZlZCBmb3IgYGhvcHBgIGxvZ3MuXG4gKi9cbmNvbnN0IEhPUFBfQ09MT1IgPSA2XG5cbi8qKlxuICogTWFuYWdlIGRpc3RyaWJ1dGVkIGNvbG9ycy5cbiAqL1xubGV0IGNvbG9yID0gLTFcbmZ1bmN0aW9uIG5leHRDb2xvcigpIHtcbiAgY29sb3IgKz0gMVxuICBjb2xvciA9IGNvbG9yID09PSBjb2xvcnMubGVuZ3RoID8gMCA6IGNvbG9yXG5cbiAgcmV0dXJuIGNvbG9yc1tjb2xvcl1cbn1cblxuLyoqXG4gKiBCYXNpYyBhdHRlbXB0IHRvIGZpZ3VyZSBvdXQgaWYgY29sb3JzIHNob3VsZFxuICogYmUgdXNlZCBvciBub3QuXG4gKi9cbmNvbnN0IHVzZUNvbG9ycyA9IHByb2Nlc3Muc3Rkb3V0LmlzVFRZXG5cbi8qKlxuICogQ3JlYXRlIGVycm9yIG1hcmsuXG4gKi9cbmNvbnN0IEVSUk9SID0gdXNlQ29sb3JzID8gJ1xcdTAwMWJbMzFt4pyWXFx1MDAxYlszOW0nIDogJ+KclidcblxuLyoqXG4gKiBXcmFwcyBhIHN0cmluZyB3aXRoIGNvbG9yIGVzY2FwZXMuXG4gKi9cbmZ1bmN0aW9uIHdyYXBDb2xvciggc3RyICkge1xuICBjb25zdCBjb2xvciA9IHN0ciA9PT0gJ2hvcHAnID8gSE9QUF9DT0xPUiA6IG5leHRDb2xvcigpXG4gIHJldHVybiB1c2VDb2xvcnMgPyBgXFx1MDAxYlszJHtjb2xvcn1tJHtzdHJ9XFx1MDAxYlszOW1gIDogc3RyXG59XG5cbi8qKlxuICogRGltaWZ5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGltKCBzdHIgKSB7XG4gIHJldHVybiBgXFx1MDAxYls5MG0ke3N0cn1cXHUwMDFiWzM5bWBcbn1cblxuLyoqXG4gKiBDb21wbGV0ZSByZWNvcmQgb2YgbG9nZ2luZyBldmVudHMuXG4gKi9cbmNvbnN0IGRlYnVnT3V0cHV0ID0gW11cblxuLyoqXG4gKiBDcmVhdGUgZ2VuZXJpYyBsb2dnZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGZtdChuYW1lc3BhY2UsIGxvZywgbXNnKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobXNnKSB7XG4gICAgY29uc3Qgc3RyID0gdXRpbC5mb3JtYXQuYXBwbHkoXG4gICAgICBjb25zb2xlLFxuICAgICAgW2AgJHtsb2cgPT09ICdlcnJvcicgPyBFUlJPUiA6ICcgJ30gJHtuYW1lc3BhY2V9ICR7bG9nID09PSAnZGVidWcnID8gZGltKG1zZykgOiBtc2d9YF1cbiAgICAgICAgLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXG4gICAgKVxuXG4gICAgLy8gYWRkIHRvIHJlY29yZFxuICAgIGRlYnVnT3V0cHV0LnB1c2goc3RyaXAoc3RyKSlcblxuICAgIC8vIGxvZyB0byBjb25zb2xlXG4gICAgaWYgKGxvZyAhPT0gJ2RlYnVnJyB8fCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHICE9PSAnZmFsc2UnKSB7XG4gICAgICByZXR1cm4gY29uc29sZVtsb2cgPT09ICdkZWJ1ZycgPyAnZXJyb3InIDogbG9nXShzdHIpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2FjaGUgbG9nZ2VycyBmb3IgcmVwZWF0IGNhbGxzLlxuICovXG5jb25zdCBjYWNoZSA9IHt9XG5cbi8qKlxuICogQ3JlYXRlIGRlYnVnLWxpa2UgbG9nZ2VycyBhdHRhY2hlZCB0byBnaXZlblxuICogbmFtZXNwYWNlICYgc3Rkb3V0K3N0ZGVyci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgdGhlIG5hbWVzcGFjZSB0byBsb2NrIHlvdXIgbG9nZ2VyIGludG9cbiAqIEByZXR1cm4ge09iamVjdH0gY29udGFpbnMgbG9nLCBkZWJ1ZywgYW5kIGVycm9yIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBuYW1lc3BhY2UgPT4ge1xuICAvLyBjaGVjayBjYWNoZVxuICBjb25zdCBubSA9IG5hbWVzcGFjZVxuICBpZiAoY2FjaGVbbm1dKSByZXR1cm4gY2FjaGVbbm1dXG5cbiAgLy8gY29sb3JpemUgbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSA9IHdyYXBDb2xvcihuYW1lc3BhY2UpXG5cbiAgLy8gcmV0dXJuIGxvZ2dlcnNcbiAgcmV0dXJuIChjYWNoZVtubV0gPSB7XG4gICAgbG9nOiBmbXQobmFtZXNwYWNlLCAnbG9nJyksXG4gICAgZGVidWc6IGZtdChuYW1lc3BhY2UsICdkZWJ1ZycpLFxuICAgIGVycm9yOiBmbXQobmFtZXNwYWNlLCAnZXJyb3InKVxuICB9KVxufVxuXG4vKipcbiAqIFdyaXRlIGRlYnVnIGxvZyB0byBmaWxlIG9uIGZhaWx1cmUuXG4gKi9cbm1vZHVsZS5leHBvcnRzLnNhdmVMb2cgPSBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICBhd2FpdCB3cml0ZUZpbGUocGF0aC5qb2luKGRpcmVjdG9yeSwgJ2hvcHAtZGVidWcubG9nJyksIGRlYnVnT3V0cHV0LmpvaW4ob3MuRU9MKSlcblxuICBjb25zb2xlLmVycm9yKCdcXG5TYXZlZCBkZWJ1ZyBpbmZvIHRvOiAlcy4nLCBkaXJlY3RvcnkpXG4gIGNvbnNvbGUuZXJyb3IoJ1BsZWFzZSB1c2UgdGhpcyBsb2cgZmlsZSB0byBzdWJtaXQgYW4gaXNzdWUgQCAlc2h0dHBzOi8vZ2l0aHViLmNvbS9ob3BwanMvaG9wcC9pc3N1ZXMlcy4nLCAnXFx1MDAxQls0bScsICdcXHUwMDFCWzI0bScpXG59Il19