'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toString = toString;
exports.toNumber = toNumber;
/**
 * @file src/uninum.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

function toString(number) {
  return String(number).match(/([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})/g).map(num => {
    return String.fromCodePoint(+num);
  }).join('');
}

function toNumber(string) {
  if (!string) return 0;

  let number = '';

  for (let i = 0; i < string.length; i += 1) {
    number += string.codePointAt(i);
  }

  return +number;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy91bmludW0uanMiXSwibmFtZXMiOlsidG9TdHJpbmciLCJ0b051bWJlciIsIm51bWJlciIsIlN0cmluZyIsIm1hdGNoIiwibWFwIiwibnVtIiwiZnJvbUNvZGVQb2ludCIsImpvaW4iLCJzdHJpbmciLCJpIiwibGVuZ3RoIiwiY29kZVBvaW50QXQiXSwibWFwcGluZ3MiOiI7Ozs7O1FBTWdCQSxRLEdBQUFBLFE7UUFNQUMsUSxHQUFBQSxRO0FBWmhCOzs7Ozs7QUFNTyxTQUFTRCxRQUFULENBQW1CRSxNQUFuQixFQUE0QjtBQUNqQyxTQUFPQyxPQUFPRCxNQUFQLEVBQWVFLEtBQWYsQ0FBcUIsOENBQXJCLEVBQXFFQyxHQUFyRSxDQUF5RUMsT0FBTztBQUNyRixXQUFPSCxPQUFPSSxhQUFQLENBQXFCLENBQUNELEdBQXRCLENBQVA7QUFDRCxHQUZNLEVBRUpFLElBRkksQ0FFQyxFQUZELENBQVA7QUFHRDs7QUFFTSxTQUFTUCxRQUFULENBQW1CUSxNQUFuQixFQUE0QjtBQUNqQyxNQUFJLENBQUNBLE1BQUwsRUFBYSxPQUFPLENBQVA7O0FBRWIsTUFBSVAsU0FBUyxFQUFiOztBQUVBLE9BQUssSUFBSVEsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRCxPQUFPRSxNQUEzQixFQUFtQ0QsS0FBSyxDQUF4QyxFQUEyQztBQUN6Q1IsY0FBVU8sT0FBT0csV0FBUCxDQUFtQkYsQ0FBbkIsQ0FBVjtBQUNEOztBQUVELFNBQU8sQ0FBQ1IsTUFBUjtBQUNEIiwiZmlsZSI6InVuaW51bS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3VuaW51bS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdG9TdHJpbmcoIG51bWJlciApIHtcbiAgcmV0dXJuIFN0cmluZyhudW1iZXIpLm1hdGNoKC8oWzAtOV17NH0pfChbMC05XXszfSl8KFswLTldezJ9KXwoWzAtOV17MX0pL2cpLm1hcChudW0gPT4ge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludCgrbnVtKVxuICB9KS5qb2luKCcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9OdW1iZXIoIHN0cmluZyApIHtcbiAgaWYgKCFzdHJpbmcpIHJldHVybiAwXG5cbiAgbGV0IG51bWJlciA9ICcnXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBudW1iZXIgKz0gc3RyaW5nLmNvZGVQb2ludEF0KGkpXG4gIH1cblxuICByZXR1cm4gK251bWJlclxufSJdfQ==