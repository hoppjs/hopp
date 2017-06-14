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

exports.default = function (tree, tasks) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      var json = tree[task];

      // for arrays, convert all subtasks and
      // create a parallel task to manage them
      if (json instanceof Array) {
        tree[task] = (0, _parallel2.default)(json.map(function (sub) {
          return new _mgr2.default().fromJSON(sub);
        }));
      }

      // for single tasks, just convert
      else {
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
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy90cmVlLmpzIl0sIm5hbWVzIjpbInRyZWUiLCJ0YXNrcyIsInRhc2siLCJqc29uIiwiQXJyYXkiLCJtYXAiLCJmcm9tSlNPTiIsInN1YiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQVRBOzs7Ozs7a0JBZWUsVUFBQ0EsSUFBRCxFQUFPQyxLQUFQLEVBQWlCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQzlCLHlCQUFpQkEsS0FBakIsOEhBQXdCO0FBQUEsVUFBZkMsSUFBZTs7QUFDdEIsVUFBTUMsT0FBT0gsS0FBS0UsSUFBTCxDQUFiOztBQUVBO0FBQ0E7QUFDQSxVQUFJQyxnQkFBZ0JDLEtBQXBCLEVBQTJCO0FBQ3pCSixhQUFLRSxJQUFMLElBQWEsd0JBQWVDLEtBQUtFLEdBQUwsQ0FDMUI7QUFBQSxpQkFBUSxtQkFBRCxDQUFhQyxRQUFiLENBQXNCQyxHQUF0QixDQUFQO0FBQUEsU0FEMEIsQ0FBZixDQUFiO0FBR0Q7O0FBRUQ7QUFOQSxXQU9LO0FBQ0hQLGVBQUtFLElBQUwsSUFBYyxtQkFBRCxDQUFhSSxRQUFiLENBQXNCSCxJQUF0QixDQUFiO0FBQ0Q7QUFDRjtBQWhCNkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWlCL0IsQyIsImZpbGUiOiJ0cmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvdHJlZS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgSG9wcCBmcm9tICcuL21ncidcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3BhcmFsbGVsJ1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgcGFydHMgb2YgdGhlIGdpdmVuIEpTT04gdHJlZVxuICogaW50byBydW5uYWJsZSB0YXNrcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSB0cmVlIGEgdHJlZSBvZiBzZXJpYWxpemVkIHRhc2tzXG4gKiBAcGFyYW0ge0FycmF5fSB0YXNrcyBsaXN0IG9mIHRhc2tzIHRvIGJlIHRyYW5zZm9ybWVkXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICh0cmVlLCB0YXNrcykgPT4ge1xuICBmb3IgKGxldCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgY29uc3QganNvbiA9IHRyZWVbdGFza11cblxuICAgIC8vIGZvciBhcnJheXMsIGNvbnZlcnQgYWxsIHN1YnRhc2tzIGFuZFxuICAgIC8vIGNyZWF0ZSBhIHBhcmFsbGVsIHRhc2sgdG8gbWFuYWdlIHRoZW1cbiAgICBpZiAoanNvbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB0cmVlW3Rhc2tdID0gY3JlYXRlUGFyYWxsZWwoanNvbi5tYXAoXG4gICAgICAgIHN1YiA9PiAobmV3IEhvcHAoKSkuZnJvbUpTT04oc3ViKVxuICAgICAgKSlcbiAgICB9XG4gICAgXG4gICAgLy8gZm9yIHNpbmdsZSB0YXNrcywganVzdCBjb252ZXJ0XG4gICAgZWxzZSB7XG4gICAgICB0cmVlW3Rhc2tdID0gKG5ldyBIb3BwKCkpLmZyb21KU09OKGpzb24pXG4gICAgfVxuICB9XG59Il19