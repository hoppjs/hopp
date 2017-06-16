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
  number = String(number);

  return number.match(new RegExp('([0-9]{4})|([0-9]{' + number.length % 4 + '})', 'g')).map(function (num) {
    return String.fromCodePoint(+num);
  }).join('');
}

function toNumber(string) {
  if (!string) return 0;

  var number = '';

  for (var i = 0; i < string.length; i += 1) {
    number += string.codePointAt(i);
  }

  return +number;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy91bmludW0uanMiXSwibmFtZXMiOlsidG9TdHJpbmciLCJ0b051bWJlciIsIm51bWJlciIsIlN0cmluZyIsIm1hdGNoIiwiUmVnRXhwIiwibGVuZ3RoIiwibWFwIiwiZnJvbUNvZGVQb2ludCIsIm51bSIsImpvaW4iLCJzdHJpbmciLCJpIiwiY29kZVBvaW50QXQiXSwibWFwcGluZ3MiOiI7Ozs7O1FBTWdCQSxRLEdBQUFBLFE7UUFRQUMsUSxHQUFBQSxRO0FBZGhCOzs7Ozs7QUFNTyxTQUFTRCxRQUFULENBQW1CRSxNQUFuQixFQUE0QjtBQUNqQ0EsV0FBU0MsT0FBT0QsTUFBUCxDQUFUOztBQUVBLFNBQU9BLE9BQU9FLEtBQVAsQ0FBYSxJQUFJQyxNQUFKLHdCQUFpQ0gsT0FBT0ksTUFBUCxHQUFnQixDQUFqRCxTQUF5RCxHQUF6RCxDQUFiLEVBQTRFQyxHQUE1RSxDQUFnRixlQUFPO0FBQzVGLFdBQU9KLE9BQU9LLGFBQVAsQ0FBcUIsQ0FBQ0MsR0FBdEIsQ0FBUDtBQUNELEdBRk0sRUFFSkMsSUFGSSxDQUVDLEVBRkQsQ0FBUDtBQUdEOztBQUVNLFNBQVNULFFBQVQsQ0FBbUJVLE1BQW5CLEVBQTRCO0FBQ2pDLE1BQUksQ0FBQ0EsTUFBTCxFQUFhLE9BQU8sQ0FBUDs7QUFFYixNQUFJVCxTQUFTLEVBQWI7O0FBRUEsT0FBSyxJQUFJVSxJQUFJLENBQWIsRUFBZ0JBLElBQUlELE9BQU9MLE1BQTNCLEVBQW1DTSxLQUFLLENBQXhDLEVBQTJDO0FBQ3pDVixjQUFVUyxPQUFPRSxXQUFQLENBQW1CRCxDQUFuQixDQUFWO0FBQ0Q7O0FBRUQsU0FBTyxDQUFDVixNQUFSO0FBQ0QiLCJmaWxlIjoidW5pbnVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdW5pbnVtLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0b1N0cmluZyggbnVtYmVyICkge1xuICBudW1iZXIgPSBTdHJpbmcobnVtYmVyKVxuXG4gIHJldHVybiBudW1iZXIubWF0Y2gobmV3IFJlZ0V4cChgKFswLTldezR9KXwoWzAtOV17JHsgbnVtYmVyLmxlbmd0aCAlIDQgfX0pYCwgJ2cnKSkubWFwKG51bSA9PiB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KCtudW0pXG4gIH0pLmpvaW4oJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b051bWJlciggc3RyaW5nICkge1xuICBpZiAoIXN0cmluZykgcmV0dXJuIDBcblxuICBsZXQgbnVtYmVyID0gJydcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIG51bWJlciArPSBzdHJpbmcuY29kZVBvaW50QXQoaSlcbiAgfVxuXG4gIHJldHVybiArbnVtYmVyXG59Il19