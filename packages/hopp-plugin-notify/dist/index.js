'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeNotifier = require('node-notifier');

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

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
 * Find difference.
 */
function diff(strA, strB) {
  for (var i = 0; i < Math.min(strA.length, strB.length); i++) {
    if (strA[i] !== strB[i]) {
      return `${strA.substr(i)} -> ${strB.substr(i)}`;
    }
  }

  return strA;
}

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, data) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (data.done) {
              _nodeNotifier2.default.notify(Object.assign({
                title: 'Build completed!',
                message: diff(data.file, data.dest)
              }, ctx.args[0] || {}));
            }

            return _context.abrupt('return', data);

          case 2:
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