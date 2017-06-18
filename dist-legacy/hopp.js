'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _load = require('./plugins/load');

var _load2 = _interopRequireDefault(_load);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

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
    var init;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ;_context.next = 3;
            return (0, _load2.default)(directory);

          case 3:
            _context.t0 = function (name) {
              var plugName = '';

              for (var tmp = _path2.default.basename(name), i = 5; i < tmp.length; i += 1) {
                plugName += tmp[i] === '-' ? tmp[i++].toUpperCase() : tmp[i];
              }

              debug('adding plugin %s from %s', plugName, name

              // add the plugin to the hopp prototype so it can be
              // used for the rest of the build process
              );_mgr2.default.prototype[plugName] = function () {
                // instead of actually loading the plugin at this stage,
                // we will just pop its call into our internal call stack
                // for use later. this is useful when we are stepping through
                // an entire hoppfile but might only be running a single task

                this.d.stack.push([name, arguments]);

                return this;
              };
            }

            /**
             * Expose hopp class for task creation.
             */
            ;

            _context.sent.forEach(_context.t0);

            init = function init(src) {
              return new _mgr2.default(src);
            };

            init.all = _parallel2.default;
            init.watch = _watch2.default;

            return _context.abrupt('return', init);

          case 9:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwidG1wIiwiYmFzZW5hbWUiLCJuYW1lIiwiaSIsImxlbmd0aCIsInRvVXBwZXJDYXNlIiwicHJvdG90eXBlIiwiZCIsInN0YWNrIiwicHVzaCIsImFyZ3VtZW50cyIsImZvckVhY2giLCJpbml0Iiwic3JjIiwiYWxsIiwid2F0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FWQTs7Ozs7O2VBWWtCQSxRQUFRLGFBQVIsRUFBdUI7O0FBRXpDOzs7QUFGa0IsQztJQUFWQyxLLFlBQUFBLEs7Ozt1REFLTyxpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDYixhQURhO0FBQUEsbUJBQ0wsb0JBQVlBLFNBQVosQ0FESzs7QUFBQTtBQUFBLDBCQUMyQixnQkFBUTtBQUM5QyxrQkFBSUMsV0FBVyxFQUFmOztBQUVBLG1CQUFLLElBQUlDLE1BQU0sZUFBS0MsUUFBTCxDQUFjQyxJQUFkLENBQVYsRUFBK0JDLElBQUksQ0FBeEMsRUFBMkNBLElBQUlILElBQUlJLE1BQW5ELEVBQTJERCxLQUFLLENBQWhFLEVBQW1FO0FBQ2pFSiw0QkFBWUMsSUFBSUcsQ0FBSixNQUFXLEdBQVgsR0FBaUJILElBQUlHLEdBQUosRUFBU0UsV0FBVCxFQUFqQixHQUEwQ0wsSUFBSUcsQ0FBSixDQUF0RDtBQUNEOztBQUVETixvQkFBTSwwQkFBTixFQUFrQ0UsUUFBbEMsRUFBNENHOztBQUU1QztBQUNBO0FBSEEsZ0JBSUEsY0FBS0ksU0FBTCxDQUFlUCxRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQUtRLENBQUwsQ0FBT0MsS0FBUCxDQUFhQyxJQUFiLENBQWtCLENBQ2hCUCxJQURnQixFQUVoQlEsU0FGZ0IsQ0FBbEI7O0FBS0EsdUJBQU8sSUFBUDtBQUNELGVBWkQ7QUFhRDs7QUFFRDs7O0FBM0JhOztBQUFBLDBCQUNtQkMsT0FEbkI7O0FBOEJQQyxnQkE5Qk8sR0E4QkEsU0FBUEEsSUFBTztBQUFBLHFCQUFPLGtCQUFTQyxHQUFULENBQVA7QUFBQSxhQTlCQTs7QUFnQ2JELGlCQUFLRSxHQUFMO0FBQ0FGLGlCQUFLRyxLQUFMOztBQWpDYSw2Q0FtQ05ILElBbkNNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiaG9wcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2hvcHAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBIb3BwIGZyb20gJy4vdGFza3MvbWdyJ1xuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vdGFza3Mvd2F0Y2gnXG5pbXBvcnQgbG9hZFBsdWdpbnMgZnJvbSAnLi9wbHVnaW5zL2xvYWQnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5cbi8qKlxuICogQ3JlYXRlIGhvcHAgb2JqZWN0IGJhc2VkIG9uIHBsdWdpbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIDsoYXdhaXQgbG9hZFBsdWdpbnMoZGlyZWN0b3J5KSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICBsZXQgcGx1Z05hbWUgPSAnJ1xuXG4gICAgZm9yIChsZXQgdG1wID0gcGF0aC5iYXNlbmFtZShuYW1lKSwgaSA9IDU7IGkgPCB0bXAubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIHBsdWdOYW1lICs9IHRtcFtpXSA9PT0gJy0nID8gdG1wW2krK10udG9VcHBlckNhc2UoKSA6IHRtcFtpXVxuICAgIH1cblxuICAgIGRlYnVnKCdhZGRpbmcgcGx1Z2luICVzIGZyb20gJXMnLCBwbHVnTmFtZSwgbmFtZSlcbiAgICBcbiAgICAvLyBhZGQgdGhlIHBsdWdpbiB0byB0aGUgaG9wcCBwcm90b3R5cGUgc28gaXQgY2FuIGJlXG4gICAgLy8gdXNlZCBmb3IgdGhlIHJlc3Qgb2YgdGhlIGJ1aWxkIHByb2Nlc3NcbiAgICBIb3BwLnByb3RvdHlwZVtwbHVnTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBpbnN0ZWFkIG9mIGFjdHVhbGx5IGxvYWRpbmcgdGhlIHBsdWdpbiBhdCB0aGlzIHN0YWdlLFxuICAgICAgLy8gd2Ugd2lsbCBqdXN0IHBvcCBpdHMgY2FsbCBpbnRvIG91ciBpbnRlcm5hbCBjYWxsIHN0YWNrXG4gICAgICAvLyBmb3IgdXNlIGxhdGVyLiB0aGlzIGlzIHVzZWZ1bCB3aGVuIHdlIGFyZSBzdGVwcGluZyB0aHJvdWdoXG4gICAgICAvLyBhbiBlbnRpcmUgaG9wcGZpbGUgYnV0IG1pZ2h0IG9ubHkgYmUgcnVubmluZyBhIHNpbmdsZSB0YXNrXG5cbiAgICAgIHRoaXMuZC5zdGFjay5wdXNoKFtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgYXJndW1lbnRzXG4gICAgICBdKVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICAvKipcbiAgICogRXhwb3NlIGhvcHAgY2xhc3MgZm9yIHRhc2sgY3JlYXRpb24uXG4gICAqL1xuICBjb25zdCBpbml0ID0gc3JjID0+IG5ldyBIb3BwKHNyYylcbiAgXG4gIGluaXQuYWxsID0gY3JlYXRlUGFyYWxsZWxcbiAgaW5pdC53YXRjaCA9IGNyZWF0ZVdhdGNoXG5cbiAgcmV0dXJuIGluaXRcbn0iXX0=