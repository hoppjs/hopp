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
  let size;

  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)(async (body, next) => {
    if (size === undefined) {
      size = (await (0, _fs3.stat)(file)).size;
    }

    next(null, {
      // metadata
      file,
      dest,
      size,

      // contents
      body
    });
  }));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9yZWFkLXN0cmVhbS5qcyJdLCJuYW1lcyI6WyJmaWxlIiwiZGVzdCIsInNpemUiLCJjcmVhdGVSZWFkU3RyZWFtIiwiYm9keSIsIm5leHQiLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBVEE7Ozs7OztrQkFXZSxDQUFDQSxJQUFELEVBQU9DLElBQVAsS0FBZ0I7QUFDN0IsTUFBSUMsSUFBSjs7QUFFQSxTQUFPLG9CQUNMLGFBQUdDLGdCQUFILENBQW9CSCxJQUFwQixDQURLLEVBRUwseUJBQUksT0FBT0ksSUFBUCxFQUFhQyxJQUFiLEtBQXNCO0FBQ3hCLFFBQUlILFNBQVNJLFNBQWIsRUFBd0I7QUFDdEJKLGFBQU8sQ0FBQyxNQUFNLGVBQUtGLElBQUwsQ0FBUCxFQUFtQkUsSUFBMUI7QUFDRDs7QUFFREcsU0FBSyxJQUFMLEVBQVc7QUFDVDtBQUNBTCxVQUZTO0FBR1RDLFVBSFM7QUFJVEMsVUFKUzs7QUFNVDtBQUNBRTtBQVBTLEtBQVg7QUFTRCxHQWRELENBRkssQ0FBUDtBQWtCRCxDIiwiZmlsZSI6InJlYWQtc3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvcmVhZC1zdHJlYW0uanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBtYXAgZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCB7IHN0YXQgfSBmcm9tICcuLi9mcydcblxuZXhwb3J0IGRlZmF1bHQgKGZpbGUsIGRlc3QpID0+IHtcbiAgbGV0IHNpemVcblxuICByZXR1cm4gcHVtcChcbiAgICBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpLFxuICAgIG1hcChhc3luYyAoYm9keSwgbmV4dCkgPT4ge1xuICAgICAgaWYgKHNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzaXplID0gKGF3YWl0IHN0YXQoZmlsZSkpLnNpemVcbiAgICAgIH1cblxuICAgICAgbmV4dChudWxsLCB7XG4gICAgICAgIC8vIG1ldGFkYXRhXG4gICAgICAgIGZpbGUsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIHNpemUsXG5cbiAgICAgICAgLy8gY29udGVudHNcbiAgICAgICAgYm9keVxuICAgICAgfSlcbiAgICB9KVxuICApXG59Il19