'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * @file index.src.js
 * @license MIT
 */

require('regenerator-runtime/runtime');

var fs = require('fs');
var path = require('path');
var babel = require('babel-core');

/**
 * Buffering is needed for babel.
 */
var config = exports.config = {
  mode: 'buffer'

  /**
   * Proxy babel-core.
   */
};
exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, data) {
    var filerelative, options, output;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(ctx.args.length > 1)) {
              _context.next = 2;
              break;
            }

            throw new Error('Unexpected number of arguments.');

          case 2:

            /**
             * Add file metadata to babel options.
             */
            filerelative = path.relative(path.dirname(data.dest), data.file);
            options = Object.assign({}, ctx.args[0] || {}, {
              filename: path.basename(data.file),
              filenameRelative: filerelative,
              sourceFileName: filerelative,
              sourceMapTarget: filerelative
            });

            /**
             * Transform via babel.
             */

            output = babel.transform(data.body, options);

            /**
             * Write sourcemap.
             */

            if (!options.sourceMaps) {
              _context.next = 8;
              break;
            }

            _context.next = 8;
            return new Promise(function (resolve, reject) {
              fs.writeFile(data.dest + '.map', JSON.stringify(output.map), function (err) {
                if (err) reject(err);else resolve();
              });
            });

          case 8:

            /**
             * Replace code.
             */
            data.body = output.code;

            /**
             * Add sourcemap link.
             */
            if (options.sourceMaps) {
              data.body += `\n\n//# sourceMappingURL=${path.basename(data.dest)}.map`;
            }

            /**
             * Return final object.
             */
            return _context.abrupt('return', data);

          case 11:
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