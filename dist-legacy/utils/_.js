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
//# sourceMappingURL=_.js.map