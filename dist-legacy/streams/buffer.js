'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var buffers = [];

  return (0, _mapStream2.default)(function (data, next) {
    // add to buffer
    buffers.push(data.body);

    // check for end
    if (data.done) {
      return next(null, Buffer.concat(buffers));
    }

    // otherwise drop from stream
    next();
  });
}; /**
    * @file src/tasks/buffer.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1ZmZlci5qcyJdLCJuYW1lcyI6WyJidWZmZXJzIiwiZGF0YSIsIm5leHQiLCJwdXNoIiwiYm9keSIsImRvbmUiLCJCdWZmZXIiLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7Ozs7a0JBRWUsWUFBTTtBQUNuQixNQUFNQSxVQUFVLEVBQWhCOztBQUVBLFNBQU8seUJBQUksVUFBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWdCO0FBQ3pCO0FBQ0FGLFlBQVFHLElBQVIsQ0FBYUYsS0FBS0csSUFBbEI7O0FBRUE7QUFDQSxRQUFJSCxLQUFLSSxJQUFULEVBQWU7QUFDYixhQUFPSCxLQUFLLElBQUwsRUFBV0ksT0FBT0MsTUFBUCxDQUFjUCxPQUFkLENBQVgsQ0FBUDtBQUNEOztBQUVEO0FBQ0FFO0FBQ0QsR0FYTSxDQUFQO0FBWUQsQyxFQXZCRCIsImZpbGUiOiJidWZmZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9idWZmZXIuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IG1hcCBmcm9tICdtYXAtc3RyZWFtJ1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGNvbnN0IGJ1ZmZlcnMgPSBbXVxuXG4gIHJldHVybiBtYXAoKGRhdGEsIG5leHQpID0+IHtcbiAgICAvLyBhZGQgdG8gYnVmZmVyXG4gICAgYnVmZmVycy5wdXNoKGRhdGEuYm9keSlcblxuICAgIC8vIGNoZWNrIGZvciBlbmRcbiAgICBpZiAoZGF0YS5kb25lKSB7XG4gICAgICByZXR1cm4gbmV4dChudWxsLCBCdWZmZXIuY29uY2F0KGJ1ZmZlcnMpKVxuICAgIH1cblxuICAgIC8vIG90aGVyd2lzZSBkcm9wIGZyb20gc3RyZWFtXG4gICAgbmV4dCgpXG4gIH0pXG59Il19