'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _load = require('./plugins/load');

var _load2 = _interopRequireDefault(_load);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/hopp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'

/**
 * Create hopp object based on plugins.
 */
),
    debug = _require.debug;

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ;_context.next = 3;
            return (0, _load2.default)(directory);

          case 3:
            _context.t0 = function (name) {
              var plugName = '';

              for (var i = 5; i < name.length; i += 1) {
                plugName += name[i] === '-' ? name[i++].toUpperCase() : name[i];
              }

              debug('adding plugin %s', name

              // add the plugin to the hopp prototype so it can be
              // used for the rest of the build process
              );_mgr2.default.prototype[plugName] = function () {
                // instead of actually loading the plugin at this stage,
                // we will just pop its call into our internal call stack
                // for use later. this is useful when we are stepping through
                // an entire hoppfile but might only be running a single task

                this.callStack.push([name, arguments]);

                return this;
              };
            }

            /**
             * Expose hopp class for task creation.
             */
            ;

            _context.sent.forEach(_context.t0);

            return _context.abrupt('return', function (src) {
              return new _mgr2.default(src);
            });

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwiaSIsIm5hbWUiLCJsZW5ndGgiLCJ0b1VwcGVyQ2FzZSIsInByb3RvdHlwZSIsImNhbGxTdGFjayIsInB1c2giLCJhcmd1bWVudHMiLCJmb3JFYWNoIiwic3JjIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FSQTs7Ozs7O2VBVWtCQSxRQUFRLGFBQVIsRUFBdUI7O0FBRXpDOzs7QUFGa0IsQztJQUFWQyxLLFlBQUFBLEs7Ozt1REFLTyxpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2IsYUFEYTtBQUFBLG1CQUNMLG9CQUFZQSxTQUFaLENBREs7O0FBQUE7QUFBQSwwQkFDMkIsZ0JBQVE7QUFDOUMsa0JBQUlDLFdBQVcsRUFBZjs7QUFFQSxtQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLEtBQUtDLE1BQXpCLEVBQWlDRixLQUFLLENBQXRDLEVBQXlDO0FBQ3ZDRCw0QkFBWUUsS0FBS0QsQ0FBTCxNQUFZLEdBQVosR0FBa0JDLEtBQUtELEdBQUwsRUFBVUcsV0FBVixFQUFsQixHQUE0Q0YsS0FBS0QsQ0FBTCxDQUF4RDtBQUNEOztBQUVESCxvQkFBTSxrQkFBTixFQUEwQkk7O0FBRTFCO0FBQ0E7QUFIQSxnQkFJQSxjQUFLRyxTQUFMLENBQWVMLFFBQWYsSUFBMkIsWUFBWTtBQUNyQztBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBS00sU0FBTCxDQUFlQyxJQUFmLENBQW9CLENBQ2xCTCxJQURrQixFQUVsQk0sU0FGa0IsQ0FBcEI7O0FBS0EsdUJBQU8sSUFBUDtBQUNELGVBWkQ7QUFhRDs7QUFFRDs7O0FBM0JhOztBQUFBLDBCQUNtQkMsT0FEbkI7O0FBQUEsNkNBOEJOO0FBQUEscUJBQU8sa0JBQVNDLEdBQVQsQ0FBUDtBQUFBLGFBOUJNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiaG9wcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2hvcHAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBsb2FkUGx1Z2lucyBmcm9tICcuL3BsdWdpbnMvbG9hZCdcbmltcG9ydCBIb3BwIGZyb20gJy4vdGFza3MvbWdyJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBDcmVhdGUgaG9wcCBvYmplY3QgYmFzZWQgb24gcGx1Z2lucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgOyhhd2FpdCBsb2FkUGx1Z2lucyhkaXJlY3RvcnkpKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGxldCBwbHVnTmFtZSA9ICcnXG5cbiAgICBmb3IgKGxldCBpID0gNTsgaSA8IG5hbWUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHBsdWdOYW1lICs9IG5hbWVbaV0gPT09ICctJyA/IG5hbWVbaSsrXS50b1VwcGVyQ2FzZSgpIDogbmFtZVtpXVxuICAgIH1cblxuICAgIGRlYnVnKCdhZGRpbmcgcGx1Z2luICVzJywgbmFtZSlcbiAgICBcbiAgICAvLyBhZGQgdGhlIHBsdWdpbiB0byB0aGUgaG9wcCBwcm90b3R5cGUgc28gaXQgY2FuIGJlXG4gICAgLy8gdXNlZCBmb3IgdGhlIHJlc3Qgb2YgdGhlIGJ1aWxkIHByb2Nlc3NcbiAgICBIb3BwLnByb3RvdHlwZVtwbHVnTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBpbnN0ZWFkIG9mIGFjdHVhbGx5IGxvYWRpbmcgdGhlIHBsdWdpbiBhdCB0aGlzIHN0YWdlLFxuICAgICAgLy8gd2Ugd2lsbCBqdXN0IHBvcCBpdHMgY2FsbCBpbnRvIG91ciBpbnRlcm5hbCBjYWxsIHN0YWNrXG4gICAgICAvLyBmb3IgdXNlIGxhdGVyLiB0aGlzIGlzIHVzZWZ1bCB3aGVuIHdlIGFyZSBzdGVwcGluZyB0aHJvdWdoXG4gICAgICAvLyBhbiBlbnRpcmUgaG9wcGZpbGUgYnV0IG1pZ2h0IG9ubHkgYmUgcnVubmluZyBhIHNpbmdsZSB0YXNrXG5cbiAgICAgIHRoaXMuY2FsbFN0YWNrLnB1c2goW1xuICAgICAgICBuYW1lLFxuICAgICAgICBhcmd1bWVudHNcbiAgICAgIF0pXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9KVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgaG9wcCBjbGFzcyBmb3IgdGFzayBjcmVhdGlvbi5cbiAgICovXG4gIHJldHVybiBzcmMgPT4gbmV3IEhvcHAoc3JjKVxufSJdfQ==