'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var buffers = [];
  var length = 0;

  return (0, _mapStream2.default)(function (data, next) {
    // add to buffer
    length += data.body.length;
    buffers.push(data.body);

    // check for unexpected values
    if (length > data.size) {
      return next(new Error('Buffer size exceeded expected file size.'));
    }

    // check for end
    if (length === data.size) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1ZmZlci5qcyJdLCJuYW1lcyI6WyJidWZmZXJzIiwibGVuZ3RoIiwiZGF0YSIsIm5leHQiLCJib2R5IiwicHVzaCIsInNpemUiLCJFcnJvciIsIkJ1ZmZlciIsImNvbmNhdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7OztrQkFFZSxZQUFNO0FBQ25CLE1BQUlBLFVBQVUsRUFBZDtBQUNBLE1BQUlDLFNBQVMsQ0FBYjs7QUFFQSxTQUFPLHlCQUFJLFVBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUN6QjtBQUNBRixjQUFVQyxLQUFLRSxJQUFMLENBQVVILE1BQXBCO0FBQ0FELFlBQVFLLElBQVIsQ0FBYUgsS0FBS0UsSUFBbEI7O0FBRUE7QUFDQSxRQUFJSCxTQUFTQyxLQUFLSSxJQUFsQixFQUF3QjtBQUN0QixhQUFPSCxLQUFLLElBQUlJLEtBQUosQ0FBVSwwQ0FBVixDQUFMLENBQVA7QUFDRDs7QUFFRDtBQUNBLFFBQUlOLFdBQVdDLEtBQUtJLElBQXBCLEVBQTBCO0FBQ3hCLGFBQU9ILEtBQUssSUFBTCxFQUFXSyxPQUFPQyxNQUFQLENBQWNULE9BQWQsQ0FBWCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQUc7QUFDRCxHQWpCTSxDQUFQO0FBa0JELEMsRUE5QkQiLCJmaWxlIjoiYnVmZmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvYnVmZmVyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBtYXAgZnJvbSAnbWFwLXN0cmVhbSdcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICBsZXQgYnVmZmVycyA9IFtdXG4gIGxldCBsZW5ndGggPSAwXG5cbiAgcmV0dXJuIG1hcCgoZGF0YSwgbmV4dCkgPT4ge1xuICAgIC8vIGFkZCB0byBidWZmZXJcbiAgICBsZW5ndGggKz0gZGF0YS5ib2R5Lmxlbmd0aFxuICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJvZHkpXG5cbiAgICAvLyBjaGVjayBmb3IgdW5leHBlY3RlZCB2YWx1ZXNcbiAgICBpZiAobGVuZ3RoID4gZGF0YS5zaXplKSB7XG4gICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ0J1ZmZlciBzaXplIGV4Y2VlZGVkIGV4cGVjdGVkIGZpbGUgc2l6ZS4nKSlcbiAgICB9XG5cbiAgICAvLyBjaGVjayBmb3IgZW5kXG4gICAgaWYgKGxlbmd0aCA9PT0gZGF0YS5zaXplKSB7XG4gICAgICByZXR1cm4gbmV4dChudWxsLCBCdWZmZXIuY29uY2F0KGJ1ZmZlcnMpKVxuICAgIH1cblxuICAgIC8vIG90aGVyd2lzZSBkcm9wIGZyb20gc3RyZWFtXG4gICAgbmV4dCgpXG4gIH0pXG59Il19