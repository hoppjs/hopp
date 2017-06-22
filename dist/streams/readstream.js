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

/**
 * @file src/tasks/read-stream.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

exports.default = (file, dest) => {
  let size,
      emitted = 0;

  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)(async (body, next) => {
    if (size === undefined) {
      size = (await (0, _fs3.stat)(file)).size;
    }

    // collect size
    emitted += body.length;

    // check for unexpected values
    if (emitted > size) {
      return next(new Error('File size received exceeded expected file size.'));
    }

    next(null, {
      // metadata
      file,
      dest,
      size,
      done: emitted === size,

      // contents
      body
    });
  }));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL3JlYWRzdHJlYW0uanMiXSwibmFtZXMiOlsiZmlsZSIsImRlc3QiLCJzaXplIiwiZW1pdHRlZCIsImNyZWF0ZVJlYWRTdHJlYW0iLCJib2R5IiwibmV4dCIsInVuZGVmaW5lZCIsImxlbmd0aCIsIkVycm9yIiwiZG9uZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFUQTs7Ozs7O2tCQVdlLENBQUNBLElBQUQsRUFBT0MsSUFBUCxLQUFnQjtBQUM3QixNQUFJQyxJQUFKO0FBQUEsTUFBVUMsVUFBVSxDQUFwQjs7QUFFQSxTQUFPLG9CQUNMLGFBQUdDLGdCQUFILENBQW9CSixJQUFwQixDQURLLEVBRUwseUJBQUksT0FBT0ssSUFBUCxFQUFhQyxJQUFiLEtBQXNCO0FBQ3hCLFFBQUlKLFNBQVNLLFNBQWIsRUFBd0I7QUFDdEJMLGFBQU8sQ0FBQyxNQUFNLGVBQUtGLElBQUwsQ0FBUCxFQUFtQkUsSUFBMUI7QUFDRDs7QUFFRDtBQUNBQyxlQUFXRSxLQUFLRyxNQUFoQjs7QUFFQTtBQUNBLFFBQUlMLFVBQVVELElBQWQsRUFBb0I7QUFDbEIsYUFBT0ksS0FBSyxJQUFJRyxLQUFKLENBQVUsaURBQVYsQ0FBTCxDQUFQO0FBQ0Q7O0FBRURILFNBQUssSUFBTCxFQUFXO0FBQ1Q7QUFDQU4sVUFGUztBQUdUQyxVQUhTO0FBSVRDLFVBSlM7QUFLVFEsWUFBTVAsWUFBWUQsSUFMVDs7QUFPVDtBQUNBRztBQVJTLEtBQVg7QUFVRCxHQXZCRCxDQUZLLENBQVA7QUEyQkQsQyIsImZpbGUiOiJyZWFkc3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvcmVhZC1zdHJlYW0uanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBtYXAgZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCB7IHN0YXQgfSBmcm9tICcuLi9mcydcblxuZXhwb3J0IGRlZmF1bHQgKGZpbGUsIGRlc3QpID0+IHtcbiAgbGV0IHNpemUsIGVtaXR0ZWQgPSAwXG5cbiAgcmV0dXJuIHB1bXAoXG4gICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKSxcbiAgICBtYXAoYXN5bmMgKGJvZHksIG5leHQpID0+IHtcbiAgICAgIGlmIChzaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2l6ZSA9IChhd2FpdCBzdGF0KGZpbGUpKS5zaXplXG4gICAgICB9XG5cbiAgICAgIC8vIGNvbGxlY3Qgc2l6ZVxuICAgICAgZW1pdHRlZCArPSBib2R5Lmxlbmd0aFxuXG4gICAgICAvLyBjaGVjayBmb3IgdW5leHBlY3RlZCB2YWx1ZXNcbiAgICAgIGlmIChlbWl0dGVkID4gc2l6ZSkge1xuICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ0ZpbGUgc2l6ZSByZWNlaXZlZCBleGNlZWRlZCBleHBlY3RlZCBmaWxlIHNpemUuJykpXG4gICAgICB9XG5cbiAgICAgIG5leHQobnVsbCwge1xuICAgICAgICAvLyBtZXRhZGF0YVxuICAgICAgICBmaWxlLFxuICAgICAgICBkZXN0LFxuICAgICAgICBzaXplLFxuICAgICAgICBkb25lOiBlbWl0dGVkID09PSBzaXplLFxuXG4gICAgICAgIC8vIGNvbnRlbnRzXG4gICAgICAgIGJvZHlcbiAgICAgIH0pXG4gICAgfSlcbiAgKVxufSJdfQ==