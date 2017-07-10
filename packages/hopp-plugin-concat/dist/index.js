'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * @file index.src.js
 * @license MIT
 */
var tmp = false;
/**
 * For node v4.
 */
require('regenerator-runtime/runtime');

/**
 * This enables the concatenation.
 */
var config = exports.config = {
  mode: 'buffer',
  bundle: true

  /**
   * We don't need to do any real transformation.
   * suffix and prefix features
   */
};
exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, data) {
    var opts;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(ctx.args.length > 1)) {
              _context.next = 2;
              break;
            }

            throw new Error('Unexpected numbers of arguments.');

          case 2:

            /**
             * options assign
             *  @param suffix adding string at the end of the each file
             *  @param prefix adding string at the beginning of the first packet
             */
            opts = ctx.args[0] || {};
            // // prefix
            // if (opts.prefix && !tmp) {
            //   data.size += opts.prefix.length
            //   data.body = opts.prefix + data.body.toString();
            // }
            // // suffix 
            // if (opts.suffix && !tmp) {
            //   data.size += opts.prefix.length
            //   data.body = data.body.toString() + opts.suffix
            // }

            if (config.bundle && !tmp) {
              // prefix
              if (opts.prefix) {
                data.size += opts.prefix.length;
                data.body = opts.prefix + data.body.toString();
              }
              // suffix
              if (opts.suffix) {
                data.size += opts.suffix.length;
                data.body = data.body.toString() + opts.suffix;
              }
              tmp = true;
            }

            return _context.abrupt('return', data);

          case 5:
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