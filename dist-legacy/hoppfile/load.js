'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _path = require('path');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
    var lmod, state, _ref2, _ref3, code, req, _require, Script, babel, env, script, scopeExports, scope, bustedTasks, task, json;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof file !== 'string')) {
              _context.next = 2;
              break;
            }

            throw new Error('Unknown arguments');

          case 2:
            _context.next = 4;
            return (0, _fs.stat)(file);

          case 4:
            lmod = +_context.sent.mtime;


            // try to load from cache
            state = {};
            _ref2 = cache.val('_') || [];
            _ref3 = _slicedToArray(_ref2, 2);
            state.lmod = _ref3[0];
            state.tasks = _ref3[1];

            if (!(state.lmod === lmod)) {
              _context.next = 12;
              break;
            }

            return _context.abrupt('return', [true, {}, state.tasks]);

          case 12:
            _context.next = 14;
            return (0, _fs.readFile)(file, 'utf8');

          case 14:
            code = _context.sent;
            req = require('require-like');
            _require = require('vm'), Script = _require.Script;

            // crude test to see if babel is needed

            if (!(process.env.HARMONY_FLAG === 'true')) {
              _context.next = 28;
              break;
            }

            babel = void 0, env = void 0;
            _context.prev = 19;

            babel = require('babel-core');
            env = require('babel-preset-env');
            _context.next = 27;
            break;

          case 24:
            _context.prev = 24;
            _context.t0 = _context['catch'](19);
            throw new Error('Please install babel-core locally to use the harmony flag.');

          case 27:

            // compile with babel
            code = babel.transform(code, {
              babelrc: false,
              presets: [[env, {
                targets: {
                  node: 'current'
                }
              }]]
            }).code;

          case 28:

            // setup virtual script
            script = new Script('(function (exports, require, module, __filename, __dirname) {\n      ' + code + '\n     }(scope.exports, scope.require, scope.module, scope.__filename, scope.__dirname))', {
              filename: file,
              displayErrors: true
            });

            // setup mock scope

            scopeExports = {}, scope = {
              exports: scopeExports,
              require: req(file),
              module: {
                exports: scopeExports
              },

              __dirname: (0, _path.dirname)(file),
              __filename: file

              // expose to script
            };
            global.scope = scope;

            // run script
            script.runInThisContext({
              filename: file
            });

            // clean global scope
            delete global.scope;

            // figure out which tasks are bust
            state.tasks = state.tasks || {};
            bustedTasks = {};

            // only try checking for single tasks

            for (task in scope.module.exports) {
              if (scope.module.exports.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
                json = scope.module.exports[task].toJSON();


                if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
                  bustedTasks[task] = true;
                }
              }
            }

            // cache exports
            cache.val('_', [lmod, scope.module.exports]);

            // return exports
            return _context.abrupt('return', [false, bustedTasks, scope.module.exports]);

          case 38:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[19, 24]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0IiwiYnVzdGVkVGFza3MiLCJ0YXNrIiwiaGFzT3duUHJvcGVydHkiLCJqc29uIiwidG9KU09OIiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBTUE7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7Ozs7MmNBVEE7Ozs7Ozs7dURBV2UsaUJBQU1DLElBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQUVSLE9BQU9BLElBQVAsS0FBZ0IsUUFGUjtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFHTCxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FISzs7QUFBQTtBQUFBO0FBQUEsbUJBT1EsY0FBS0QsSUFBTCxDQVBSOztBQUFBO0FBT1BFLGdCQVBPLGtCQU9vQkMsS0FQcEI7OztBQVNiO0FBQ01DLGlCQVZPLEdBVUMsRUFWRDtBQUFBLG9CQVdnQkwsTUFBTU0sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFYbEM7QUFBQTtBQVdYRCxrQkFBTUYsSUFYSztBQVdDRSxrQkFBTUUsS0FYUDs7QUFBQSxrQkFhVEYsTUFBTUYsSUFBTixLQUFlQSxJQWJOO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWNKLENBQUMsSUFBRCxFQUFPLEVBQVAsRUFBV0UsTUFBTUUsS0FBakIsQ0FkSTs7QUFBQTtBQUFBO0FBQUEsbUJBa0JJLGtCQUFTTixJQUFULEVBQWUsTUFBZixDQWxCSjs7QUFBQTtBQWtCVE8sZ0JBbEJTO0FBb0JQQyxlQXBCTyxHQW9CREMsUUFBUSxjQUFSLENBcEJDO0FBQUEsdUJBcUJNQSxRQUFRLElBQVIsQ0FyQk4sRUFxQkxDLE1BckJLLFlBcUJMQSxNQXJCSzs7QUF1QmI7O0FBdkJhLGtCQXdCVEMsUUFBUUMsR0FBUixDQUFZQyxZQUFaLEtBQTZCLE1BeEJwQjtBQUFBO0FBQUE7QUFBQTs7QUF5QlBDLGlCQXpCTyxXQXlCQUYsR0F6QkE7QUFBQTs7QUE0QlRFLG9CQUFRTCxRQUFRLFlBQVIsQ0FBUjtBQUNBRyxrQkFBTUgsUUFBUSxrQkFBUixDQUFOO0FBN0JTO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBK0JILElBQUlSLEtBQUosQ0FBVSw0REFBVixDQS9CRzs7QUFBQTs7QUFrQ1g7QUFDQU0sbUJBQU9PLE1BQU1DLFNBQU4sQ0FBZ0JSLElBQWhCLEVBQXNCO0FBQzNCUyx1QkFBUyxLQURrQjtBQUUzQkMsdUJBQVMsQ0FDUCxDQUFDTCxHQUFELEVBQU07QUFDSk0seUJBQVM7QUFDUEMsd0JBQU07QUFEQztBQURMLGVBQU4sQ0FETztBQUZrQixhQUF0QixFQVNKWixJQVRIOztBQW5DVzs7QUErQ2I7QUFDTWEsa0JBaERPLEdBZ0RFLElBQUlWLE1BQUosMkVBRVRILElBRlMsK0ZBSWI7QUFDQWMsd0JBQVVyQixJQURWO0FBRUFzQiw2QkFBZTtBQUZmLGFBSmEsQ0FoREY7O0FBeURiOztBQUNNQyx3QkExRE8sR0EwRFEsRUExRFIsRUEyRFBDLEtBM0RPLEdBMkRDO0FBQ05DLHVCQUFTRixZQURIO0FBRU5kLHVCQUFTRCxJQUFJUixJQUFKLENBRkg7QUFHTjBCLHNCQUFRO0FBQ05ELHlCQUFTRjtBQURILGVBSEY7O0FBT05JLHlCQUFXLG1CQUFRM0IsSUFBUixDQVBMO0FBUU40QiwwQkFBWTVCOztBQUdwQjtBQVhjLGFBM0REO0FBdUViNkIsbUJBQU9MLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixtQkFBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULHdCQUFVckI7QUFEWSxhQUF4Qjs7QUFJQTtBQUNBLG1CQUFPNkIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBcEIsa0JBQU1FLEtBQU4sR0FBY0YsTUFBTUUsS0FBTixJQUFlLEVBQTdCO0FBQ015Qix1QkFuRk8sR0FtRk8sRUFuRlA7O0FBcUZiOztBQUNBLGlCQUFTQyxJQUFULElBQWlCUixNQUFNRSxNQUFOLENBQWFELE9BQTlCLEVBQXVDO0FBQ3JDLGtCQUFJRCxNQUFNRSxNQUFOLENBQWFELE9BQWIsQ0FBcUJRLGNBQXJCLENBQW9DRCxJQUFwQyxLQUE2QzVCLE1BQU1FLEtBQU4sQ0FBWTJCLGNBQVosQ0FBMkJELElBQTNCLENBQWpELEVBQW1GO0FBQzNFRSxvQkFEMkUsR0FDcEVWLE1BQU1FLE1BQU4sQ0FBYUQsT0FBYixDQUFxQk8sSUFBckIsRUFBMkJHLE1BQTNCLEVBRG9FOzs7QUFHakYsb0JBQUksRUFBRUQsZ0JBQWdCRSxLQUFsQixLQUE0QixDQUFDLHNCQUFVRixJQUFWLEVBQWdCOUIsTUFBTUUsS0FBTixDQUFZMEIsSUFBWixDQUFoQixDQUFqQyxFQUFxRTtBQUNuRUQsOEJBQVlDLElBQVosSUFBb0IsSUFBcEI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7QUFDQWpDLGtCQUFNTSxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JILElBRGEsRUFFYnNCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQSxDQUFmOztBQUtBO0FBdEdhLDZDQXVHTixDQUFDLEtBQUQsRUFBUU0sV0FBUixFQUFxQlAsTUFBTUUsTUFBTixDQUFhRCxPQUFsQyxDQXZHTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgeyBkZWVwRXF1YWwgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZpbGUgPT4ge1xuICAvLyBpZiBiYWQgYXJncyBkaWVcbiAgaWYgKCB0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGFyZ3VtZW50cycpXG4gIH1cblxuICAvLyBnZXQgZmlsZSBzdGF0XG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IHt9XG4gIDtbc3RhdGUubG1vZCwgc3RhdGUudGFza3NdID0gY2FjaGUudmFsKCdfJykgfHwgW11cblxuICBpZiAoc3RhdGUubG1vZCA9PT0gbG1vZCkge1xuICAgIHJldHVybiBbdHJ1ZSwge30sIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgLy8gbG9hZCBmaWxlXG4gIGxldCBjb2RlID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIGNvbnN0IHJlcSA9IHJlcXVpcmUoJ3JlcXVpcmUtbGlrZScpXG4gIGNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKCd2bScpXG5cbiAgLy8gY3J1ZGUgdGVzdCB0byBzZWUgaWYgYmFiZWwgaXMgbmVlZGVkXG4gIGlmIChwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPT09ICd0cnVlJykge1xuICAgIGxldCBiYWJlbCwgZW52XG5cbiAgICB0cnkge1xuICAgICAgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcbiAgICAgIGVudiA9IHJlcXVpcmUoJ2JhYmVsLXByZXNldC1lbnYnKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5zdGFsbCBiYWJlbC1jb3JlIGxvY2FsbHkgdG8gdXNlIHRoZSBoYXJtb255IGZsYWcuJylcbiAgICB9XG5cbiAgICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgICBjb2RlID0gYmFiZWwudHJhbnNmb3JtKGNvZGUsIHtcbiAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgcHJlc2V0czogW1xuICAgICAgICBbZW52LCB7XG4gICAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgXVxuICAgIH0pLmNvZGVcbiAgfVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGZpZ3VyZSBvdXQgd2hpY2ggdGFza3MgYXJlIGJ1c3RcbiAgc3RhdGUudGFza3MgPSBzdGF0ZS50YXNrcyB8fCB7fVxuICBjb25zdCBidXN0ZWRUYXNrcyA9IHt9XG5cbiAgLy8gb25seSB0cnkgY2hlY2tpbmcgZm9yIHNpbmdsZSB0YXNrc1xuICBmb3IgKGxldCB0YXNrIGluIHNjb3BlLm1vZHVsZS5leHBvcnRzKSB7XG4gICAgaWYgKHNjb3BlLm1vZHVsZS5leHBvcnRzLmhhc093blByb3BlcnR5KHRhc2spICYmIHN0YXRlLnRhc2tzLmhhc093blByb3BlcnR5KHRhc2spKSB7XG4gICAgICBjb25zdCBqc29uID0gc2NvcGUubW9kdWxlLmV4cG9ydHNbdGFza10udG9KU09OKClcblxuICAgICAgaWYgKCEoanNvbiBpbnN0YW5jZW9mIEFycmF5KSAmJiAhZGVlcEVxdWFsKGpzb24sIHN0YXRlLnRhc2tzW3Rhc2tdKSkge1xuICAgICAgICBidXN0ZWRUYXNrc1t0YXNrXSA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBsbW9kLFxuICAgIHNjb3BlLm1vZHVsZS5leHBvcnRzXG4gIF0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgYnVzdGVkVGFza3MsIHNjb3BlLm1vZHVsZS5leHBvcnRzXVxufVxuIl19