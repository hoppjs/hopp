'use strict';

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

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
 * Create generic logger function.
 */
function fmt(namespace, log, msg) {
  return function (msg) {
    if (log !== 'debug' || process.env.HOPP_DEBUG !== 'false') {
      return console[log === 'debug' ? 'error' : log].apply(console, [` ${log === 'error' ? ERROR : ' '} ${namespace} ${log === 'debug' ? dim(msg) : msg}`].concat([].slice.call(arguments, 1)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJmbXQiLCJuYW1lc3BhY2UiLCJsb2ciLCJtc2ciLCJlbnYiLCJIT1BQX0RFQlVHIiwiY29uc29sZSIsImFwcGx5IiwiY29uY2F0Iiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7Ozs7QUFFQTs7O0FBR0EsTUFBTUEsU0FBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQWY7O0FBRUE7OztBQWJBOzs7Ozs7QUFnQkEsTUFBTUMsYUFBYSxDQUFuQjs7QUFFQTs7O0FBR0EsSUFBSUMsUUFBUSxDQUFDLENBQWI7QUFDQSxTQUFTQyxTQUFULEdBQXFCO0FBQ25CRCxXQUFTLENBQVQ7QUFDQUEsVUFBUUEsVUFBVUYsT0FBT0ksTUFBakIsR0FBMEIsQ0FBMUIsR0FBOEJGLEtBQXRDOztBQUVBLFNBQU9GLE9BQU9FLEtBQVAsQ0FBUDtBQUNEOztBQUVEOzs7O0FBSUEsTUFBTUcsWUFBWUMsUUFBUUMsTUFBUixDQUFlQyxLQUFqQzs7QUFFQTs7O0FBR0EsTUFBTUMsUUFBUUosWUFBWSx1QkFBWixHQUFzQyxHQUFwRDs7QUFFQTs7O0FBR0EsU0FBU0ssU0FBVCxDQUFvQkMsR0FBcEIsRUFBMEI7QUFDeEIsUUFBTVQsUUFBUVMsUUFBUSxNQUFSLEdBQWlCVixVQUFqQixHQUE4QkUsV0FBNUM7QUFDQSxTQUFPRSxZQUFhLFdBQVVILEtBQU0sSUFBR1MsR0FBSSxZQUFwQyxHQUFrREEsR0FBekQ7QUFDRDs7QUFFRDs7O0FBR0EsU0FBU0MsR0FBVCxDQUFjRCxHQUFkLEVBQW9CO0FBQ2xCLFNBQVEsYUFBWUEsR0FBSSxZQUF4QjtBQUNEOztBQUVEOzs7QUFHQSxTQUFTRSxHQUFULENBQWFDLFNBQWIsRUFBd0JDLEdBQXhCLEVBQTZCQyxHQUE3QixFQUFrQztBQUNoQyxTQUFPLFVBQVVBLEdBQVYsRUFBZTtBQUNwQixRQUFJRCxRQUFRLE9BQVIsSUFBbUJULFFBQVFXLEdBQVIsQ0FBWUMsVUFBWixLQUEyQixPQUFsRCxFQUEyRDtBQUN6RCxhQUFPQyxRQUFRSixRQUFRLE9BQVIsR0FBa0IsT0FBbEIsR0FBNEJBLEdBQXBDLEVBQXlDSyxLQUF6QyxDQUNMRCxPQURLLEVBRUwsQ0FBRSxJQUFHSixRQUFRLE9BQVIsR0FBa0JOLEtBQWxCLEdBQTBCLEdBQUksSUFBR0ssU0FBVSxJQUFHQyxRQUFRLE9BQVIsR0FBa0JILElBQUlJLEdBQUosQ0FBbEIsR0FBNkJBLEdBQUksRUFBcEYsRUFDR0ssTUFESCxDQUNVLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLEVBQXlCLENBQXpCLENBRFYsQ0FGSyxDQUFQO0FBS0Q7QUFDRixHQVJEO0FBU0Q7O0FBRUQ7OztBQUdBLE1BQU1DLFFBQVEsRUFBZDs7QUFFQTs7Ozs7O0FBTUFDLE9BQU9DLE9BQVAsR0FBaUJiLGFBQWE7QUFDNUI7QUFDQSxRQUFNYyxLQUFLZCxTQUFYO0FBQ0EsTUFBSVcsTUFBTUcsRUFBTixDQUFKLEVBQWUsT0FBT0gsTUFBTUcsRUFBTixDQUFQOztBQUVmO0FBQ0FkLGNBQVlKLFVBQVVJLFNBQVYsQ0FBWjs7QUFFQTtBQUNBLFNBQVFXLE1BQU1HLEVBQU4sSUFBWTtBQUNsQmIsU0FBS0YsSUFBSUMsU0FBSixFQUFlLEtBQWYsQ0FEYTtBQUVsQmUsV0FBT2hCLElBQUlDLFNBQUosRUFBZSxPQUFmLENBRlc7QUFHbEJnQixXQUFPakIsSUFBSUMsU0FBSixFQUFlLE9BQWY7QUFIVyxHQUFwQjtBQUtELENBZEQiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9nLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5cbi8qKlxuICogU2VsZWN0ZWQgY29sb3JzIC0gYm9ycm93ZWQgZnJvbSBgZGVidWdgLlxuICovXG5jb25zdCBjb2xvcnMgPSBbMiwgMywgNCwgNSwgMV1cblxuLyoqXG4gKiBUaGlzIGNvbG9yIGlzIHJlc2VydmVkIGZvciBgaG9wcGAgbG9ncy5cbiAqL1xuY29uc3QgSE9QUF9DT0xPUiA9IDZcblxuLyoqXG4gKiBNYW5hZ2UgZGlzdHJpYnV0ZWQgY29sb3JzLlxuICovXG5sZXQgY29sb3IgPSAtMVxuZnVuY3Rpb24gbmV4dENvbG9yKCkge1xuICBjb2xvciArPSAxXG4gIGNvbG9yID0gY29sb3IgPT09IGNvbG9ycy5sZW5ndGggPyAwIDogY29sb3JcblxuICByZXR1cm4gY29sb3JzW2NvbG9yXVxufVxuXG4vKipcbiAqIEJhc2ljIGF0dGVtcHQgdG8gZmlndXJlIG91dCBpZiBjb2xvcnMgc2hvdWxkXG4gKiBiZSB1c2VkIG9yIG5vdC5cbiAqL1xuY29uc3QgdXNlQ29sb3JzID0gcHJvY2Vzcy5zdGRvdXQuaXNUVFlcblxuLyoqXG4gKiBDcmVhdGUgZXJyb3IgbWFyay5cbiAqL1xuY29uc3QgRVJST1IgPSB1c2VDb2xvcnMgPyAnXFx1MDAxYlszMW3inJZcXHUwMDFiWzM5bScgOiAn4pyWJ1xuXG4vKipcbiAqIFdyYXBzIGEgc3RyaW5nIHdpdGggY29sb3IgZXNjYXBlcy5cbiAqL1xuZnVuY3Rpb24gd3JhcENvbG9yKCBzdHIgKSB7XG4gIGNvbnN0IGNvbG9yID0gc3RyID09PSAnaG9wcCcgPyBIT1BQX0NPTE9SIDogbmV4dENvbG9yKClcbiAgcmV0dXJuIHVzZUNvbG9ycyA/IGBcXHUwMDFiWzMke2NvbG9yfW0ke3N0cn1cXHUwMDFiWzM5bWAgOiBzdHJcbn1cblxuLyoqXG4gKiBEaW1pZnkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBkaW0oIHN0ciApIHtcbiAgcmV0dXJuIGBcXHUwMDFiWzkwbSR7c3RyfVxcdTAwMWJbMzltYFxufVxuXG4vKipcbiAqIENyZWF0ZSBnZW5lcmljIGxvZ2dlciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gZm10KG5hbWVzcGFjZSwgbG9nLCBtc2cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChtc2cpIHtcbiAgICBpZiAobG9nICE9PSAnZGVidWcnIHx8IHByb2Nlc3MuZW52LkhPUFBfREVCVUcgIT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBjb25zb2xlW2xvZyA9PT0gJ2RlYnVnJyA/ICdlcnJvcicgOiBsb2ddLmFwcGx5KFxuICAgICAgICBjb25zb2xlLFxuICAgICAgICBbYCAke2xvZyA9PT0gJ2Vycm9yJyA/IEVSUk9SIDogJyAnfSAke25hbWVzcGFjZX0gJHtsb2cgPT09ICdkZWJ1ZycgPyBkaW0obXNnKSA6IG1zZ31gXVxuICAgICAgICAgIC5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENhY2hlIGxvZ2dlcnMgZm9yIHJlcGVhdCBjYWxscy5cbiAqL1xuY29uc3QgY2FjaGUgPSB7fVxuXG4vKipcbiAqIENyZWF0ZSBkZWJ1Zy1saWtlIGxvZ2dlcnMgYXR0YWNoZWQgdG8gZ2l2ZW5cbiAqIG5hbWVzcGFjZSAmIHN0ZG91dCtzdGRlcnIuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIHRoZSBuYW1lc3BhY2UgdG8gbG9jayB5b3VyIGxvZ2dlciBpbnRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRhaW5zIGxvZywgZGVidWcsIGFuZCBlcnJvciBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gbmFtZXNwYWNlID0+IHtcbiAgLy8gY2hlY2sgY2FjaGVcbiAgY29uc3Qgbm0gPSBuYW1lc3BhY2VcbiAgaWYgKGNhY2hlW25tXSkgcmV0dXJuIGNhY2hlW25tXVxuXG4gIC8vIGNvbG9yaXplIG5hbWVzcGFjZVxuICBuYW1lc3BhY2UgPSB3cmFwQ29sb3IobmFtZXNwYWNlKVxuXG4gIC8vIHJldHVybiBsb2dnZXJzXG4gIHJldHVybiAoY2FjaGVbbm1dID0ge1xuICAgIGxvZzogZm10KG5hbWVzcGFjZSwgJ2xvZycpLFxuICAgIGRlYnVnOiBmbXQobmFtZXNwYWNlLCAnZGVidWcnKSxcbiAgICBlcnJvcjogZm10KG5hbWVzcGFjZSwgJ2Vycm9yJylcbiAgfSlcbn0iXX0=