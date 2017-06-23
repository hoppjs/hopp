'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assert = require('assert');

exports.default = (a, b) => {
  try {
    (0, _assert.deepEqual)(a, b);
    return true;
  } catch (_) {
    return false;
  }
}; /**
    * @file src/utils/deep-equal.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=deep-equal.js.map