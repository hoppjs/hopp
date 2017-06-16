"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/_.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

exports.default = array => {
  const maps = [];
  const handler = {
    map(fn) {
      maps.push(fn);
      return handler;
    },

    val() {
      array = array.slice();

      for (let i = 0; i < array.length; i += 1) {
        for (let fn of maps) {
          array[i] = fn(array[i]);
        }
      }

      return array;
    }
  };

  return handler;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9fLmpzIl0sIm5hbWVzIjpbImFycmF5IiwibWFwcyIsImhhbmRsZXIiLCJtYXAiLCJmbiIsInB1c2giLCJ2YWwiLCJzbGljZSIsImkiLCJsZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7a0JBTWVBLFNBQVM7QUFDdEIsUUFBTUMsT0FBTyxFQUFiO0FBQ0EsUUFBTUMsVUFBVTtBQUNkQyxRQUFLQyxFQUFMLEVBQVM7QUFDUEgsV0FBS0ksSUFBTCxDQUFVRCxFQUFWO0FBQ0EsYUFBT0YsT0FBUDtBQUNELEtBSmE7O0FBTWRJLFVBQU87QUFDTE4sY0FBUUEsTUFBTU8sS0FBTixFQUFSOztBQUVBLFdBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJUixNQUFNUyxNQUExQixFQUFrQ0QsS0FBSyxDQUF2QyxFQUEwQztBQUN4QyxhQUFLLElBQUlKLEVBQVQsSUFBZUgsSUFBZixFQUFxQjtBQUNuQkQsZ0JBQU1RLENBQU4sSUFBV0osR0FBR0osTUFBTVEsQ0FBTixDQUFILENBQVg7QUFDRDtBQUNGOztBQUVELGFBQU9SLEtBQVA7QUFDRDtBQWhCYSxHQUFoQjs7QUFtQkEsU0FBT0UsT0FBUDtBQUNELEMiLCJmaWxlIjoiXy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL18uanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXkgPT4ge1xuICBjb25zdCBtYXBzID0gW11cbiAgY29uc3QgaGFuZGxlciA9IHtcbiAgICBtYXAgKGZuKSB7XG4gICAgICBtYXBzLnB1c2goZm4pXG4gICAgICByZXR1cm4gaGFuZGxlclxuICAgIH0sXG4gICAgXG4gICAgdmFsICgpIHtcbiAgICAgIGFycmF5ID0gYXJyYXkuc2xpY2UoKVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAobGV0IGZuIG9mIG1hcHMpIHtcbiAgICAgICAgICBhcnJheVtpXSA9IGZuKGFycmF5W2ldKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhcnJheVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBoYW5kbGVyXG59Il19