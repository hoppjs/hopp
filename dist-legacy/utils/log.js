'use strict';

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Selected colors - borrowed from `debug`.
 */
var colors = [2, 3, 4, 5, 1];

/**
 * This color is reserved for `hopp` logs.
 */
/**
 * @file src/utils/log.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiSE9QUF9DT0xPUiIsImNvbG9yIiwibmV4dENvbG9yIiwibGVuZ3RoIiwidXNlQ29sb3JzIiwicHJvY2VzcyIsInN0ZG91dCIsImlzVFRZIiwiRVJST1IiLCJ3cmFwQ29sb3IiLCJzdHIiLCJkaW0iLCJmbXQiLCJuYW1lc3BhY2UiLCJsb2ciLCJtc2ciLCJlbnYiLCJIT1BQX0RFQlVHIiwiY29uc29sZSIsImFwcGx5IiwiY29uY2F0Iiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwiY2FjaGUiLCJtb2R1bGUiLCJleHBvcnRzIiwibm0iLCJkZWJ1ZyIsImVycm9yIl0sIm1hcHBpbmdzIjoiOztBQU1BOzs7Ozs7QUFFQTs7O0FBR0EsSUFBTUEsU0FBUyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBQWY7O0FBRUE7OztBQWJBOzs7Ozs7QUFnQkEsSUFBTUMsYUFBYSxDQUFuQjs7QUFFQTs7O0FBR0EsSUFBSUMsUUFBUSxDQUFDLENBQWI7QUFDQSxTQUFTQyxTQUFULEdBQXFCO0FBQ25CRCxXQUFTLENBQVQ7QUFDQUEsVUFBUUEsVUFBVUYsT0FBT0ksTUFBakIsR0FBMEIsQ0FBMUIsR0FBOEJGLEtBQXRDOztBQUVBLFNBQU9GLE9BQU9FLEtBQVAsQ0FBUDtBQUNEOztBQUVEOzs7O0FBSUEsSUFBTUcsWUFBWUMsUUFBUUMsTUFBUixDQUFlQyxLQUFqQzs7QUFFQTs7O0FBR0EsSUFBTUMsUUFBUUosWUFBWSx3QkFBWixHQUFzQyxHQUFwRDs7QUFFQTs7O0FBR0EsU0FBU0ssU0FBVCxDQUFvQkMsR0FBcEIsRUFBMEI7QUFDeEIsTUFBTVQsUUFBUVMsUUFBUSxNQUFSLEdBQWlCVixVQUFqQixHQUE4QkUsV0FBNUM7QUFDQSxTQUFPRSx1QkFBdUJILEtBQXZCLFNBQWdDUyxHQUFoQyxnQkFBa0RBLEdBQXpEO0FBQ0Q7O0FBRUQ7OztBQUdBLFNBQVNDLEdBQVQsQ0FBY0QsR0FBZCxFQUFvQjtBQUNsQixzQkFBb0JBLEdBQXBCO0FBQ0Q7O0FBRUQ7OztBQUdBLFNBQVNFLEdBQVQsQ0FBYUMsU0FBYixFQUF3QkMsR0FBeEIsRUFBNkJDLEdBQTdCLEVBQWtDO0FBQ2hDLFNBQU8sVUFBVUEsR0FBVixFQUFlO0FBQ3BCLFFBQUlELFFBQVEsT0FBUixJQUFtQlQsUUFBUVcsR0FBUixDQUFZQyxVQUFaLEtBQTJCLE9BQWxELEVBQTJEO0FBQ3pELGFBQU9DLFFBQVFKLFFBQVEsT0FBUixHQUFrQixPQUFsQixHQUE0QkEsR0FBcEMsRUFBeUNLLEtBQXpDLENBQ0xELE9BREssRUFFTCxRQUFLSixRQUFRLE9BQVIsR0FBa0JOLEtBQWxCLEdBQTBCLEdBQS9CLFVBQXNDSyxTQUF0QyxVQUFtREMsUUFBUSxPQUFSLEdBQWtCSCxJQUFJSSxHQUFKLENBQWxCLEdBQTZCQSxHQUFoRixHQUNHSyxNQURILENBQ1UsR0FBR0MsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQWQsRUFBeUIsQ0FBekIsQ0FEVixDQUZLLENBQVA7QUFLRDtBQUNGLEdBUkQ7QUFTRDs7QUFFRDs7O0FBR0EsSUFBTUMsUUFBUSxFQUFkOztBQUVBOzs7Ozs7QUFNQUMsT0FBT0MsT0FBUCxHQUFpQixxQkFBYTtBQUM1QjtBQUNBLE1BQU1DLEtBQUtkLFNBQVg7QUFDQSxNQUFJVyxNQUFNRyxFQUFOLENBQUosRUFBZSxPQUFPSCxNQUFNRyxFQUFOLENBQVA7O0FBRWY7QUFDQWQsY0FBWUosVUFBVUksU0FBVixDQUFaOztBQUVBO0FBQ0EsU0FBUVcsTUFBTUcsRUFBTixJQUFZO0FBQ2xCYixTQUFLRixJQUFJQyxTQUFKLEVBQWUsS0FBZixDQURhO0FBRWxCZSxXQUFPaEIsSUFBSUMsU0FBSixFQUFlLE9BQWYsQ0FGVztBQUdsQmdCLFdBQU9qQixJQUFJQyxTQUFKLEVBQWUsT0FBZjtBQUhXLEdBQXBCO0FBS0QsQ0FkRCIsImZpbGUiOiJsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2cuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcblxuLyoqXG4gKiBTZWxlY3RlZCBjb2xvcnMgLSBib3Jyb3dlZCBmcm9tIGBkZWJ1Z2AuXG4gKi9cbmNvbnN0IGNvbG9ycyA9IFsyLCAzLCA0LCA1LCAxXVxuXG4vKipcbiAqIFRoaXMgY29sb3IgaXMgcmVzZXJ2ZWQgZm9yIGBob3BwYCBsb2dzLlxuICovXG5jb25zdCBIT1BQX0NPTE9SID0gNlxuXG4vKipcbiAqIE1hbmFnZSBkaXN0cmlidXRlZCBjb2xvcnMuXG4gKi9cbmxldCBjb2xvciA9IC0xXG5mdW5jdGlvbiBuZXh0Q29sb3IoKSB7XG4gIGNvbG9yICs9IDFcbiAgY29sb3IgPSBjb2xvciA9PT0gY29sb3JzLmxlbmd0aCA/IDAgOiBjb2xvclxuXG4gIHJldHVybiBjb2xvcnNbY29sb3JdXG59XG5cbi8qKlxuICogQmFzaWMgYXR0ZW1wdCB0byBmaWd1cmUgb3V0IGlmIGNvbG9ycyBzaG91bGRcbiAqIGJlIHVzZWQgb3Igbm90LlxuICovXG5jb25zdCB1c2VDb2xvcnMgPSBwcm9jZXNzLnN0ZG91dC5pc1RUWVxuXG4vKipcbiAqIENyZWF0ZSBlcnJvciBtYXJrLlxuICovXG5jb25zdCBFUlJPUiA9IHVzZUNvbG9ycyA/ICdcXHUwMDFiWzMxbeKcllxcdTAwMWJbMzltJyA6ICfinJYnXG5cbi8qKlxuICogV3JhcHMgYSBzdHJpbmcgd2l0aCBjb2xvciBlc2NhcGVzLlxuICovXG5mdW5jdGlvbiB3cmFwQ29sb3IoIHN0ciApIHtcbiAgY29uc3QgY29sb3IgPSBzdHIgPT09ICdob3BwJyA/IEhPUFBfQ09MT1IgOiBuZXh0Q29sb3IoKVxuICByZXR1cm4gdXNlQ29sb3JzID8gYFxcdTAwMWJbMyR7Y29sb3J9bSR7c3RyfVxcdTAwMWJbMzltYCA6IHN0clxufVxuXG4vKipcbiAqIERpbWlmeSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRpbSggc3RyICkge1xuICByZXR1cm4gYFxcdTAwMWJbOTBtJHtzdHJ9XFx1MDAxYlszOW1gXG59XG5cbi8qKlxuICogQ3JlYXRlIGdlbmVyaWMgbG9nZ2VyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBmbXQobmFtZXNwYWNlLCBsb2csIG1zZykge1xuICByZXR1cm4gZnVuY3Rpb24gKG1zZykge1xuICAgIGlmIChsb2cgIT09ICdkZWJ1ZycgfHwgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyAhPT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGNvbnNvbGVbbG9nID09PSAnZGVidWcnID8gJ2Vycm9yJyA6IGxvZ10uYXBwbHkoXG4gICAgICAgIGNvbnNvbGUsXG4gICAgICAgIFtgICR7bG9nID09PSAnZXJyb3InID8gRVJST1IgOiAnICd9ICR7bmFtZXNwYWNlfSAke2xvZyA9PT0gJ2RlYnVnJyA/IGRpbShtc2cpIDogbXNnfWBdXG4gICAgICAgICAgLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2FjaGUgbG9nZ2VycyBmb3IgcmVwZWF0IGNhbGxzLlxuICovXG5jb25zdCBjYWNoZSA9IHt9XG5cbi8qKlxuICogQ3JlYXRlIGRlYnVnLWxpa2UgbG9nZ2VycyBhdHRhY2hlZCB0byBnaXZlblxuICogbmFtZXNwYWNlICYgc3Rkb3V0K3N0ZGVyci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgdGhlIG5hbWVzcGFjZSB0byBsb2NrIHlvdXIgbG9nZ2VyIGludG9cbiAqIEByZXR1cm4ge09iamVjdH0gY29udGFpbnMgbG9nLCBkZWJ1ZywgYW5kIGVycm9yIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBuYW1lc3BhY2UgPT4ge1xuICAvLyBjaGVjayBjYWNoZVxuICBjb25zdCBubSA9IG5hbWVzcGFjZVxuICBpZiAoY2FjaGVbbm1dKSByZXR1cm4gY2FjaGVbbm1dXG5cbiAgLy8gY29sb3JpemUgbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSA9IHdyYXBDb2xvcihuYW1lc3BhY2UpXG5cbiAgLy8gcmV0dXJuIGxvZ2dlcnNcbiAgcmV0dXJuIChjYWNoZVtubV0gPSB7XG4gICAgbG9nOiBmbXQobmFtZXNwYWNlLCAnbG9nJyksXG4gICAgZGVidWc6IGZtdChuYW1lc3BhY2UsICdkZWJ1ZycpLFxuICAgIGVycm9yOiBmbXQobmFtZXNwYWNlLCAnZXJyb3InKVxuICB9KVxufSJdfQ==