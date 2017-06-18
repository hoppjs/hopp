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

                this.d.stack.push([name, [].slice.call(arguments)]);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwidG1wIiwiYmFzZW5hbWUiLCJuYW1lIiwiaSIsImxlbmd0aCIsInRvVXBwZXJDYXNlIiwicHJvdG90eXBlIiwiZCIsInN0YWNrIiwicHVzaCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImZvckVhY2giLCJpbml0Iiwic3JjIiwiYWxsIiwid2F0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FWQTs7Ozs7O2VBWWtCQSxRQUFRLGFBQVIsRUFBdUI7O0FBRXpDOzs7QUFGa0IsQztJQUFWQyxLLFlBQUFBLEs7Ozt1REFLTyxpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDYixhQURhO0FBQUEsbUJBQ0wsb0JBQVlBLFNBQVosQ0FESzs7QUFBQTtBQUFBLDBCQUMyQixnQkFBUTtBQUM5QyxrQkFBSUMsV0FBVyxFQUFmOztBQUVBLG1CQUFLLElBQUlDLE1BQU0sZUFBS0MsUUFBTCxDQUFjQyxJQUFkLENBQVYsRUFBK0JDLElBQUksQ0FBeEMsRUFBMkNBLElBQUlILElBQUlJLE1BQW5ELEVBQTJERCxLQUFLLENBQWhFLEVBQW1FO0FBQ2pFSiw0QkFBWUMsSUFBSUcsQ0FBSixNQUFXLEdBQVgsR0FBaUJILElBQUlHLEdBQUosRUFBU0UsV0FBVCxFQUFqQixHQUEwQ0wsSUFBSUcsQ0FBSixDQUF0RDtBQUNEOztBQUVETixvQkFBTSwwQkFBTixFQUFrQ0UsUUFBbEMsRUFBNENHOztBQUU1QztBQUNBO0FBSEEsZ0JBSUEsY0FBS0ksU0FBTCxDQUFlUCxRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQUtRLENBQUwsQ0FBT0MsS0FBUCxDQUFhQyxJQUFiLENBQWtCLENBQ2hCUCxJQURnQixFQUVoQixHQUFHUSxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUZnQixDQUFsQjs7QUFLQSx1QkFBTyxJQUFQO0FBQ0QsZUFaRDtBQWFEOztBQUVEOzs7QUEzQmE7O0FBQUEsMEJBQ21CQyxPQURuQjs7QUE4QlBDLGdCQTlCTyxHQThCQSxTQUFQQSxJQUFPO0FBQUEscUJBQU8sa0JBQVNDLEdBQVQsQ0FBUDtBQUFBLGFBOUJBOztBQWdDYkQsaUJBQUtFLEdBQUw7QUFDQUYsaUJBQUtHLEtBQUw7O0FBakNhLDZDQW1DTkgsSUFuQ007O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsImZpbGUiOiJob3BwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvaG9wcC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IEhvcHAgZnJvbSAnLi90YXNrcy9tZ3InXG5pbXBvcnQgY3JlYXRlV2F0Y2ggZnJvbSAnLi90YXNrcy93YXRjaCdcbmltcG9ydCBsb2FkUGx1Z2lucyBmcm9tICcuL3BsdWdpbnMvbG9hZCdcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3Rhc2tzL3BhcmFsbGVsJ1xuXG5jb25zdCB7IGRlYnVnIH0gPSByZXF1aXJlKCcuL3V0aWxzL2xvZycpKCdob3BwJylcblxuLyoqXG4gKiBDcmVhdGUgaG9wcCBvYmplY3QgYmFzZWQgb24gcGx1Z2lucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZGlyZWN0b3J5ID0+IHtcbiAgOyhhd2FpdCBsb2FkUGx1Z2lucyhkaXJlY3RvcnkpKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGxldCBwbHVnTmFtZSA9ICcnXG5cbiAgICBmb3IgKGxldCB0bXAgPSBwYXRoLmJhc2VuYW1lKG5hbWUpLCBpID0gNTsgaSA8IHRtcC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgcGx1Z05hbWUgKz0gdG1wW2ldID09PSAnLScgPyB0bXBbaSsrXS50b1VwcGVyQ2FzZSgpIDogdG1wW2ldXG4gICAgfVxuXG4gICAgZGVidWcoJ2FkZGluZyBwbHVnaW4gJXMgZnJvbSAlcycsIHBsdWdOYW1lLCBuYW1lKVxuICAgIFxuICAgIC8vIGFkZCB0aGUgcGx1Z2luIHRvIHRoZSBob3BwIHByb3RvdHlwZSBzbyBpdCBjYW4gYmVcbiAgICAvLyB1c2VkIGZvciB0aGUgcmVzdCBvZiB0aGUgYnVpbGQgcHJvY2Vzc1xuICAgIEhvcHAucHJvdG90eXBlW3BsdWdOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGluc3RlYWQgb2YgYWN0dWFsbHkgbG9hZGluZyB0aGUgcGx1Z2luIGF0IHRoaXMgc3RhZ2UsXG4gICAgICAvLyB3ZSB3aWxsIGp1c3QgcG9wIGl0cyBjYWxsIGludG8gb3VyIGludGVybmFsIGNhbGwgc3RhY2tcbiAgICAgIC8vIGZvciB1c2UgbGF0ZXIuIHRoaXMgaXMgdXNlZnVsIHdoZW4gd2UgYXJlIHN0ZXBwaW5nIHRocm91Z2hcbiAgICAgIC8vIGFuIGVudGlyZSBob3BwZmlsZSBidXQgbWlnaHQgb25seSBiZSBydW5uaW5nIGEgc2luZ2xlIHRhc2tcblxuICAgICAgdGhpcy5kLnN0YWNrLnB1c2goW1xuICAgICAgICBuYW1lLFxuICAgICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgIF0pXG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9KVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgaG9wcCBjbGFzcyBmb3IgdGFzayBjcmVhdGlvbi5cbiAgICovXG4gIGNvbnN0IGluaXQgPSBzcmMgPT4gbmV3IEhvcHAoc3JjKVxuICBcbiAgaW5pdC5hbGwgPSBjcmVhdGVQYXJhbGxlbFxuICBpbml0LndhdGNoID0gY3JlYXRlV2F0Y2hcblxuICByZXR1cm4gaW5pdFxufSJdfQ==