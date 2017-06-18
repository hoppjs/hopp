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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwiaSIsIm5hbWUiLCJsZW5ndGgiLCJ0b1VwcGVyQ2FzZSIsInByb3RvdHlwZSIsImNhbGxTdGFjayIsInB1c2giLCJhcmd1bWVudHMiLCJmb3JFYWNoIiwiaW5pdCIsInNyYyIsImFsbCIsIndhdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7MmNBVkE7Ozs7OztlQVlrQkEsUUFBUSxhQUFSLEVBQXVCOztBQUV6Qzs7O0FBRmtCLEM7SUFBVkMsSyxZQUFBQSxLOzs7dURBS08saUJBQU1DLFNBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2IsYUFEYTtBQUFBLG1CQUNMLG9CQUFZQSxTQUFaLENBREs7O0FBQUE7QUFBQSwwQkFDMkIsZ0JBQVE7QUFDOUMsa0JBQUlDLFdBQVcsRUFBZjs7QUFFQSxtQkFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLEtBQUtDLE1BQXpCLEVBQWlDRixLQUFLLENBQXRDLEVBQXlDO0FBQ3ZDRCw0QkFBWUUsS0FBS0QsQ0FBTCxNQUFZLEdBQVosR0FBa0JDLEtBQUtELEdBQUwsRUFBVUcsV0FBVixFQUFsQixHQUE0Q0YsS0FBS0QsQ0FBTCxDQUF4RDtBQUNEOztBQUVESCxvQkFBTSxrQkFBTixFQUEwQkk7O0FBRTFCO0FBQ0E7QUFIQSxnQkFJQSxjQUFLRyxTQUFMLENBQWVMLFFBQWYsSUFBMkIsWUFBWTtBQUNyQztBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBS00sU0FBTCxDQUFlQyxJQUFmLENBQW9CLENBQ2xCTCxJQURrQixFQUVsQk0sU0FGa0IsQ0FBcEI7O0FBS0EsdUJBQU8sSUFBUDtBQUNELGVBWkQ7QUFhRDs7QUFFRDs7O0FBM0JhOztBQUFBLDBCQUNtQkMsT0FEbkI7O0FBOEJQQyxnQkE5Qk8sR0E4QkEsU0FBUEEsSUFBTztBQUFBLHFCQUFPLGtCQUFTQyxHQUFULENBQVA7QUFBQSxhQTlCQTs7QUFnQ2JELGlCQUFLRSxHQUFMO0FBQ0FGLGlCQUFLRyxLQUFMOztBQWpDYSw2Q0FtQ05ILElBbkNNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiaG9wcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2hvcHAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBIb3BwIGZyb20gJy4vdGFza3MvbWdyJ1xuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vdGFza3Mvd2F0Y2gnXG5pbXBvcnQgbG9hZFBsdWdpbnMgZnJvbSAnLi9wbHVnaW5zL2xvYWQnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi90YXNrcy9wYXJhbGxlbCdcblxuY29uc3QgeyBkZWJ1ZyB9ID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKSgnaG9wcCcpXG5cbi8qKlxuICogQ3JlYXRlIGhvcHAgb2JqZWN0IGJhc2VkIG9uIHBsdWdpbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGRpcmVjdG9yeSA9PiB7XG4gIDsoYXdhaXQgbG9hZFBsdWdpbnMoZGlyZWN0b3J5KSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICBsZXQgcGx1Z05hbWUgPSAnJ1xuXG4gICAgZm9yIChsZXQgaSA9IDU7IGkgPCBuYW1lLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBwbHVnTmFtZSArPSBuYW1lW2ldID09PSAnLScgPyBuYW1lW2krK10udG9VcHBlckNhc2UoKSA6IG5hbWVbaV1cbiAgICB9XG5cbiAgICBkZWJ1ZygnYWRkaW5nIHBsdWdpbiAlcycsIG5hbWUpXG4gICAgXG4gICAgLy8gYWRkIHRoZSBwbHVnaW4gdG8gdGhlIGhvcHAgcHJvdG90eXBlIHNvIGl0IGNhbiBiZVxuICAgIC8vIHVzZWQgZm9yIHRoZSByZXN0IG9mIHRoZSBidWlsZCBwcm9jZXNzXG4gICAgSG9wcC5wcm90b3R5cGVbcGx1Z05hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gaW5zdGVhZCBvZiBhY3R1YWxseSBsb2FkaW5nIHRoZSBwbHVnaW4gYXQgdGhpcyBzdGFnZSxcbiAgICAgIC8vIHdlIHdpbGwganVzdCBwb3AgaXRzIGNhbGwgaW50byBvdXIgaW50ZXJuYWwgY2FsbCBzdGFja1xuICAgICAgLy8gZm9yIHVzZSBsYXRlci4gdGhpcyBpcyB1c2VmdWwgd2hlbiB3ZSBhcmUgc3RlcHBpbmcgdGhyb3VnaFxuICAgICAgLy8gYW4gZW50aXJlIGhvcHBmaWxlIGJ1dCBtaWdodCBvbmx5IGJlIHJ1bm5pbmcgYSBzaW5nbGUgdGFza1xuXG4gICAgICB0aGlzLmNhbGxTdGFjay5wdXNoKFtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgYXJndW1lbnRzXG4gICAgICBdKVxuXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICAvKipcbiAgICogRXhwb3NlIGhvcHAgY2xhc3MgZm9yIHRhc2sgY3JlYXRpb24uXG4gICAqL1xuICBjb25zdCBpbml0ID0gc3JjID0+IG5ldyBIb3BwKHNyYylcbiAgXG4gIGluaXQuYWxsID0gY3JlYXRlUGFyYWxsZWxcbiAgaW5pdC53YXRjaCA9IGNyZWF0ZVdhdGNoXG5cbiAgcmV0dXJuIGluaXRcbn0iXX0=