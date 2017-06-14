'use strict';

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Selected colors - borrowed from `debug`.
 */
var colors = [6, 2, 3, 4, 5, 1];

/**
 * Manage distributed colors.
 */
/**
 * @file src/utils/log.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
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
  var color = nextColor();
  return useColors ? '\x1B[3' + color + 'm' + str + '\x1B[39m' : str;
}

/**
 * Dimify string.
 */
function dim(str) {
  return '\x1B[90m' + str + '\x1B[39m';
}

/**
 * Create generic logger function.
 */
function fmt(namespace, log, msg) {
  return function (msg) {
    if (log !== 'debug' || process.env.HOPP_DEBUG !== 'false') {
      return console[log === 'debug' ? 'error' : log].apply(console, [' ' + (log === 'error' ? ERROR : ' ') + ' ' + namespace + ' ' + (log === 'debug' ? dim(msg) : msg)].concat([].slice.call(arguments, 1)));
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
  namespace = wrapColor(namespace

  // return loggers
  );return cache[nm] = {
    log: fmt(namespace, 'log'),
    debug: fmt(namespace, 'debug'),
    error: fmt(namespace, 'error')
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiY29sb3IiLCJuZXh0Q29sb3IiLCJsZW5ndGgiLCJ1c2VDb2xvcnMiLCJwcm9jZXNzIiwic3Rkb3V0IiwiaXNUVFkiLCJFUlJPUiIsIndyYXBDb2xvciIsInN0ciIsImRpbSIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImVudiIsIkhPUFBfREVCVUciLCJjb25zb2xlIiwiYXBwbHkiLCJjb25jYXQiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJjYWNoZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJubSIsImRlYnVnIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7OztBQUVBOzs7QUFHQSxJQUFNQSxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZjs7QUFFQTs7O0FBYkE7Ozs7OztBQWdCQSxJQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkJELFdBQVMsQ0FBVDtBQUNBQSxVQUFRQSxVQUFVRCxPQUFPRyxNQUFqQixHQUEwQixDQUExQixHQUE4QkYsS0FBdEM7O0FBRUEsU0FBT0QsT0FBT0MsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxJQUFNRyxZQUFZQyxRQUFRQyxNQUFSLENBQWVDLEtBQWpDOztBQUVBOzs7QUFHQSxJQUFNQyxRQUFRSixZQUFZLHdCQUFaLEdBQXNDLEdBQXBEOztBQUVBOzs7QUFHQSxTQUFTSyxTQUFULENBQW9CQyxHQUFwQixFQUEwQjtBQUN4QixNQUFNVCxRQUFRQyxXQUFkO0FBQ0EsU0FBT0UsdUJBQXVCSCxLQUF2QixTQUFnQ1MsR0FBaEMsZ0JBQWtEQSxHQUF6RDtBQUNEOztBQUVEOzs7QUFHQSxTQUFTQyxHQUFULENBQWNELEdBQWQsRUFBb0I7QUFDbEIsc0JBQW9CQSxHQUFwQjtBQUNEOztBQUVEOzs7QUFHQSxTQUFTRSxHQUFULENBQWFDLFNBQWIsRUFBd0JDLEdBQXhCLEVBQTZCQyxHQUE3QixFQUFrQztBQUNoQyxTQUFPLFVBQVVBLEdBQVYsRUFBZTtBQUNwQixRQUFJRCxRQUFRLE9BQVIsSUFBbUJULFFBQVFXLEdBQVIsQ0FBWUMsVUFBWixLQUEyQixPQUFsRCxFQUEyRDtBQUN6RCxhQUFPQyxRQUFRSixRQUFRLE9BQVIsR0FBa0IsT0FBbEIsR0FBNEJBLEdBQXBDLEVBQXlDSyxLQUF6QyxDQUNMRCxPQURLLEVBRUwsUUFBS0osUUFBUSxPQUFSLEdBQWtCTixLQUFsQixHQUEwQixHQUEvQixVQUFzQ0ssU0FBdEMsVUFBbURDLFFBQVEsT0FBUixHQUFrQkgsSUFBSUksR0FBSixDQUFsQixHQUE2QkEsR0FBaEYsR0FDR0ssTUFESCxDQUNVLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLEVBQXlCLENBQXpCLENBRFYsQ0FGSyxDQUFQO0FBS0Q7QUFDRixHQVJEO0FBU0Q7O0FBRUQ7OztBQUdBLElBQU1DLFFBQVEsRUFBZDs7QUFFQTs7Ozs7O0FBTUFDLE9BQU9DLE9BQVAsR0FBaUIscUJBQWE7QUFDNUI7QUFDQSxNQUFNQyxLQUFLZCxTQUFYO0FBQ0EsTUFBSVcsTUFBTUcsRUFBTixDQUFKLEVBQWUsT0FBT0gsTUFBTUcsRUFBTixDQUFQOztBQUVmO0FBQ0FkLGNBQVlKLFVBQVVJOztBQUV0QjtBQUZZLEdBQVosQ0FHQSxPQUFRVyxNQUFNRyxFQUFOLElBQVk7QUFDbEJiLFNBQUtGLElBQUlDLFNBQUosRUFBZSxLQUFmLENBRGE7QUFFbEJlLFdBQU9oQixJQUFJQyxTQUFKLEVBQWUsT0FBZixDQUZXO0FBR2xCZ0IsV0FBT2pCLElBQUlDLFNBQUosRUFBZSxPQUFmO0FBSFcsR0FBcEI7QUFLRCxDQWREIiwiZmlsZSI6ImxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvZy5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuXG4vKipcbiAqIFNlbGVjdGVkIGNvbG9ycyAtIGJvcnJvd2VkIGZyb20gYGRlYnVnYC5cbiAqL1xuY29uc3QgY29sb3JzID0gWzYsIDIsIDMsIDQsIDUsIDFdXG5cbi8qKlxuICogTWFuYWdlIGRpc3RyaWJ1dGVkIGNvbG9ycy5cbiAqL1xubGV0IGNvbG9yID0gLTFcbmZ1bmN0aW9uIG5leHRDb2xvcigpIHtcbiAgY29sb3IgKz0gMVxuICBjb2xvciA9IGNvbG9yID09PSBjb2xvcnMubGVuZ3RoID8gMCA6IGNvbG9yXG5cbiAgcmV0dXJuIGNvbG9yc1tjb2xvcl1cbn1cblxuLyoqXG4gKiBCYXNpYyBhdHRlbXB0IHRvIGZpZ3VyZSBvdXQgaWYgY29sb3JzIHNob3VsZFxuICogYmUgdXNlZCBvciBub3QuXG4gKi9cbmNvbnN0IHVzZUNvbG9ycyA9IHByb2Nlc3Muc3Rkb3V0LmlzVFRZXG5cbi8qKlxuICogQ3JlYXRlIGVycm9yIG1hcmsuXG4gKi9cbmNvbnN0IEVSUk9SID0gdXNlQ29sb3JzID8gJ1xcdTAwMWJbMzFt4pyWXFx1MDAxYlszOW0nIDogJ+KclidcblxuLyoqXG4gKiBXcmFwcyBhIHN0cmluZyB3aXRoIGNvbG9yIGVzY2FwZXMuXG4gKi9cbmZ1bmN0aW9uIHdyYXBDb2xvciggc3RyICkge1xuICBjb25zdCBjb2xvciA9IG5leHRDb2xvcigpXG4gIHJldHVybiB1c2VDb2xvcnMgPyBgXFx1MDAxYlszJHtjb2xvcn1tJHtzdHJ9XFx1MDAxYlszOW1gIDogc3RyXG59XG5cbi8qKlxuICogRGltaWZ5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGltKCBzdHIgKSB7XG4gIHJldHVybiBgXFx1MDAxYls5MG0ke3N0cn1cXHUwMDFiWzM5bWBcbn1cblxuLyoqXG4gKiBDcmVhdGUgZ2VuZXJpYyBsb2dnZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGZtdChuYW1lc3BhY2UsIGxvZywgbXNnKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobXNnKSB7XG4gICAgaWYgKGxvZyAhPT0gJ2RlYnVnJyB8fCBwcm9jZXNzLmVudi5IT1BQX0RFQlVHICE9PSAnZmFsc2UnKSB7XG4gICAgICByZXR1cm4gY29uc29sZVtsb2cgPT09ICdkZWJ1ZycgPyAnZXJyb3InIDogbG9nXS5hcHBseShcbiAgICAgICAgY29uc29sZSxcbiAgICAgICAgW2AgJHtsb2cgPT09ICdlcnJvcicgPyBFUlJPUiA6ICcgJ30gJHtuYW1lc3BhY2V9ICR7bG9nID09PSAnZGVidWcnID8gZGltKG1zZykgOiBtc2d9YF1cbiAgICAgICAgICAuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcbiAgICAgIClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDYWNoZSBsb2dnZXJzIGZvciByZXBlYXQgY2FsbHMuXG4gKi9cbmNvbnN0IGNhY2hlID0ge31cblxuLyoqXG4gKiBDcmVhdGUgZGVidWctbGlrZSBsb2dnZXJzIGF0dGFjaGVkIHRvIGdpdmVuXG4gKiBuYW1lc3BhY2UgJiBzdGRvdXQrc3RkZXJyLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSB0aGUgbmFtZXNwYWNlIHRvIGxvY2sgeW91ciBsb2dnZXIgaW50b1xuICogQHJldHVybiB7T2JqZWN0fSBjb250YWlucyBsb2csIGRlYnVnLCBhbmQgZXJyb3IgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IG5hbWVzcGFjZSA9PiB7XG4gIC8vIGNoZWNrIGNhY2hlXG4gIGNvbnN0IG5tID0gbmFtZXNwYWNlXG4gIGlmIChjYWNoZVtubV0pIHJldHVybiBjYWNoZVtubV1cblxuICAvLyBjb2xvcml6ZSBuYW1lc3BhY2VcbiAgbmFtZXNwYWNlID0gd3JhcENvbG9yKG5hbWVzcGFjZSlcblxuICAvLyByZXR1cm4gbG9nZ2Vyc1xuICByZXR1cm4gKGNhY2hlW25tXSA9IHtcbiAgICBsb2c6IGZtdChuYW1lc3BhY2UsICdsb2cnKSxcbiAgICBkZWJ1ZzogZm10KG5hbWVzcGFjZSwgJ2RlYnVnJyksXG4gICAgZXJyb3I6IGZtdChuYW1lc3BhY2UsICdlcnJvcicpXG4gIH0pXG59Il19