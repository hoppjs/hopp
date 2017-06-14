'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mgr = require('./mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _parallel = require('./parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms parts of the given JSON tree
 * into runnable tasks.
 * @param {Object} tree a tree of serialized tasks
 * @param {Array} tasks list of tasks to be transformed
 */
/**
 * @file src/tasks/tree.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

exports.default = (tree, tasks) => {
  for (let task of tasks) {
    const json = tree[task];

    // for arrays, convert all subtasks and
    // create a parallel task to manage them
    if (json instanceof Array) {
      tree[task] = (0, _parallel2.default)(json.map(sub => new _mgr2.default().fromJSON(sub)));
    }

    // for single tasks, just convert
    else {
        tree[task] = new _mgr2.default().fromJSON(json);
      }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy90cmVlLmpzIl0sIm5hbWVzIjpbInRyZWUiLCJ0YXNrcyIsInRhc2siLCJqc29uIiwiQXJyYXkiLCJtYXAiLCJzdWIiLCJmcm9tSlNPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQVRBOzs7Ozs7a0JBZWUsQ0FBQ0EsSUFBRCxFQUFPQyxLQUFQLEtBQWlCO0FBQzlCLE9BQUssSUFBSUMsSUFBVCxJQUFpQkQsS0FBakIsRUFBd0I7QUFDdEIsVUFBTUUsT0FBT0gsS0FBS0UsSUFBTCxDQUFiOztBQUVBO0FBQ0E7QUFDQSxRQUFJQyxnQkFBZ0JDLEtBQXBCLEVBQTJCO0FBQ3pCSixXQUFLRSxJQUFMLElBQWEsd0JBQWVDLEtBQUtFLEdBQUwsQ0FDMUJDLE9BQVEsbUJBQUQsQ0FBYUMsUUFBYixDQUFzQkQsR0FBdEIsQ0FEbUIsQ0FBZixDQUFiO0FBR0Q7O0FBRUQ7QUFOQSxTQU9LO0FBQ0hOLGFBQUtFLElBQUwsSUFBYyxtQkFBRCxDQUFhSyxRQUFiLENBQXNCSixJQUF0QixDQUFiO0FBQ0Q7QUFDRjtBQUNGLEMiLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL3RyZWUuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IEhvcHAgZnJvbSAnLi9tZ3InXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi9wYXJhbGxlbCdcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHBhcnRzIG9mIHRoZSBnaXZlbiBKU09OIHRyZWVcbiAqIGludG8gcnVubmFibGUgdGFza3MuXG4gKiBAcGFyYW0ge09iamVjdH0gdHJlZSBhIHRyZWUgb2Ygc2VyaWFsaXplZCB0YXNrc1xuICogQHBhcmFtIHtBcnJheX0gdGFza3MgbGlzdCBvZiB0YXNrcyB0byBiZSB0cmFuc2Zvcm1lZFxuICovXG5leHBvcnQgZGVmYXVsdCAodHJlZSwgdGFza3MpID0+IHtcbiAgZm9yIChsZXQgdGFzayBvZiB0YXNrcykge1xuICAgIGNvbnN0IGpzb24gPSB0cmVlW3Rhc2tdXG5cbiAgICAvLyBmb3IgYXJyYXlzLCBjb252ZXJ0IGFsbCBzdWJ0YXNrcyBhbmRcbiAgICAvLyBjcmVhdGUgYSBwYXJhbGxlbCB0YXNrIHRvIG1hbmFnZSB0aGVtXG4gICAgaWYgKGpzb24gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgdHJlZVt0YXNrXSA9IGNyZWF0ZVBhcmFsbGVsKGpzb24ubWFwKFxuICAgICAgICBzdWIgPT4gKG5ldyBIb3BwKCkpLmZyb21KU09OKHN1YilcbiAgICAgICkpXG4gICAgfVxuICAgIFxuICAgIC8vIGZvciBzaW5nbGUgdGFza3MsIGp1c3QgY29udmVydFxuICAgIGVsc2Uge1xuICAgICAgdHJlZVt0YXNrXSA9IChuZXcgSG9wcCgpKS5mcm9tSlNPTihqc29uKVxuICAgIH1cbiAgfVxufSJdfQ==