'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  return process.env.RECACHE === 'true' ? fn : _asyncToGenerator(function* () {
    const args = [].slice.call(arguments);
    const last = args.pop();

    let val = cache;
    for (let i = 0, a = args[0]; i < args.length; i += 1, a = args[i]) {
      val = val[a] = val[a] || {};
    }

    if (!val.hasOwnProperty(last)) {
      return val[last] = yield fn.apply(this, args.concat([last]));
    }

    return val[last];
  });
};