'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
  let buffers = [];
  let length = 0;

  return (0, _mapStream2.default)((data, next) => {
    // add to buffer
    length += data.body.length;
    buffers.push(data.body

    // check for unexpected values
    );if (length > data.size) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9idWZmZXIuanMiXSwibmFtZXMiOlsiYnVmZmVycyIsImxlbmd0aCIsImRhdGEiLCJuZXh0IiwiYm9keSIsInB1c2giLCJzaXplIiwiRXJyb3IiLCJCdWZmZXIiLCJjb25jYXQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7Ozs7a0JBRWUsTUFBTTtBQUNuQixNQUFJQSxVQUFVLEVBQWQ7QUFDQSxNQUFJQyxTQUFTLENBQWI7O0FBRUEsU0FBTyx5QkFBSSxDQUFDQyxJQUFELEVBQU9DLElBQVAsS0FBZ0I7QUFDekI7QUFDQUYsY0FBVUMsS0FBS0UsSUFBTCxDQUFVSCxNQUFwQjtBQUNBRCxZQUFRSyxJQUFSLENBQWFILEtBQUtFOztBQUVsQjtBQUZBLE1BR0EsSUFBSUgsU0FBU0MsS0FBS0ksSUFBbEIsRUFBd0I7QUFDdEIsYUFBT0gsS0FBSyxJQUFJSSxLQUFKLENBQVUsMENBQVYsQ0FBTCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJTixXQUFXQyxLQUFLSSxJQUFwQixFQUEwQjtBQUN4QixhQUFPSCxLQUFLLElBQUwsRUFBV0ssT0FBT0MsTUFBUCxDQUFjVCxPQUFkLENBQVgsQ0FBUDtBQUNEOztBQUVEO0FBQ0FHO0FBQ0QsR0FqQk0sQ0FBUDtBQWtCRCxDLEVBOUJEIiwiZmlsZSI6ImJ1ZmZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL2J1ZmZlci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgbWFwIGZyb20gJ21hcC1zdHJlYW0nXG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcbiAgbGV0IGJ1ZmZlcnMgPSBbXVxuICBsZXQgbGVuZ3RoID0gMFxuXG4gIHJldHVybiBtYXAoKGRhdGEsIG5leHQpID0+IHtcbiAgICAvLyBhZGQgdG8gYnVmZmVyXG4gICAgbGVuZ3RoICs9IGRhdGEuYm9keS5sZW5ndGhcbiAgICBidWZmZXJzLnB1c2goZGF0YS5ib2R5KVxuXG4gICAgLy8gY2hlY2sgZm9yIHVuZXhwZWN0ZWQgdmFsdWVzXG4gICAgaWYgKGxlbmd0aCA+IGRhdGEuc2l6ZSkge1xuICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdCdWZmZXIgc2l6ZSBleGNlZWRlZCBleHBlY3RlZCBmaWxlIHNpemUuJykpXG4gICAgfVxuXG4gICAgLy8gY2hlY2sgZm9yIGVuZFxuICAgIGlmIChsZW5ndGggPT09IGRhdGEuc2l6ZSkge1xuICAgICAgcmV0dXJuIG5leHQobnVsbCwgQnVmZmVyLmNvbmNhdChidWZmZXJzKSlcbiAgICB9XG5cbiAgICAvLyBvdGhlcndpc2UgZHJvcCBmcm9tIHN0cmVhbVxuICAgIG5leHQoKVxuICB9KVxufSJdfQ==