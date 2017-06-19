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
  namespace = wrapColor(namespace);

  // return loggers
  return cache[nm] = {
    log: fmt(namespace, 'log'),
    debug: fmt(namespace, 'debug'),
    error: fmt(namespace, 'error')
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiY29sb3IiLCJuZXh0Q29sb3IiLCJsZW5ndGgiLCJ1c2VDb2xvcnMiLCJwcm9jZXNzIiwic3Rkb3V0IiwiaXNUVFkiLCJFUlJPUiIsIndyYXBDb2xvciIsInN0ciIsImRpbSIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImVudiIsIkhPUFBfREVCVUciLCJjb25zb2xlIiwiYXBwbHkiLCJjb25jYXQiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJjYWNoZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJubSIsImRlYnVnIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7OztBQUVBOzs7QUFHQSxJQUFNQSxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZjs7QUFFQTs7O0FBYkE7Ozs7OztBQWdCQSxJQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkJELFdBQVMsQ0FBVDtBQUNBQSxVQUFRQSxVQUFVRCxPQUFPRyxNQUFqQixHQUEwQixDQUExQixHQUE4QkYsS0FBdEM7O0FBRUEsU0FBT0QsT0FBT0MsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxJQUFNRyxZQUFZQyxRQUFRQyxNQUFSLENBQWVDLEtBQWpDOztBQUVBOzs7QUFHQSxJQUFNQyxRQUFRSixZQUFZLHdCQUFaLEdBQXNDLEdBQXBEOztBQUVBOzs7QUFHQSxTQUFTSyxTQUFULENBQW9CQyxHQUFwQixFQUEwQjtBQUN4QixNQUFNVCxRQUFRQyxXQUFkO0FBQ0EsU0FBT0UsdUJBQXVCSCxLQUF2QixTQUFnQ1MsR0FBaEMsZ0JBQWtEQSxHQUF6RDtBQUNEOztBQUVEOzs7QUFHQSxTQUFTQyxHQUFULENBQWNELEdBQWQsRUFBb0I7QUFDbEIsc0JBQW9CQSxHQUFwQjtBQUNEOztBQUVEOzs7QUFHQSxTQUFTRSxHQUFULENBQWFDLFNBQWIsRUFBd0JDLEdBQXhCLEVBQTZCQyxHQUE3QixFQUFrQztBQUNoQyxTQUFPLFVBQVVBLEdBQVYsRUFBZTtBQUNwQixRQUFJRCxRQUFRLE9BQVIsSUFBbUJULFFBQVFXLEdBQVIsQ0FBWUMsVUFBWixLQUEyQixPQUFsRCxFQUEyRDtBQUN6RCxhQUFPQyxRQUFRSixRQUFRLE9BQVIsR0FBa0IsT0FBbEIsR0FBNEJBLEdBQXBDLEVBQXlDSyxLQUF6QyxDQUNMRCxPQURLLEVBRUwsUUFBS0osUUFBUSxPQUFSLEdBQWtCTixLQUFsQixHQUEwQixHQUEvQixVQUFzQ0ssU0FBdEMsVUFBbURDLFFBQVEsT0FBUixHQUFrQkgsSUFBSUksR0FBSixDQUFsQixHQUE2QkEsR0FBaEYsR0FDR0ssTUFESCxDQUNVLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLEVBQXlCLENBQXpCLENBRFYsQ0FGSyxDQUFQO0FBS0Q7QUFDRixHQVJEO0FBU0Q7O0FBRUQ7OztBQUdBLElBQU1DLFFBQVEsRUFBZDs7QUFFQTs7Ozs7O0FBTUFDLE9BQU9DLE9BQVAsR0FBaUIscUJBQWE7QUFDNUI7QUFDQSxNQUFNQyxLQUFLZCxTQUFYO0FBQ0EsTUFBSVcsTUFBTUcsRUFBTixDQUFKLEVBQWUsT0FBT0gsTUFBTUcsRUFBTixDQUFQOztBQUVmO0FBQ0FkLGNBQVlKLFVBQVVJLFNBQVYsQ0FBWjs7QUFFQTtBQUNBLFNBQVFXLE1BQU1HLEVBQU4sSUFBWTtBQUNsQmIsU0FBS0YsSUFBSUMsU0FBSixFQUFlLEtBQWYsQ0FEYTtBQUVsQmUsV0FBT2hCLElBQUlDLFNBQUosRUFBZSxPQUFmLENBRlc7QUFHbEJnQixXQUFPakIsSUFBSUMsU0FBSixFQUFlLE9BQWY7QUFIVyxHQUFwQjtBQUtELENBZEQiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9nLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5cbi8qKlxuICogU2VsZWN0ZWQgY29sb3JzIC0gYm9ycm93ZWQgZnJvbSBgZGVidWdgLlxuICovXG5jb25zdCBjb2xvcnMgPSBbNiwgMiwgMywgNCwgNSwgMV1cblxuLyoqXG4gKiBNYW5hZ2UgZGlzdHJpYnV0ZWQgY29sb3JzLlxuICovXG5sZXQgY29sb3IgPSAtMVxuZnVuY3Rpb24gbmV4dENvbG9yKCkge1xuICBjb2xvciArPSAxXG4gIGNvbG9yID0gY29sb3IgPT09IGNvbG9ycy5sZW5ndGggPyAwIDogY29sb3JcblxuICByZXR1cm4gY29sb3JzW2NvbG9yXVxufVxuXG4vKipcbiAqIEJhc2ljIGF0dGVtcHQgdG8gZmlndXJlIG91dCBpZiBjb2xvcnMgc2hvdWxkXG4gKiBiZSB1c2VkIG9yIG5vdC5cbiAqL1xuY29uc3QgdXNlQ29sb3JzID0gcHJvY2Vzcy5zdGRvdXQuaXNUVFlcblxuLyoqXG4gKiBDcmVhdGUgZXJyb3IgbWFyay5cbiAqL1xuY29uc3QgRVJST1IgPSB1c2VDb2xvcnMgPyAnXFx1MDAxYlszMW3inJZcXHUwMDFiWzM5bScgOiAn4pyWJ1xuXG4vKipcbiAqIFdyYXBzIGEgc3RyaW5nIHdpdGggY29sb3IgZXNjYXBlcy5cbiAqL1xuZnVuY3Rpb24gd3JhcENvbG9yKCBzdHIgKSB7XG4gIGNvbnN0IGNvbG9yID0gbmV4dENvbG9yKClcbiAgcmV0dXJuIHVzZUNvbG9ycyA/IGBcXHUwMDFiWzMke2NvbG9yfW0ke3N0cn1cXHUwMDFiWzM5bWAgOiBzdHJcbn1cblxuLyoqXG4gKiBEaW1pZnkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBkaW0oIHN0ciApIHtcbiAgcmV0dXJuIGBcXHUwMDFiWzkwbSR7c3RyfVxcdTAwMWJbMzltYFxufVxuXG4vKipcbiAqIENyZWF0ZSBnZW5lcmljIGxvZ2dlciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gZm10KG5hbWVzcGFjZSwgbG9nLCBtc2cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBpZiAobG9nICE9PSAnZGVidWcnIHx8IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgIT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBjb25zb2xlW2xvZyA9PT0gJ2RlYnVnJyA/ICdlcnJvcicgOiBsb2ddLmFwcGx5KFxuICAgICAgICBjb25zb2xlLFxuICAgICAgICBbYCAke2xvZyA9PT0gJ2Vycm9yJyA/IEVSUk9SIDogJyAnfSAke25hbWVzcGFjZX0gJHtsb2cgPT09ICdkZWJ1ZycgPyBkaW0obXNnKSA6IG1zZ31gXVxuICAgICAgICAgIC5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENhY2hlIGxvZ2dlcnMgZm9yIHJlcGVhdCBjYWxscy5cbiAqL1xuY29uc3QgY2FjaGUgPSB7fVxuXG4vKipcbiAqIENyZWF0ZSBkZWJ1Zy1saWtlIGxvZ2dlcnMgYXR0YWNoZWQgdG8gZ2l2ZW5cbiAqIG5hbWVzcGFjZSAmIHN0ZG91dCtzdGRlcnIuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIHRoZSBuYW1lc3BhY2UgdG8gbG9jayB5b3VyIGxvZ2dlciBpbnRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRhaW5zIGxvZywgZGVidWcsIGFuZCBlcnJvciBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gbmFtZXNwYWNlID0+IHtcbiAgLy8gY2hlY2sgY2FjaGVcbiAgY29uc3Qgbm0gPSBuYW1lc3BhY2VcbiAgaWYgKGNhY2hlW25tXSkgcmV0dXJuIGNhY2hlW25tXVxuXG4gIC8vIGNvbG9yaXplIG5hbWVzcGFjZVxuICBuYW1lc3BhY2UgPSB3cmFwQ29sb3IobmFtZXNwYWNlKVxuXG4gIC8vIHJldHVybiBsb2dnZXJzXG4gIHJldHVybiAoY2FjaGVbbm1dID0ge1xuICAgIGxvZzogZm10KG5hbWVzcGFjZSwgJ2xvZycpLFxuICAgIGRlYnVnOiBmbXQobmFtZXNwYWNlLCAnZGVidWcnKSxcbiAgICBlcnJvcjogZm10KG5hbWVzcGFjZSwgJ2Vycm9yJylcbiAgfSlcbn0iXX0=