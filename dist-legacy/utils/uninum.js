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
  return String(number).match(/([0-9]{4})|([0-9]{3})|([0-9]{2})|([0-9]{1})/g).map(function (num) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy91bmludW0uanMiXSwibmFtZXMiOlsidG9TdHJpbmciLCJ0b051bWJlciIsIm51bWJlciIsIlN0cmluZyIsIm1hdGNoIiwibWFwIiwiZnJvbUNvZGVQb2ludCIsIm51bSIsImpvaW4iLCJzdHJpbmciLCJpIiwibGVuZ3RoIiwiY29kZVBvaW50QXQiXSwibWFwcGluZ3MiOiI7Ozs7O1FBTWdCQSxRLEdBQUFBLFE7UUFNQUMsUSxHQUFBQSxRO0FBWmhCOzs7Ozs7QUFNTyxTQUFTRCxRQUFULENBQW1CRSxNQUFuQixFQUE0QjtBQUNqQyxTQUFPQyxPQUFPRCxNQUFQLEVBQWVFLEtBQWYsQ0FBcUIsOENBQXJCLEVBQXFFQyxHQUFyRSxDQUF5RSxlQUFPO0FBQ3JGLFdBQU9GLE9BQU9HLGFBQVAsQ0FBcUIsQ0FBQ0MsR0FBdEIsQ0FBUDtBQUNELEdBRk0sRUFFSkMsSUFGSSxDQUVDLEVBRkQsQ0FBUDtBQUdEOztBQUVNLFNBQVNQLFFBQVQsQ0FBbUJRLE1BQW5CLEVBQTRCO0FBQ2pDLE1BQUksQ0FBQ0EsTUFBTCxFQUFhLE9BQU8sQ0FBUDs7QUFFYixNQUFJUCxTQUFTLEVBQWI7O0FBRUEsT0FBSyxJQUFJUSxJQUFJLENBQWIsRUFBZ0JBLElBQUlELE9BQU9FLE1BQTNCLEVBQW1DRCxLQUFLLENBQXhDLEVBQTJDO0FBQ3pDUixjQUFVTyxPQUFPRyxXQUFQLENBQW1CRixDQUFuQixDQUFWO0FBQ0Q7O0FBRUQsU0FBTyxDQUFDUixNQUFSO0FBQ0QiLCJmaWxlIjoidW5pbnVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdW5pbnVtLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0b1N0cmluZyggbnVtYmVyICkge1xuICByZXR1cm4gU3RyaW5nKG51bWJlcikubWF0Y2goLyhbMC05XXs0fSl8KFswLTldezN9KXwoWzAtOV17Mn0pfChbMC05XXsxfSkvZykubWFwKG51bSA9PiB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KCtudW0pXG4gIH0pLmpvaW4oJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b051bWJlciggc3RyaW5nICkge1xuICBpZiAoIXN0cmluZykgcmV0dXJuIDBcblxuICBsZXQgbnVtYmVyID0gJydcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIG51bWJlciArPSBzdHJpbmcuY29kZVBvaW50QXQoaSlcbiAgfVxuXG4gIHJldHVybiArbnVtYmVyXG59Il19