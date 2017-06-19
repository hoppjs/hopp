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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function (file, dest) {
  var size = void 0;

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

              next(null, {
                // metadata
                file: file,
                dest: dest,
                size: size,

                // contents
                body: body
              });

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
  }()));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL3JlYWRzdHJlYW0uanMiXSwibmFtZXMiOlsiZmlsZSIsImRlc3QiLCJzaXplIiwiY3JlYXRlUmVhZFN0cmVhbSIsImJvZHkiLCJuZXh0IiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OzsyY0FUQTs7Ozs7O2tCQVdlLFVBQUNBLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUM3QixNQUFJQyxhQUFKOztBQUVBLFNBQU8sb0JBQ0wsYUFBR0MsZ0JBQUgsQ0FBb0JILElBQXBCLENBREssRUFFTDtBQUFBLHlEQUFJLGlCQUFPSSxJQUFQLEVBQWFDLElBQWI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG9CQUNFSCxTQUFTSSxTQURYO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEscUJBRWMsZUFBS04sSUFBTCxDQUZkOztBQUFBO0FBRUFFLGtCQUZBLGlCQUUwQkEsSUFGMUI7O0FBQUE7O0FBS0ZHLG1CQUFLLElBQUwsRUFBVztBQUNUO0FBQ0FMLDBCQUZTO0FBR1RDLDBCQUhTO0FBSVRDLDBCQUpTOztBQU1UO0FBQ0FFO0FBUFMsZUFBWDs7QUFMRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFKOztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BRkssQ0FBUDtBQWtCRCxDIiwiZmlsZSI6InJlYWRzdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9yZWFkLXN0cmVhbS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IG1hcCBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IHsgc3RhdCB9IGZyb20gJy4uL2ZzJ1xuXG5leHBvcnQgZGVmYXVsdCAoZmlsZSwgZGVzdCkgPT4ge1xuICBsZXQgc2l6ZVxuXG4gIHJldHVybiBwdW1wKFxuICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSksXG4gICAgbWFwKGFzeW5jIChib2R5LCBuZXh0KSA9PiB7XG4gICAgICBpZiAoc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNpemUgPSAoYXdhaXQgc3RhdChmaWxlKSkuc2l6ZVxuICAgICAgfVxuXG4gICAgICBuZXh0KG51bGwsIHtcbiAgICAgICAgLy8gbWV0YWRhdGFcbiAgICAgICAgZmlsZSxcbiAgICAgICAgZGVzdCxcbiAgICAgICAgc2l6ZSxcblxuICAgICAgICAvLyBjb250ZW50c1xuICAgICAgICBib2R5XG4gICAgICB9KVxuICAgIH0pXG4gIClcbn0iXX0=