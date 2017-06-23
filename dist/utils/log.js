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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJkZWJ1Z091dHB1dCIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImZvcm1hdCIsImFwcGx5IiwiY29uc29sZSIsImNvbmNhdCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsInB1c2giLCJlbnYiLCJIT1BQX0RFQlVHIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIiwic2F2ZUxvZyIsImRpcmVjdG9yeSIsImpvaW4iLCJFT0wiXSwibWFwcGluZ3MiOiI7O0FBT0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7QUFHQSxNQUFNQSxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FBZjs7QUFFQTs7O0FBbEJBOzs7OztBQUtBOztBQWdCQSxNQUFNQyxhQUFhLENBQW5COztBQUVBOzs7QUFHQSxJQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkJELFdBQVMsQ0FBVDtBQUNBQSxVQUFRQSxVQUFVRixPQUFPSSxNQUFqQixHQUEwQixDQUExQixHQUE4QkYsS0FBdEM7O0FBRUEsU0FBT0YsT0FBT0UsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxNQUFNRyxZQUFZQyxRQUFRQyxNQUFSLENBQWVDLEtBQWpDOztBQUVBOzs7QUFHQSxNQUFNQyxRQUFRSixZQUFZLHVCQUFaLEdBQXNDLEdBQXBEOztBQUVBOzs7QUFHQSxTQUFTSyxTQUFULENBQW9CQyxHQUFwQixFQUEwQjtBQUN4QixRQUFNVCxRQUFRUyxRQUFRLE1BQVIsR0FBaUJWLFVBQWpCLEdBQThCRSxXQUE1QztBQUNBLFNBQU9FLFlBQWEsV0FBVUgsS0FBTSxJQUFHUyxHQUFJLFlBQXBDLEdBQWtEQSxHQUF6RDtBQUNEOztBQUVEOzs7QUFHQSxTQUFTQyxHQUFULENBQWNELEdBQWQsRUFBb0I7QUFDbEIsU0FBUSxhQUFZQSxHQUFJLFlBQXhCO0FBQ0Q7O0FBRUQ7OztBQUdBLE1BQU1FLGNBQWMsRUFBcEI7O0FBRUE7OztBQUdBLFNBQVNDLEdBQVQsQ0FBYUMsU0FBYixFQUF3QkMsR0FBeEIsRUFBNkI7QUFDM0IsU0FBTyxVQUFVQyxHQUFWLEVBQWU7QUFDcEIsVUFBTU4sTUFBTSxlQUFLTyxNQUFMLENBQVlDLEtBQVosQ0FDVkMsT0FEVSxFQUVWLENBQUUsSUFBR0osUUFBUSxPQUFSLEdBQWtCUCxLQUFsQixHQUEwQixHQUFJLElBQUdNLFNBQVUsSUFBR0MsUUFBUSxPQUFSLEdBQWtCSixJQUFJSyxHQUFKLENBQWxCLEdBQTZCQSxHQUFJLEVBQXBGLEVBQ0dJLE1BREgsQ0FDVSxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxFQUF5QixDQUF6QixDQURWLENBRlUsQ0FBWjs7QUFNQTtBQUNBWCxnQkFBWVksSUFBWixDQUFpQix5QkFBTWQsR0FBTixDQUFqQjs7QUFFQTtBQUNBLFFBQUlLLFFBQVEsT0FBUixJQUFtQlYsUUFBUW9CLEdBQVIsQ0FBWUMsVUFBWixLQUEyQixPQUFsRCxFQUEyRDtBQUN6RCxhQUFPUCxRQUFRSixRQUFRLE9BQVIsR0FBa0IsT0FBbEIsR0FBNEJBLEdBQXBDLEVBQXlDTCxHQUF6QyxDQUFQO0FBQ0Q7QUFDRixHQWREO0FBZUQ7O0FBRUQ7OztBQUdBLE1BQU1pQixRQUFRLEVBQWQ7O0FBRUE7Ozs7OztBQU1BQyxPQUFPQyxPQUFQLEdBQWlCZixhQUFhO0FBQzVCO0FBQ0EsUUFBTWdCLEtBQUtoQixTQUFYO0FBQ0EsTUFBSWEsTUFBTUcsRUFBTixDQUFKLEVBQWUsT0FBT0gsTUFBTUcsRUFBTixDQUFQOztBQUVmO0FBQ0FoQixjQUFZTCxVQUFVSyxTQUFWLENBQVo7O0FBRUE7QUFDQSxTQUFRYSxNQUFNRyxFQUFOLElBQVk7QUFDbEJmLFNBQUtGLElBQUlDLFNBQUosRUFBZSxLQUFmLENBRGE7QUFFbEJpQixXQUFPbEIsSUFBSUMsU0FBSixFQUFlLE9BQWYsQ0FGVztBQUdsQmtCLFdBQU9uQixJQUFJQyxTQUFKLEVBQWUsT0FBZjtBQUhXLEdBQXBCO0FBS0QsQ0FkRDs7QUFnQkE7OztBQUdBYyxPQUFPQyxPQUFQLENBQWVJLE9BQWYsR0FBeUIsTUFBTUMsU0FBTixJQUFtQjtBQUMxQyxRQUFNLG1CQUFVLGVBQUtDLElBQUwsQ0FBVUQsU0FBVixFQUFxQixnQkFBckIsQ0FBVixFQUFrRHRCLFlBQVl1QixJQUFaLENBQWlCLGFBQUdDLEdBQXBCLENBQWxELENBQU47O0FBRUFqQixVQUFRYSxLQUFSLENBQWMsNEJBQWQsRUFBNENFLFNBQTVDO0FBQ0FmLFVBQVFhLEtBQVIsQ0FBYywwRkFBZCxFQUEwRyxXQUExRyxFQUF1SCxZQUF2SDtBQUNELENBTEQiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9nLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG4vKiBlc2xpbnQgbm8tY29uc29sZTogJ29mZicgKi9cblxuaW1wb3J0IG9zIGZyb20gJ29zJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgc3RyaXAgZnJvbSAnc3RyaXAtYW5zaSdcbmltcG9ydCB7IHdyaXRlRmlsZSB9IGZyb20gJy4uL2ZzJ1xuXG4vKipcbiAqIFNlbGVjdGVkIGNvbG9ycyAtIGJvcnJvd2VkIGZyb20gYGRlYnVnYC5cbiAqL1xuY29uc3QgY29sb3JzID0gWzIsIDMsIDQsIDUsIDFdXG5cbi8qKlxuICogVGhpcyBjb2xvciBpcyByZXNlcnZlZCBmb3IgYGhvcHBgIGxvZ3MuXG4gKi9cbmNvbnN0IEhPUFBfQ09MT1IgPSA2XG5cbi8qKlxuICogTWFuYWdlIGRpc3RyaWJ1dGVkIGNvbG9ycy5cbiAqL1xubGV0IGNvbG9yID0gLTFcbmZ1bmN0aW9uIG5leHRDb2xvcigpIHtcbiAgY29sb3IgKz0gMVxuICBjb2xvciA9IGNvbG9yID09PSBjb2xvcnMubGVuZ3RoID8gMCA6IGNvbG9yXG5cbiAgcmV0dXJuIGNvbG9yc1tjb2xvcl1cbn1cblxuLyoqXG4gKiBCYXNpYyBhdHRlbXB0IHRvIGZpZ3VyZSBvdXQgaWYgY29sb3JzIHNob3VsZFxuICogYmUgdXNlZCBvciBub3QuXG4gKi9cbmNvbnN0IHVzZUNvbG9ycyA9IHByb2Nlc3Muc3Rkb3V0LmlzVFRZXG5cbi8qKlxuICogQ3JlYXRlIGVycm9yIG1hcmsuXG4gKi9cbmNvbnN0IEVSUk9SID0gdXNlQ29sb3JzID8gJ1xcdTAwMWJbMzFt4pyWXFx1MDAxYlszOW0nIDogJ+KclidcblxuLyoqXG4gKiBXcmFwcyBhIHN0cmluZyB3aXRoIGNvbG9yIGVzY2FwZXMuXG4gKi9cbmZ1bmN0aW9uIHdyYXBDb2xvciggc3RyICkge1xuICBjb25zdCBjb2xvciA9IHN0ciA9PT0gJ2hvcHAnID8gSE9QUF9DT0xPUiA6IG5leHRDb2xvcigpXG4gIHJldHVybiB1c2VDb2xvcnMgPyBgXFx1MDAxYlszJHtjb2xvcn1tJHtzdHJ9XFx1MDAxYlszOW1gIDogc3RyXG59XG5cbi8qKlxuICogRGltaWZ5IHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZGltKCBzdHIgKSB7XG4gIHJldHVybiBgXFx1MDAxYls5MG0ke3N0cn1cXHUwMDFiWzM5bWBcbn1cblxuLyoqXG4gKiBDb21wbGV0ZSByZWNvcmQgb2YgbG9nZ2luZyBldmVudHMuXG4gKi9cbmNvbnN0IGRlYnVnT3V0cHV0ID0gW11cblxuLyoqXG4gKiBDcmVhdGUgZ2VuZXJpYyBsb2dnZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGZtdChuYW1lc3BhY2UsIGxvZykge1xuICByZXR1cm4gZnVuY3Rpb24gKG1zZykge1xuICAgIGNvbnN0IHN0ciA9IHV0aWwuZm9ybWF0LmFwcGx5KFxuICAgICAgY29uc29sZSxcbiAgICAgIFtgICR7bG9nID09PSAnZXJyb3InID8gRVJST1IgOiAnICd9ICR7bmFtZXNwYWNlfSAke2xvZyA9PT0gJ2RlYnVnJyA/IGRpbShtc2cpIDogbXNnfWBdXG4gICAgICAgIC5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgIClcblxuICAgIC8vIGFkZCB0byByZWNvcmRcbiAgICBkZWJ1Z091dHB1dC5wdXNoKHN0cmlwKHN0cikpXG5cbiAgICAvLyBsb2cgdG8gY29uc29sZVxuICAgIGlmIChsb2cgIT09ICdkZWJ1ZycgfHwgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyAhPT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGNvbnNvbGVbbG9nID09PSAnZGVidWcnID8gJ2Vycm9yJyA6IGxvZ10oc3RyKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENhY2hlIGxvZ2dlcnMgZm9yIHJlcGVhdCBjYWxscy5cbiAqL1xuY29uc3QgY2FjaGUgPSB7fVxuXG4vKipcbiAqIENyZWF0ZSBkZWJ1Zy1saWtlIGxvZ2dlcnMgYXR0YWNoZWQgdG8gZ2l2ZW5cbiAqIG5hbWVzcGFjZSAmIHN0ZG91dCtzdGRlcnIuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIHRoZSBuYW1lc3BhY2UgdG8gbG9jayB5b3VyIGxvZ2dlciBpbnRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNvbnRhaW5zIGxvZywgZGVidWcsIGFuZCBlcnJvciBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gbmFtZXNwYWNlID0+IHtcbiAgLy8gY2hlY2sgY2FjaGVcbiAgY29uc3Qgbm0gPSBuYW1lc3BhY2VcbiAgaWYgKGNhY2hlW25tXSkgcmV0dXJuIGNhY2hlW25tXVxuXG4gIC8vIGNvbG9yaXplIG5hbWVzcGFjZVxuICBuYW1lc3BhY2UgPSB3cmFwQ29sb3IobmFtZXNwYWNlKVxuXG4gIC8vIHJldHVybiBsb2dnZXJzXG4gIHJldHVybiAoY2FjaGVbbm1dID0ge1xuICAgIGxvZzogZm10KG5hbWVzcGFjZSwgJ2xvZycpLFxuICAgIGRlYnVnOiBmbXQobmFtZXNwYWNlLCAnZGVidWcnKSxcbiAgICBlcnJvcjogZm10KG5hbWVzcGFjZSwgJ2Vycm9yJylcbiAgfSlcbn1cblxuLyoqXG4gKiBXcml0ZSBkZWJ1ZyBsb2cgdG8gZmlsZSBvbiBmYWlsdXJlLlxuICovXG5tb2R1bGUuZXhwb3J0cy5zYXZlTG9nID0gYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgYXdhaXQgd3JpdGVGaWxlKHBhdGguam9pbihkaXJlY3RvcnksICdob3BwLWRlYnVnLmxvZycpLCBkZWJ1Z091dHB1dC5qb2luKG9zLkVPTCkpXG5cbiAgY29uc29sZS5lcnJvcignXFxuU2F2ZWQgZGVidWcgaW5mbyB0bzogJXMuJywgZGlyZWN0b3J5KVxuICBjb25zb2xlLmVycm9yKCdQbGVhc2UgdXNlIHRoaXMgbG9nIGZpbGUgdG8gc3VibWl0IGFuIGlzc3VlIEAgJXNodHRwczovL2dpdGh1Yi5jb20vaG9wcGpzL2hvcHAvaXNzdWVzJXMuJywgJ1xcdTAwMUJbNG0nLCAnXFx1MDAxQlsyNG0nKVxufVxuIl19