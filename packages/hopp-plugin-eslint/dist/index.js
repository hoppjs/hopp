'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.failOnError = exports.format = exports.config = undefined;

var _eslint = require('eslint');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file index.src.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * For node v4.
 */
require('regenerator-runtime/runtime');

/**
 * Buffer mode, since we're doing static analysis.
 * Readonly since we're not letting hopp handle the output.
 */
var config = exports.config = {
  mode: 'buffer',
  readonly: true

  /**
   * Regular linting function. Just passes the results
   * down the stream.
   * 
   * @param {Object} options eslint options
   */
};
exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, data) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // create new linter
            if (!ctx.linter) {
              ctx.linter = new _eslint.CLIEngine(ctx.args[0] || {});
            }

            // lint file
            data.lintResults = ctx.linter.executeOnText(data.body.toString('utf8'), data.file).results[0];

            // try and fix data
            if (data.lintResults.hasOwnProperty('output')) {
              data.body = data.lintResults.output;
            }

            // passthrough
            return _context.abrupt('return', data);

          case 4:
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

/**
 * Sets the formatter to be used for reporting.
 */


var format = exports.format = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, data) {
    var formatter, firstResult;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // grab formatter
            ctx.formatters = ctx.formatters || Object.create(null);
            formatter = ctx.args[0] || 'stylish';

            ctx.formatters[formatter] = ctx.formatters[formatter] || _eslint.CLIEngine.getFormatter(formatter);

            firstResult = void 0;
            [].forEach.call(data.lintResults.messages, function (result) {
              if (!firstResult) {
                firstResult = result.config;
              }

              var msg = ctx.formatters[formatter](data.lintResults.messages, firstResult);

              if (msg) {
                console.log('\n%s', msg);
              }
            });

            return _context2.abrupt('return', data);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function format(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Triggers failure if there are linting errors.
 */
var failOnError = exports.failOnError = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(ctx, data) {
    var count;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            count = data.lintResults.errorCount | 0;

            if (!(count > 0)) {
              _context3.next = 3;
              break;
            }

            throw new Error(`Failed with ${count} errors.`);

          case 3:
            return _context3.abrupt('return', data);

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function failOnError(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

//# sourceMappingURL=index.js.map