'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

/**
 * @file src/utils/fn.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Makes async functions deterministic.
 */
exports.default = fn => {
  const cache = Object.create(null);

  return process.env.RECACHE === 'true' ? fn : (0, _bluebird.coroutine)(function* () {
    const last = arguments[arguments.length - 1];
    let val = cache;

    for (let i = 0, a = arguments[0]; i < arguments.length - 1; i += 1, a = arguments[i]) {
      val = val[a] = val[a] || Object.create(null);
    }

    return val[last] = val[last] || (yield (0, _bluebird.resolve)(fn.apply(this, [...arguments])));
  });
};

//# sourceMappingURL=fn.js.map