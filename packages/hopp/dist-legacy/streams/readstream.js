'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _fs3 = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/tasks/read-stream.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = function (file, dest, root) {
  var size = void 0;
  var emitted = 0;

  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _map2.default)(function () {
    var _ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(body, next) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(size === undefined)) {
                _context.next = 4;
                break;
              }

              _context.next = 3;
              return (0, _bluebird.resolve)((0, _fs3.stat)(file));

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
                root,
                file,
                dest,
                size,
                done: emitted === size,

                // contents
                body
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