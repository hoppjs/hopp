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
  var size = void 0,
      emitted = 0;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL3JlYWRzdHJlYW0uanMiXSwibmFtZXMiOlsiZmlsZSIsImRlc3QiLCJzaXplIiwiZW1pdHRlZCIsImNyZWF0ZVJlYWRTdHJlYW0iLCJib2R5IiwibmV4dCIsInVuZGVmaW5lZCIsImxlbmd0aCIsIkVycm9yIiwiZG9uZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7MmNBVEE7Ozs7OztrQkFXZSxVQUFDQSxJQUFELEVBQU9DLElBQVAsRUFBZ0I7QUFDN0IsTUFBSUMsYUFBSjtBQUFBLE1BQVVDLFVBQVUsQ0FBcEI7O0FBRUEsU0FBTyxvQkFDTCxhQUFHQyxnQkFBSCxDQUFvQkosSUFBcEIsQ0FESyxFQUVMO0FBQUEseURBQUksaUJBQU9LLElBQVAsRUFBYUMsSUFBYjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBQ0VKLFNBQVNLLFNBRFg7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxxQkFFYyxlQUFLUCxJQUFMLENBRmQ7O0FBQUE7QUFFQUUsa0JBRkEsaUJBRTBCQSxJQUYxQjs7QUFBQTs7QUFLRjtBQUNBQyx5QkFBV0UsS0FBS0csTUFBaEI7O0FBRUE7O0FBUkUsb0JBU0VMLFVBQVVELElBVFo7QUFBQTtBQUFBO0FBQUE7O0FBQUEsK0NBVU9JLEtBQUssSUFBSUcsS0FBSixDQUFVLGlEQUFWLENBQUwsQ0FWUDs7QUFBQTs7QUFhRkgsbUJBQUssSUFBTCxFQUFXO0FBQ1Q7QUFDQU4sMEJBRlM7QUFHVEMsMEJBSFM7QUFJVEMsMEJBSlM7QUFLVFEsc0JBQU1QLFlBQVlELElBTFQ7O0FBT1Q7QUFDQUc7QUFSUyxlQUFYOztBQWJFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUo7O0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFGSyxDQUFQO0FBMkJELEMiLCJmaWxlIjoicmVhZHN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL3JlYWQtc3RyZWFtLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgbWFwIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgeyBzdGF0IH0gZnJvbSAnLi4vZnMnXG5cbmV4cG9ydCBkZWZhdWx0IChmaWxlLCBkZXN0KSA9PiB7XG4gIGxldCBzaXplLCBlbWl0dGVkID0gMFxuXG4gIHJldHVybiBwdW1wKFxuICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSksXG4gICAgbWFwKGFzeW5jIChib2R5LCBuZXh0KSA9PiB7XG4gICAgICBpZiAoc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNpemUgPSAoYXdhaXQgc3RhdChmaWxlKSkuc2l6ZVxuICAgICAgfVxuXG4gICAgICAvLyBjb2xsZWN0IHNpemVcbiAgICAgIGVtaXR0ZWQgKz0gYm9keS5sZW5ndGhcblxuICAgICAgLy8gY2hlY2sgZm9yIHVuZXhwZWN0ZWQgdmFsdWVzXG4gICAgICBpZiAoZW1pdHRlZCA+IHNpemUpIHtcbiAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdGaWxlIHNpemUgcmVjZWl2ZWQgZXhjZWVkZWQgZXhwZWN0ZWQgZmlsZSBzaXplLicpKVxuICAgICAgfVxuXG4gICAgICBuZXh0KG51bGwsIHtcbiAgICAgICAgLy8gbWV0YWRhdGFcbiAgICAgICAgZmlsZSxcbiAgICAgICAgZGVzdCxcbiAgICAgICAgc2l6ZSxcbiAgICAgICAgZG9uZTogZW1pdHRlZCA9PT0gc2l6ZSxcblxuICAgICAgICAvLyBjb250ZW50c1xuICAgICAgICBib2R5XG4gICAgICB9KVxuICAgIH0pXG4gIClcbn1cbiJdfQ==