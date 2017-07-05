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
  let stack = '';

  here = here.stack.split('\n')[1];
  here = here.substr(0, here.indexOf('.js:'));

  for (const line of err.stack.split('\n')) {
    if (line.indexOf(here) !== -1) {
      break;
    }

    stack += line + '\n';
  }

  return { stack };
}

//# sourceMappingURL=error.js.map