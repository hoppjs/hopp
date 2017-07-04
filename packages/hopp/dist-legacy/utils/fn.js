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
  var cache = Object.create(null);

  return process.env.RECACHE === 'true' ? fn : (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee() {
    var last,
        val,
        i,
        a,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            last = _args[_args.length - 1];
            val = cache;


            for (i = 0, a = _args[0]; i < _args.length - 1; i += 1, a = _args[i]) {
              val = val[a] = val[a] || Object.create(null);
            }

            _context.t0 = val[last];

            if (_context.t0) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return (0, _bluebird.resolve)(fn.apply(this, [].concat(Array.prototype.slice.call(_args))));

          case 7:
            _context.t0 = _context.sent;

          case 8:
            return _context.abrupt('return', val[last] = _context.t0);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
};

//# sourceMappingURL=fn.js.map