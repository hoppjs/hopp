'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mgr = require('./mgr');

var _mgr2 = _interopRequireDefault(_mgr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms parts of the given JSON tree
 * into runnable tasks.
 * @param {Object} tree a tree of serialized tasks
 * @param {Array} tasks list of tasks to be transformed
 */
exports.default = function (tree, tasks) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      var json = tree[task];

      // only convert single tasks, parallel get
      // converted later
      if (!(json instanceof Array)) {
        tree[task] = new _mgr2.default().fromJSON(json);
      }
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
}; /**
    * @file src/tasks/tree.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy90cmVlLmpzIl0sIm5hbWVzIjpbInRyZWUiLCJ0YXNrcyIsInRhc2siLCJqc29uIiwiQXJyYXkiLCJmcm9tSlNPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7OztBQUVBOzs7Ozs7a0JBTWUsVUFBQ0EsSUFBRCxFQUFPQyxLQUFQLEVBQWlCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQzlCLHlCQUFpQkEsS0FBakIsOEhBQXdCO0FBQUEsVUFBZkMsSUFBZTs7QUFDdEIsVUFBTUMsT0FBT0gsS0FBS0UsSUFBTCxDQUFiOztBQUVBO0FBQ0E7QUFDQSxVQUFJLEVBQUVDLGdCQUFnQkMsS0FBbEIsQ0FBSixFQUE4QjtBQUM1QkosYUFBS0UsSUFBTCxJQUFjLG1CQUFELENBQWFHLFFBQWIsQ0FBc0JGLElBQXRCLENBQWI7QUFDRDtBQUNGO0FBVDZCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVL0IsQyxFQXhCRCIsImZpbGUiOiJ0cmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvdHJlZS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgSG9wcCBmcm9tICcuL21ncidcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHBhcnRzIG9mIHRoZSBnaXZlbiBKU09OIHRyZWVcbiAqIGludG8gcnVubmFibGUgdGFza3MuXG4gKiBAcGFyYW0ge09iamVjdH0gdHJlZSBhIHRyZWUgb2Ygc2VyaWFsaXplZCB0YXNrc1xuICogQHBhcmFtIHtBcnJheX0gdGFza3MgbGlzdCBvZiB0YXNrcyB0byBiZSB0cmFuc2Zvcm1lZFxuICovXG5leHBvcnQgZGVmYXVsdCAodHJlZSwgdGFza3MpID0+IHtcbiAgZm9yIChsZXQgdGFzayBvZiB0YXNrcykge1xuICAgIGNvbnN0IGpzb24gPSB0cmVlW3Rhc2tdXG5cbiAgICAvLyBvbmx5IGNvbnZlcnQgc2luZ2xlIHRhc2tzLCBwYXJhbGxlbCBnZXRcbiAgICAvLyBjb252ZXJ0ZWQgbGF0ZXJcbiAgICBpZiAoIShqc29uIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0cmVlW3Rhc2tdID0gKG5ldyBIb3BwKCkpLmZyb21KU09OKGpzb24pXG4gICAgfVxuICB9XG59XG4iXX0=