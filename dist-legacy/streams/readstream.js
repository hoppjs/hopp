'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _fs3 = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/tasks/read-stream.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function (file, dest) {
  var size = void 0;
  var emitted = 0;

  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(body, next) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(size === undefined)) {
                _context.next = 4;
                break;
              }

              _context.next = 3;
              return (0, _fs3.stat)(file);

            case 3:
              size = _context.sent.size;

            case 4:

              // collect size
              emitted += body.length;

              // check for unexpected values

              if (!(emitted > size)) {
                _context.next = 7;
                break;
              }

              return _context.abrupt('return', next(new Error('File size received exceeded expected file size.')));

            case 7:

              next(null, {
                // metadata
                file: file,
                dest: dest,
                size: size,
                done: emitted === size,

                // contents
                body: body
              });

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }()));
};
//# sourceMappingURL=readstream.js.map