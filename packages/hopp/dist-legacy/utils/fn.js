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
exports.default = function (fn) {
  var cache = {};

  return process.env.RECACHE === 'true' ? fn : (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee() {
    var args,
        last,
        val,
        i,
        a,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            args = [].slice.call(_args);
            last = args.pop();
            val = cache;

            for (i = 0, a = args[0]; i < args.length; i += 1, a = args[i]) {
              val = val[a] = val[a] || {};
            }

            if (val.hasOwnProperty(last)) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return (0, _bluebird.resolve)(fn.apply(this, args.concat([last])));

          case 7:
            return _context.abrupt('return', val[last] = _context.sent);

          case 8:
            return _context.abrupt('return', val[last]);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
};

//# sourceMappingURL=fn.js.map