"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/utils/fn.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Makes async functions deterministic.
 */
exports.default = fn => {
  const cache = {};

  return async function () {
    const args = [].slice.call(arguments);
    const last = args.pop();

    let val = cache;
    for (let i = 0, a = args[0]; i < args.length; i += 1, a = args[i]) {
      val = val[a] = val[a] || {};
    }

    if (!val.hasOwnProperty(last)) {
      return val[last] = await fn.apply(this, args.concat([last]));
    }

    return val[last];
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9mbi5qcyJdLCJuYW1lcyI6WyJmbiIsImNhY2hlIiwiYXJncyIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImxhc3QiLCJwb3AiLCJ2YWwiLCJpIiwiYSIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiYXBwbHkiLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7QUFNQTs7O2tCQUdlQSxNQUFNO0FBQ25CLFFBQU1DLFFBQVEsRUFBZDs7QUFFQSxTQUFPLGtCQUFrQjtBQUN2QixVQUFNQyxPQUFPLEdBQUdDLEtBQUgsQ0FBU0MsSUFBVCxDQUFjQyxTQUFkLENBQWI7QUFDQSxVQUFNQyxPQUFPSixLQUFLSyxHQUFMLEVBQWI7O0FBRUEsUUFBSUMsTUFBTVAsS0FBVjtBQUNBLFNBQUssSUFBSVEsSUFBSSxDQUFSLEVBQVdDLElBQUlSLEtBQUssQ0FBTCxDQUFwQixFQUE2Qk8sSUFBSVAsS0FBS1MsTUFBdEMsRUFBOENGLEtBQUssQ0FBTCxFQUFRQyxJQUFJUixLQUFLTyxDQUFMLENBQTFELEVBQW1FO0FBQ2pFRCxZQUFNQSxJQUFJRSxDQUFKLElBQVNGLElBQUlFLENBQUosS0FBVSxFQUF6QjtBQUNEOztBQUVELFFBQUksQ0FBQ0YsSUFBSUksY0FBSixDQUFtQk4sSUFBbkIsQ0FBTCxFQUErQjtBQUM3QixhQUFPRSxJQUFJRixJQUFKLElBQVksTUFBTU4sR0FBR2EsS0FBSCxDQUFTLElBQVQsRUFBZVgsS0FBS1ksTUFBTCxDQUFZLENBQUNSLElBQUQsQ0FBWixDQUFmLENBQXpCO0FBQ0Q7O0FBRUQsV0FBT0UsSUFBSUYsSUFBSixDQUFQO0FBQ0QsR0FkRDtBQWVELEMiLCJmaWxlIjoiZm4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9mbi5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG4vKipcbiAqIE1ha2VzIGFzeW5jIGZ1bmN0aW9ucyBkZXRlcm1pbmlzdGljLlxuICovXG5leHBvcnQgZGVmYXVsdCBmbiA9PiB7XG4gIGNvbnN0IGNhY2hlID0ge31cblxuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBjb25zdCBsYXN0ID0gYXJncy5wb3AoKVxuXG4gICAgbGV0IHZhbCA9IGNhY2hlXG4gICAgZm9yIChsZXQgaSA9IDAsIGEgPSBhcmdzWzBdOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMSwgYSA9IGFyZ3NbaV0pIHtcbiAgICAgIHZhbCA9IHZhbFthXSA9IHZhbFthXSB8fCB7fVxuICAgIH1cblxuICAgIGlmICghdmFsLmhhc093blByb3BlcnR5KGxhc3QpKSB7XG4gICAgICByZXR1cm4gdmFsW2xhc3RdID0gYXdhaXQgZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW2xhc3RdKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsW2xhc3RdXG4gIH1cbn1cbiJdfQ==