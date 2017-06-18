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

exports.default = (file, dest) => (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _mapStream2.default)((body, next) => {
  next(null, {
    file,
    body,
    dest
  });
})); /**
      * @file src/tasks/read-stream.js
      * @license MIT
      * @copyright 2017 Karim Alibhai.
      */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9yZWFkLXN0cmVhbS5qcyJdLCJuYW1lcyI6WyJmaWxlIiwiZGVzdCIsImNyZWF0ZVJlYWRTdHJlYW0iLCJib2R5IiwibmV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7a0JBRWUsQ0FBQ0EsSUFBRCxFQUFPQyxJQUFQLEtBQWdCLG9CQUM3QixhQUFHQyxnQkFBSCxDQUFvQkYsSUFBcEIsQ0FENkIsRUFFN0IseUJBQUksQ0FBQ0csSUFBRCxFQUFPQyxJQUFQLEtBQWdCO0FBQ2xCQSxPQUFLLElBQUwsRUFBVztBQUNUSixRQURTO0FBRVRHLFFBRlM7QUFHVEY7QUFIUyxHQUFYO0FBS0QsQ0FORCxDQUY2QixDLEVBVi9CIiwiZmlsZSI6InJlYWQtc3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvcmVhZC1zdHJlYW0uanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBtYXAgZnJvbSAnbWFwLXN0cmVhbSdcblxuZXhwb3J0IGRlZmF1bHQgKGZpbGUsIGRlc3QpID0+IHB1bXAoXG4gIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSksXG4gIG1hcCgoYm9keSwgbmV4dCkgPT4ge1xuICAgIG5leHQobnVsbCwge1xuICAgICAgZmlsZSxcbiAgICAgIGJvZHksXG4gICAgICBkZXN0XG4gICAgfSlcbiAgfSlcbikiXX0=