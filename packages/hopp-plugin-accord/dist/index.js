'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = undefined;

var _accord = require('accord');

var _accord2 = _interopRequireDefault(_accord);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file index.src.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * For node v4.
 */
require('regenerator-runtime/runtime');

/**
 * Config defaults.
 */
var config = exports.config = {
  mode: 'buffer'
};

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, data) {
    var options;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(ctx.args.length !== 1 && ctx.args.length !== 2)) {
              _context.next = 2;
              break;
            }

            throw new Error('Unexpected number of arguments.');

          case 2:

            // get options
            options = ctx.args[1] || {};

            // compile with accord

            _context.next = 5;
            return _accord2.default.load(ctx.args[0]).render(data.body.toString('utf8'), options);

          case 5:
            data.body = _context.sent.result;
            return _context.abrupt('return', data);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=index.js.map