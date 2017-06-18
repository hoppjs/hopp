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

exports.default = function (file, dest) {
  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)(function (body, next) {
    next(null, {
      file: file,
      body: body,
      dest: dest
    });
  }));
}; /**
    * @file src/tasks/read-stream.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9yZWFkLXN0cmVhbS5qcyJdLCJuYW1lcyI6WyJmaWxlIiwiZGVzdCIsImNyZWF0ZVJlYWRTdHJlYW0iLCJib2R5IiwibmV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7a0JBRWUsVUFBQ0EsSUFBRCxFQUFPQyxJQUFQO0FBQUEsU0FBZ0Isb0JBQzdCLGFBQUdDLGdCQUFILENBQW9CRixJQUFwQixDQUQ2QixFQUU3Qix5QkFBSSxVQUFDRyxJQUFELEVBQU9DLElBQVAsRUFBZ0I7QUFDbEJBLFNBQUssSUFBTCxFQUFXO0FBQ1RKLGdCQURTO0FBRVRHLGdCQUZTO0FBR1RGO0FBSFMsS0FBWDtBQUtELEdBTkQsQ0FGNkIsQ0FBaEI7QUFBQSxDLEVBVmYiLCJmaWxlIjoicmVhZC1zdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9yZWFkLXN0cmVhbS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IG1hcCBmcm9tICdtYXAtc3RyZWFtJ1xuXG5leHBvcnQgZGVmYXVsdCAoZmlsZSwgZGVzdCkgPT4gcHVtcChcbiAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKSxcbiAgbWFwKChib2R5LCBuZXh0KSA9PiB7XG4gICAgbmV4dChudWxsLCB7XG4gICAgICBmaWxlLFxuICAgICAgYm9keSxcbiAgICAgIGRlc3RcbiAgICB9KVxuICB9KVxuKSJdfQ==