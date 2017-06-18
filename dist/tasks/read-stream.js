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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = file => (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)((body, next) => {
  next(null, {
    file,
    body
  });
})); /**
      * @file src/tasks/read-stream.js
      * @license MIT
      * @copyright 2017 Karim Alibhai.
      */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9yZWFkLXN0cmVhbS5qcyJdLCJuYW1lcyI6WyJmaWxlIiwiY3JlYXRlUmVhZFN0cmVhbSIsImJvZHkiLCJuZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztrQkFFZUEsUUFBUSxvQkFDckIsYUFBR0MsZ0JBQUgsQ0FBb0JELElBQXBCLENBRHFCLEVBRXJCLHlCQUFJLENBQUNFLElBQUQsRUFBT0MsSUFBUCxLQUFnQjtBQUNsQkEsT0FBSyxJQUFMLEVBQVc7QUFDVEgsUUFEUztBQUVURTtBQUZTLEdBQVg7QUFJRCxDQUxELENBRnFCLEMsRUFWdkIiLCJmaWxlIjoicmVhZC1zdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9yZWFkLXN0cmVhbS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IG1hcCBmcm9tICdtYXAtc3RyZWFtJ1xuXG5leHBvcnQgZGVmYXVsdCBmaWxlID0+IHB1bXAoXG4gIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSksXG4gIG1hcCgoYm9keSwgbmV4dCkgPT4ge1xuICAgIG5leHQobnVsbCwge1xuICAgICAgZmlsZSxcbiAgICAgIGJvZHlcbiAgICB9KVxuICB9KVxuKSJdfQ==