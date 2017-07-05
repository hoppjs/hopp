'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = simplifyError;
/**
 * @file utils/stack.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Simplifies an error's stack trace by removing
 * the stack trace lines that are part of hopp.
 */
function simplifyError(err, here) {
  var stack = '';

  here = here.stack.split('\n')[1];
  here = here.substr(0, here.indexOf('.js:'));

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = err.stack.split('\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (line.indexOf(here) !== -1) {
        break;
      }

      stack += line + '\n';
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

  return { stack };
}

//# sourceMappingURL=error.js.map