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

exports.default = function (file) {
  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)(function (body, next) {
    next(null, {
      file: file,
      body: body
    });
  }));
}; /**
    * @file src/tasks/read-stream.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9yZWFkLXN0cmVhbS5qcyJdLCJuYW1lcyI6WyJjcmVhdGVSZWFkU3RyZWFtIiwiZmlsZSIsImJvZHkiLCJuZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztrQkFFZTtBQUFBLFNBQVEsb0JBQ3JCLGFBQUdBLGdCQUFILENBQW9CQyxJQUFwQixDQURxQixFQUVyQix5QkFBSSxVQUFDQyxJQUFELEVBQU9DLElBQVAsRUFBZ0I7QUFDbEJBLFNBQUssSUFBTCxFQUFXO0FBQ1RGLGdCQURTO0FBRVRDO0FBRlMsS0FBWDtBQUlELEdBTEQsQ0FGcUIsQ0FBUjtBQUFBLEMsRUFWZiIsImZpbGUiOiJyZWFkLXN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL3JlYWQtc3RyZWFtLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgbWFwIGZyb20gJ21hcC1zdHJlYW0nXG5cbmV4cG9ydCBkZWZhdWx0IGZpbGUgPT4gcHVtcChcbiAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKSxcbiAgbWFwKChib2R5LCBuZXh0KSA9PiB7XG4gICAgbmV4dChudWxsLCB7XG4gICAgICBmaWxlLFxuICAgICAgYm9keVxuICAgIH0pXG4gIH0pXG4pIl19