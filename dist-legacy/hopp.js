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

            init.watch = _watch2.default;
            return _context.abrupt('return', init);

          case 8:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwiaSIsIm5hbWUiLCJsZW5ndGgiLCJ0b1VwcGVyQ2FzZSIsInByb3RvdHlwZSIsImNhbGxTdGFjayIsInB1c2giLCJhcmd1bWVudHMiLCJmb3JFYWNoIiwiaW5pdCIsInNyYyIsIndhdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7OzJjQVRBOzs7Ozs7ZUFXa0JBLFFBQVEsYUFBUixFQUF1Qjs7QUFFekM7OztBQUZrQixDO0lBQVZDLEssWUFBQUEsSzs7O3VEQUtPLGlCQUFNQyxTQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNiLGFBRGE7QUFBQSxtQkFDTCxvQkFBWUEsU0FBWixDQURLOztBQUFBO0FBQUEsMEJBQzJCLGdCQUFRO0FBQzlDLGtCQUFJQyxXQUFXLEVBQWY7O0FBRUEsbUJBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJQyxLQUFLQyxNQUF6QixFQUFpQ0YsS0FBSyxDQUF0QyxFQUF5QztBQUN2Q0QsNEJBQVlFLEtBQUtELENBQUwsTUFBWSxHQUFaLEdBQWtCQyxLQUFLRCxHQUFMLEVBQVVHLFdBQVYsRUFBbEIsR0FBNENGLEtBQUtELENBQUwsQ0FBeEQ7QUFDRDs7QUFFREgsb0JBQU0sa0JBQU4sRUFBMEJJOztBQUUxQjtBQUNBO0FBSEEsZ0JBSUEsY0FBS0csU0FBTCxDQUFlTCxRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQUtNLFNBQUwsQ0FBZUMsSUFBZixDQUFvQixDQUNsQkwsSUFEa0IsRUFFbEJNLFNBRmtCLENBQXBCOztBQUtBLHVCQUFPLElBQVA7QUFDRCxlQVpEO0FBYUQ7O0FBRUQ7OztBQTNCYTs7QUFBQSwwQkFDbUJDLE9BRG5COztBQThCUEMsZ0JBOUJPLEdBOEJBLFNBQVBBLElBQU87QUFBQSxxQkFBTyxrQkFBU0MsR0FBVCxDQUFQO0FBQUEsYUE5QkE7O0FBK0JiRCxpQkFBS0UsS0FBTDtBQS9CYSw2Q0FnQ05GLElBaENNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoiaG9wcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL2hvcHAuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBIb3BwIGZyb20gJy4vdGFza3MvbWdyJ1xuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vdGFza3Mvd2F0Y2gnXG5pbXBvcnQgbG9hZFBsdWdpbnMgZnJvbSAnLi9wbHVnaW5zL2xvYWQnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIENyZWF0ZSBob3BwIG9iamVjdCBiYXNlZCBvbiBwbHVnaW5zLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICA7KGF3YWl0IGxvYWRQbHVnaW5zKGRpcmVjdG9yeSkpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgbGV0IHBsdWdOYW1lID0gJydcblxuICAgIGZvciAobGV0IGkgPSA1OyBpIDwgbmFtZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgcGx1Z05hbWUgKz0gbmFtZVtpXSA9PT0gJy0nID8gbmFtZVtpKytdLnRvVXBwZXJDYXNlKCkgOiBuYW1lW2ldXG4gICAgfVxuXG4gICAgZGVidWcoJ2FkZGluZyBwbHVnaW4gJXMnLCBuYW1lKVxuICAgIFxuICAgIC8vIGFkZCB0aGUgcGx1Z2luIHRvIHRoZSBob3BwIHByb3RvdHlwZSBzbyBpdCBjYW4gYmVcbiAgICAvLyB1c2VkIGZvciB0aGUgcmVzdCBvZiB0aGUgYnVpbGQgcHJvY2Vzc1xuICAgIEhvcHAucHJvdG90eXBlW3BsdWdOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGluc3RlYWQgb2YgYWN0dWFsbHkgbG9hZGluZyB0aGUgcGx1Z2luIGF0IHRoaXMgc3RhZ2UsXG4gICAgICAvLyB3ZSB3aWxsIGp1c3QgcG9wIGl0cyBjYWxsIGludG8gb3VyIGludGVybmFsIGNhbGwgc3RhY2tcbiAgICAgIC8vIGZvciB1c2UgbGF0ZXIuIHRoaXMgaXMgdXNlZnVsIHdoZW4gd2UgYXJlIHN0ZXBwaW5nIHRocm91Z2hcbiAgICAgIC8vIGFuIGVudGlyZSBob3BwZmlsZSBidXQgbWlnaHQgb25seSBiZSBydW5uaW5nIGEgc2luZ2xlIHRhc2tcblxuICAgICAgdGhpcy5jYWxsU3RhY2sucHVzaChbXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFyZ3VtZW50c1xuICAgICAgXSlcblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIEV4cG9zZSBob3BwIGNsYXNzIGZvciB0YXNrIGNyZWF0aW9uLlxuICAgKi9cbiAgY29uc3QgaW5pdCA9IHNyYyA9PiBuZXcgSG9wcChzcmMpXG4gIGluaXQud2F0Y2ggPSBjcmVhdGVXYXRjaFxuICByZXR1cm4gaW5pdFxufSJdfQ==