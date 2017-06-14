'use strict';

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Selected colors - borrowed from `debug`.
 */
const colors = [6, 2, 3, 4, 5, 1];

/**
 * Manage distributed colors.
 */
/**
 * @file src/utils/log.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
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
  const color = nextColor();
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
  namespace = wrapColor(namespace

  // return loggers
  );return cache[nm] = {
    log: fmt(namespace, 'log'),
    debug: fmt(namespace, 'debug'),
    error: fmt(namespace, 'error')
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9sb2cuanMiXSwibmFtZXMiOlsiY29sb3JzIiwiY29sb3IiLCJuZXh0Q29sb3IiLCJsZW5ndGgiLCJ1c2VDb2xvcnMiLCJwcm9jZXNzIiwic3Rkb3V0IiwiaXNUVFkiLCJFUlJPUiIsIndyYXBDb2xvciIsInN0ciIsImRpbSIsImZtdCIsIm5hbWVzcGFjZSIsImxvZyIsIm1zZyIsImVudiIsIkhPUFBfREVCVUciLCJjb25zb2xlIiwiYXBwbHkiLCJjb25jYXQiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJjYWNoZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJubSIsImRlYnVnIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7OztBQUVBOzs7QUFHQSxNQUFNQSxTQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZjs7QUFFQTs7O0FBYkE7Ozs7OztBQWdCQSxJQUFJQyxRQUFRLENBQUMsQ0FBYjtBQUNBLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkJELFdBQVMsQ0FBVDtBQUNBQSxVQUFRQSxVQUFVRCxPQUFPRyxNQUFqQixHQUEwQixDQUExQixHQUE4QkYsS0FBdEM7O0FBRUEsU0FBT0QsT0FBT0MsS0FBUCxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxNQUFNRyxZQUFZQyxRQUFRQyxNQUFSLENBQWVDLEtBQWpDOztBQUVBOzs7QUFHQSxNQUFNQyxRQUFRSixZQUFZLHVCQUFaLEdBQXNDLEdBQXBEOztBQUVBOzs7QUFHQSxTQUFTSyxTQUFULENBQW9CQyxHQUFwQixFQUEwQjtBQUN4QixRQUFNVCxRQUFRQyxXQUFkO0FBQ0EsU0FBT0UsWUFBYSxXQUFVSCxLQUFNLElBQUdTLEdBQUksWUFBcEMsR0FBa0RBLEdBQXpEO0FBQ0Q7O0FBRUQ7OztBQUdBLFNBQVNDLEdBQVQsQ0FBY0QsR0FBZCxFQUFvQjtBQUNsQixTQUFRLGFBQVlBLEdBQUksWUFBeEI7QUFDRDs7QUFFRDs7O0FBR0EsU0FBU0UsR0FBVCxDQUFhQyxTQUFiLEVBQXdCQyxHQUF4QixFQUE2QkMsR0FBN0IsRUFBa0M7QUFDaEMsU0FBTyxVQUFVQSxHQUFWLEVBQWU7QUFDcEIsUUFBSUQsUUFBUSxPQUFSLElBQW1CVCxRQUFRVyxHQUFSLENBQVlDLFVBQVosS0FBMkIsT0FBbEQsRUFBMkQ7QUFDekQsYUFBT0MsUUFBUUosUUFBUSxPQUFSLEdBQWtCLE9BQWxCLEdBQTRCQSxHQUFwQyxFQUF5Q0ssS0FBekMsQ0FDTEQsT0FESyxFQUVMLENBQUUsSUFBR0osUUFBUSxPQUFSLEdBQWtCTixLQUFsQixHQUEwQixHQUFJLElBQUdLLFNBQVUsSUFBR0MsUUFBUSxPQUFSLEdBQWtCSCxJQUFJSSxHQUFKLENBQWxCLEdBQTZCQSxHQUFJLEVBQXBGLEVBQ0dLLE1BREgsQ0FDVSxHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxFQUF5QixDQUF6QixDQURWLENBRkssQ0FBUDtBQUtEO0FBQ0YsR0FSRDtBQVNEOztBQUVEOzs7QUFHQSxNQUFNQyxRQUFRLEVBQWQ7O0FBRUE7Ozs7OztBQU1BQyxPQUFPQyxPQUFQLEdBQWlCYixhQUFhO0FBQzVCO0FBQ0EsUUFBTWMsS0FBS2QsU0FBWDtBQUNBLE1BQUlXLE1BQU1HLEVBQU4sQ0FBSixFQUFlLE9BQU9ILE1BQU1HLEVBQU4sQ0FBUDs7QUFFZjtBQUNBZCxjQUFZSixVQUFVSTs7QUFFdEI7QUFGWSxHQUFaLENBR0EsT0FBUVcsTUFBTUcsRUFBTixJQUFZO0FBQ2xCYixTQUFLRixJQUFJQyxTQUFKLEVBQWUsS0FBZixDQURhO0FBRWxCZSxXQUFPaEIsSUFBSUMsU0FBSixFQUFlLE9BQWYsQ0FGVztBQUdsQmdCLFdBQU9qQixJQUFJQyxTQUFKLEVBQWUsT0FBZjtBQUhXLEdBQXBCO0FBS0QsQ0FkRCIsImZpbGUiOiJsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2cuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcblxuLyoqXG4gKiBTZWxlY3RlZCBjb2xvcnMgLSBib3Jyb3dlZCBmcm9tIGBkZWJ1Z2AuXG4gKi9cbmNvbnN0IGNvbG9ycyA9IFs2LCAyLCAzLCA0LCA1LCAxXVxuXG4vKipcbiAqIE1hbmFnZSBkaXN0cmlidXRlZCBjb2xvcnMuXG4gKi9cbmxldCBjb2xvciA9IC0xXG5mdW5jdGlvbiBuZXh0Q29sb3IoKSB7XG4gIGNvbG9yICs9IDFcbiAgY29sb3IgPSBjb2xvciA9PT0gY29sb3JzLmxlbmd0aCA/IDAgOiBjb2xvclxuXG4gIHJldHVybiBjb2xvcnNbY29sb3JdXG59XG5cbi8qKlxuICogQmFzaWMgYXR0ZW1wdCB0byBmaWd1cmUgb3V0IGlmIGNvbG9ycyBzaG91bGRcbiAqIGJlIHVzZWQgb3Igbm90LlxuICovXG5jb25zdCB1c2VDb2xvcnMgPSBwcm9jZXNzLnN0ZG91dC5pc1RUWVxuXG4vKipcbiAqIENyZWF0ZSBlcnJvciBtYXJrLlxuICovXG5jb25zdCBFUlJPUiA9IHVzZUNvbG9ycyA/ICdcXHUwMDFiWzMxbeKcllxcdTAwMWJbMzltJyA6ICfinJYnXG5cbi8qKlxuICogV3JhcHMgYSBzdHJpbmcgd2l0aCBjb2xvciBlc2NhcGVzLlxuICovXG5mdW5jdGlvbiB3cmFwQ29sb3IoIHN0ciApIHtcbiAgY29uc3QgY29sb3IgPSBuZXh0Q29sb3IoKVxuICByZXR1cm4gdXNlQ29sb3JzID8gYFxcdTAwMWJbMyR7Y29sb3J9bSR7c3RyfVxcdTAwMWJbMzltYCA6IHN0clxufVxuXG4vKipcbiAqIERpbWlmeSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGRpbSggc3RyICkge1xuICByZXR1cm4gYFxcdTAwMWJbOTBtJHtzdHJ9XFx1MDAxYlszOW1gXG59XG5cbi8qKlxuICogQ3JlYXRlIGdlbmVyaWMgbG9nZ2VyIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBmbXQobmFtZXNwYWNlLCBsb2csIG1zZykge1xuICByZXR1cm4gZnVuY3Rpb24gKG1zZykge1xuICAgIGlmIChsb2cgIT09ICdkZWJ1ZycgfHwgcHJvY2Vzcy5lbnYuSE9QUF9ERUJVRyAhPT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGNvbnNvbGVbbG9nID09PSAnZGVidWcnID8gJ2Vycm9yJyA6IGxvZ10uYXBwbHkoXG4gICAgICAgIGNvbnNvbGUsXG4gICAgICAgIFtgICR7bG9nID09PSAnZXJyb3InID8gRVJST1IgOiAnICd9ICR7bmFtZXNwYWNlfSAke2xvZyA9PT0gJ2RlYnVnJyA/IGRpbShtc2cpIDogbXNnfWBdXG4gICAgICAgICAgLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2FjaGUgbG9nZ2VycyBmb3IgcmVwZWF0IGNhbGxzLlxuICovXG5jb25zdCBjYWNoZSA9IHt9XG5cbi8qKlxuICogQ3JlYXRlIGRlYnVnLWxpa2UgbG9nZ2VycyBhdHRhY2hlZCB0byBnaXZlblxuICogbmFtZXNwYWNlICYgc3Rkb3V0K3N0ZGVyci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgdGhlIG5hbWVzcGFjZSB0byBsb2NrIHlvdXIgbG9nZ2VyIGludG9cbiAqIEByZXR1cm4ge09iamVjdH0gY29udGFpbnMgbG9nLCBkZWJ1ZywgYW5kIGVycm9yIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBuYW1lc3BhY2UgPT4ge1xuICAvLyBjaGVjayBjYWNoZVxuICBjb25zdCBubSA9IG5hbWVzcGFjZVxuICBpZiAoY2FjaGVbbm1dKSByZXR1cm4gY2FjaGVbbm1dXG5cbiAgLy8gY29sb3JpemUgbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSA9IHdyYXBDb2xvcihuYW1lc3BhY2UpXG5cbiAgLy8gcmV0dXJuIGxvZ2dlcnNcbiAgcmV0dXJuIChjYWNoZVtubV0gPSB7XG4gICAgbG9nOiBmbXQobmFtZXNwYWNlLCAnbG9nJyksXG4gICAgZGVidWc6IGZtdChuYW1lc3BhY2UsICdkZWJ1ZycpLFxuICAgIGVycm9yOiBmbXQobmFtZXNwYWNlLCAnZXJyb3InKVxuICB9KVxufSJdfQ==