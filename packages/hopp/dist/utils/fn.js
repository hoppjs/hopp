'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/utils/fn.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Makes async functions deterministic.
 */
exports.default = fn => {
  const cache = {};

  return process.env.RECACHE === 'true' ? fn : async function () {
    const args = [].slice.call(arguments);
    const last = args.pop();

    let val = cache;
    for (let i = 0, a = args[0]; i < args.length; i += 1, a = args[i]) {
      val = val[a] = val[a] || {};
    }

    if (!val.hasOwnProperty(last)) {
      return val[last] = await fn.apply(this, args.concat([last]));
    }

    return val[last];
  };
};

//# sourceMappingURL=fn.js.map