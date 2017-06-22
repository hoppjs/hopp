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

var _loadPlugins = require('./tasks/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/hopp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc..
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'),
    debug = _require.debug;

/**
 * Create hopp object based on plugins.
 */


exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var init;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ;_context.next = 3;
            return (0, _loadPlugins2.default)(directory);

          case 3:
            _context.t0 = function (name) {
              var plugName = '';

              for (var tmp = _path2.default.basename(name), i = 5; i < tmp.length; i += 1) {
                plugName += tmp[i] === '-' ? tmp[i++].toUpperCase() : tmp[i];
              }

              debug('adding plugin %s from %s', plugName, name);

              // add the plugin to the hopp prototype so it can be
              // used for the rest of the build process
              _mgr2.default.prototype[plugName] = function () {
                // instead of actually loading the plugin at this stage,
                // we will just pop its call into our internal call stack
                // for use later. this is useful when we are stepping through
                // an entire hoppfile but might only be running a single task

                this.d.stack.push([name, [].slice.call(arguments)]);

                return this;
              };
            };

            _context.sent.forEach(_context.t0);

            /**
             * Expose hopp class for task creation.
             */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ob3BwLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJkZWJ1ZyIsImRpcmVjdG9yeSIsInBsdWdOYW1lIiwidG1wIiwiYmFzZW5hbWUiLCJuYW1lIiwiaSIsImxlbmd0aCIsInRvVXBwZXJDYXNlIiwicHJvdG90eXBlIiwiZCIsInN0YWNrIiwicHVzaCIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImZvckVhY2giLCJpbml0Iiwic3JjIiwiYWxsIiwid2F0Y2giXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FWQTs7Ozs7O2VBWWtCQSxRQUFRLGFBQVIsRUFBdUIsTUFBdkIsQztJQUFWQyxLLFlBQUFBLEs7O0FBRVI7Ozs7Ozt1REFHZSxpQkFBTUMsU0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDYixhQURhO0FBQUEsbUJBQ0wsMkJBQVlBLFNBQVosQ0FESzs7QUFBQTtBQUFBLDBCQUMyQixnQkFBUTtBQUM5QyxrQkFBSUMsV0FBVyxFQUFmOztBQUVBLG1CQUFLLElBQUlDLE1BQU0sZUFBS0MsUUFBTCxDQUFjQyxJQUFkLENBQVYsRUFBK0JDLElBQUksQ0FBeEMsRUFBMkNBLElBQUlILElBQUlJLE1BQW5ELEVBQTJERCxLQUFLLENBQWhFLEVBQW1FO0FBQ2pFSiw0QkFBWUMsSUFBSUcsQ0FBSixNQUFXLEdBQVgsR0FBaUJILElBQUlHLEdBQUosRUFBU0UsV0FBVCxFQUFqQixHQUEwQ0wsSUFBSUcsQ0FBSixDQUF0RDtBQUNEOztBQUVETixvQkFBTSwwQkFBTixFQUFrQ0UsUUFBbEMsRUFBNENHLElBQTVDOztBQUVBO0FBQ0E7QUFDQSw0QkFBS0ksU0FBTCxDQUFlUCxRQUFmLElBQTJCLFlBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQUtRLENBQUwsQ0FBT0MsS0FBUCxDQUFhQyxJQUFiLENBQWtCLENBQ2hCUCxJQURnQixFQUVoQixHQUFHUSxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBZCxDQUZnQixDQUFsQjs7QUFLQSx1QkFBTyxJQUFQO0FBQ0QsZUFaRDtBQWFELGFBekJZOztBQUFBLDBCQUNtQkMsT0FEbkI7O0FBMkJiOzs7QUFHTUMsZ0JBOUJPLEdBOEJBLFNBQVBBLElBQU87QUFBQSxxQkFBTyxrQkFBU0MsR0FBVCxDQUFQO0FBQUEsYUE5QkE7O0FBZ0NiRCxpQkFBS0UsR0FBTDtBQUNBRixpQkFBS0csS0FBTDs7QUFqQ2EsNkNBbUNOSCxJQW5DTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImhvcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9ob3BwLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLi5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IEhvcHAgZnJvbSAnLi90YXNrcy9tZ3InXG5pbXBvcnQgY3JlYXRlV2F0Y2ggZnJvbSAnLi90YXNrcy93YXRjaCdcbmltcG9ydCBsb2FkUGx1Z2lucyBmcm9tICcuL3Rhc2tzL2xvYWRQbHVnaW5zJ1xuaW1wb3J0IGNyZWF0ZVBhcmFsbGVsIGZyb20gJy4vdGFza3MvcGFyYWxsZWwnXG5cbmNvbnN0IHsgZGVidWcgfSA9IHJlcXVpcmUoJy4vdXRpbHMvbG9nJykoJ2hvcHAnKVxuXG4vKipcbiAqIENyZWF0ZSBob3BwIG9iamVjdCBiYXNlZCBvbiBwbHVnaW5zLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBkaXJlY3RvcnkgPT4ge1xuICA7KGF3YWl0IGxvYWRQbHVnaW5zKGRpcmVjdG9yeSkpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgbGV0IHBsdWdOYW1lID0gJydcblxuICAgIGZvciAobGV0IHRtcCA9IHBhdGguYmFzZW5hbWUobmFtZSksIGkgPSA1OyBpIDwgdG1wLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBwbHVnTmFtZSArPSB0bXBbaV0gPT09ICctJyA/IHRtcFtpKytdLnRvVXBwZXJDYXNlKCkgOiB0bXBbaV1cbiAgICB9XG5cbiAgICBkZWJ1ZygnYWRkaW5nIHBsdWdpbiAlcyBmcm9tICVzJywgcGx1Z05hbWUsIG5hbWUpXG4gICAgXG4gICAgLy8gYWRkIHRoZSBwbHVnaW4gdG8gdGhlIGhvcHAgcHJvdG90eXBlIHNvIGl0IGNhbiBiZVxuICAgIC8vIHVzZWQgZm9yIHRoZSByZXN0IG9mIHRoZSBidWlsZCBwcm9jZXNzXG4gICAgSG9wcC5wcm90b3R5cGVbcGx1Z05hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gaW5zdGVhZCBvZiBhY3R1YWxseSBsb2FkaW5nIHRoZSBwbHVnaW4gYXQgdGhpcyBzdGFnZSxcbiAgICAgIC8vIHdlIHdpbGwganVzdCBwb3AgaXRzIGNhbGwgaW50byBvdXIgaW50ZXJuYWwgY2FsbCBzdGFja1xuICAgICAgLy8gZm9yIHVzZSBsYXRlci4gdGhpcyBpcyB1c2VmdWwgd2hlbiB3ZSBhcmUgc3RlcHBpbmcgdGhyb3VnaFxuICAgICAgLy8gYW4gZW50aXJlIGhvcHBmaWxlIGJ1dCBtaWdodCBvbmx5IGJlIHJ1bm5pbmcgYSBzaW5nbGUgdGFza1xuXG4gICAgICB0aGlzLmQuc3RhY2sucHVzaChbXG4gICAgICAgIG5hbWUsXG4gICAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgXSlcblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIEV4cG9zZSBob3BwIGNsYXNzIGZvciB0YXNrIGNyZWF0aW9uLlxuICAgKi9cbiAgY29uc3QgaW5pdCA9IHNyYyA9PiBuZXcgSG9wcChzcmMpXG4gIFxuICBpbml0LmFsbCA9IGNyZWF0ZVBhcmFsbGVsXG4gIGluaXQud2F0Y2ggPSBjcmVhdGVXYXRjaFxuXG4gIHJldHVybiBpbml0XG59XG4iXX0=