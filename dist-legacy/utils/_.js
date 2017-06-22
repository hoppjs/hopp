"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/utils/_.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = function (array) {
  var maps = [];
  var handler = {
    map: function map(fn) {
      maps.push(fn);
      return handler;
    },
    val: function val() {
      array = array.slice();

      for (var i = 0; i < array.length; i += 1) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = maps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var fn = _step.value;

            array[i] = fn(array[i]);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      return array;
    }
  };

  return handler;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9fLmpzIl0sIm5hbWVzIjpbIm1hcHMiLCJoYW5kbGVyIiwibWFwIiwiZm4iLCJwdXNoIiwidmFsIiwiYXJyYXkiLCJzbGljZSIsImkiLCJsZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7a0JBTWUsaUJBQVM7QUFDdEIsTUFBTUEsT0FBTyxFQUFiO0FBQ0EsTUFBTUMsVUFBVTtBQUNkQyxPQURjLGVBQ1RDLEVBRFMsRUFDTDtBQUNQSCxXQUFLSSxJQUFMLENBQVVELEVBQVY7QUFDQSxhQUFPRixPQUFQO0FBQ0QsS0FKYTtBQU1kSSxPQU5jLGlCQU1QO0FBQ0xDLGNBQVFBLE1BQU1DLEtBQU4sRUFBUjs7QUFFQSxXQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSUYsTUFBTUcsTUFBMUIsRUFBa0NELEtBQUssQ0FBdkMsRUFBMEM7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDeEMsK0JBQWVSLElBQWYsOEhBQXFCO0FBQUEsZ0JBQVpHLEVBQVk7O0FBQ25CRyxrQkFBTUUsQ0FBTixJQUFXTCxHQUFHRyxNQUFNRSxDQUFOLENBQUgsQ0FBWDtBQUNEO0FBSHVDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJekM7O0FBRUQsYUFBT0YsS0FBUDtBQUNEO0FBaEJhLEdBQWhCOztBQW1CQSxTQUFPTCxPQUFQO0FBQ0QsQyIsImZpbGUiOiJfLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvXy5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBhcnJheSA9PiB7XG4gIGNvbnN0IG1hcHMgPSBbXVxuICBjb25zdCBoYW5kbGVyID0ge1xuICAgIG1hcCAoZm4pIHtcbiAgICAgIG1hcHMucHVzaChmbilcbiAgICAgIHJldHVybiBoYW5kbGVyXG4gICAgfSxcbiAgICBcbiAgICB2YWwgKCkge1xuICAgICAgYXJyYXkgPSBhcnJheS5zbGljZSgpXG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgZm9yIChsZXQgZm4gb2YgbWFwcykge1xuICAgICAgICAgIGFycmF5W2ldID0gZm4oYXJyYXlbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFycmF5XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGhhbmRsZXJcbn1cbiJdfQ==