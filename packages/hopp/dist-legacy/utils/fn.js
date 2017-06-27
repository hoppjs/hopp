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
exports.default = function (fn) {
  var cache = {};

  return process.env.RECACHE === 'true' ? fn : _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
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
            return fn.apply(this, args.concat([last]));

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