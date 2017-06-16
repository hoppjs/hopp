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

  return number.match(new RegExp(`([0-9]{4})|([0-9]{${number.length % 4}})`, 'g')).map(num => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy91bmludW0uanMiXSwibmFtZXMiOlsidG9TdHJpbmciLCJ0b051bWJlciIsIm51bWJlciIsIlN0cmluZyIsIm1hdGNoIiwiUmVnRXhwIiwibGVuZ3RoIiwibWFwIiwibnVtIiwiZnJvbUNvZGVQb2ludCIsImpvaW4iLCJzdHJpbmciLCJpIiwiY29kZVBvaW50QXQiXSwibWFwcGluZ3MiOiI7Ozs7O1FBTWdCQSxRLEdBQUFBLFE7UUFRQUMsUSxHQUFBQSxRO0FBZGhCOzs7Ozs7QUFNTyxTQUFTRCxRQUFULENBQW1CRSxNQUFuQixFQUE0QjtBQUNqQ0EsV0FBU0MsT0FBT0QsTUFBUCxDQUFUOztBQUVBLFNBQU9BLE9BQU9FLEtBQVAsQ0FBYSxJQUFJQyxNQUFKLENBQVkscUJBQXFCSCxPQUFPSSxNQUFQLEdBQWdCLENBQUcsSUFBcEQsRUFBeUQsR0FBekQsQ0FBYixFQUE0RUMsR0FBNUUsQ0FBZ0ZDLE9BQU87QUFDNUYsV0FBT0wsT0FBT00sYUFBUCxDQUFxQixDQUFDRCxHQUF0QixDQUFQO0FBQ0QsR0FGTSxFQUVKRSxJQUZJLENBRUMsRUFGRCxDQUFQO0FBR0Q7O0FBRU0sU0FBU1QsUUFBVCxDQUFtQlUsTUFBbkIsRUFBNEI7QUFDakMsTUFBSSxDQUFDQSxNQUFMLEVBQWEsT0FBTyxDQUFQOztBQUViLE1BQUlULFNBQVMsRUFBYjs7QUFFQSxPQUFLLElBQUlVLElBQUksQ0FBYixFQUFnQkEsSUFBSUQsT0FBT0wsTUFBM0IsRUFBbUNNLEtBQUssQ0FBeEMsRUFBMkM7QUFDekNWLGNBQVVTLE9BQU9FLFdBQVAsQ0FBbUJELENBQW5CLENBQVY7QUFDRDs7QUFFRCxTQUFPLENBQUNWLE1BQVI7QUFDRCIsImZpbGUiOiJ1bmludW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91bmludW0uanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRvU3RyaW5nKCBudW1iZXIgKSB7XG4gIG51bWJlciA9IFN0cmluZyhudW1iZXIpXG5cbiAgcmV0dXJuIG51bWJlci5tYXRjaChuZXcgUmVnRXhwKGAoWzAtOV17NH0pfChbMC05XXskeyBudW1iZXIubGVuZ3RoICUgNCB9fSlgLCAnZycpKS5tYXAobnVtID0+IHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoK251bSlcbiAgfSkuam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTnVtYmVyKCBzdHJpbmcgKSB7XG4gIGlmICghc3RyaW5nKSByZXR1cm4gMFxuXG4gIGxldCBudW1iZXIgPSAnJ1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbnVtYmVyICs9IHN0cmluZy5jb2RlUG9pbnRBdChpKVxuICB9XG5cbiAgcmV0dXJuICtudW1iZXJcbn0iXX0=