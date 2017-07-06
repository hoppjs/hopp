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
  here = here.stack.split('\n')[1];
  here = here.substr(0, here.indexOf('.js:'));

  var substack = err.stack.split('\n');
  var stack = substack.slice(0, 2).join('\n') + '\n';

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = substack.slice(2)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

  return { stack: stack.substr(0, stack.length - 1) };
}

//# sourceMappingURL=error.js.map