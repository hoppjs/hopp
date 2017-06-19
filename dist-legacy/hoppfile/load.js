'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

var _deepEqual = require('../deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
    var lmod, state, _ref2, _ref3, code, req, _require, Script, env, babel, script, scopeExports, scope, bustedTasks, task, json;

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
            _require = require('vm'

            // crude test to see if babel is needed
            ), Script = _require.Script;
            if (process.env.HARMONY_FLAG === 'true') {
              env = require('babel-preset-env');
              babel = require('babel-core'

              // compile with babel
              );
              code = babel.transform(code, {
                babelrc: false,
                presets: [[env, {
                  targets: {
                    node: 'current'
                  }
                }]]
              }).code;
            }

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
            }

            // clean global scope
            );delete global.scope;

            // figure out which tasks are bust
            state.tasks = state.tasks || {};
            bustedTasks = {};

            // only try checking for single tasks

            for (task in scope.module.exports) {
              if (scope.module.exports.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
                json = scope.module.exports[task].toJSON();


                if (!(json instanceof Array) && !(0, _deepEqual2.default)(json, state.tasks[task])) {
                  bustedTasks[task] = true;
                }
              }
            }

            // cache exports
            cache.val('_', [lmod, scope.module.exports]

            // return exports
            );return _context.abrupt('return', [false, bustedTasks, scope.module.exports]);

          case 28:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0IiwiYnVzdGVkVGFza3MiLCJ0YXNrIiwiaGFzT3duUHJvcGVydHkiLCJqc29uIiwidG9KU09OIiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBTUE7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7Ozs7Ozs7OzJjQVRBOzs7Ozs7O3VEQVdlLGlCQUFNQyxJQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFFUixPQUFPQSxJQUFQLEtBQWdCLFFBRlI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBR0wsSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBSEs7O0FBQUE7QUFBQTtBQUFBLG1CQU9RLGNBQUtELElBQUwsQ0FQUjs7QUFBQTtBQU9QRSxnQkFQTyxrQkFPb0JDLEtBUHBCOzs7QUFTYjtBQUNNQyxpQkFWTyxHQVVDLEVBVkQ7QUFBQSxvQkFXZ0JMLE1BQU1NLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBWGxDO0FBQUE7QUFXWEQsa0JBQU1GLElBWEs7QUFXQ0Usa0JBQU1FLEtBWFA7O0FBQUEsa0JBYVRGLE1BQU1GLElBQU4sS0FBZUEsSUFiTjtBQUFBO0FBQUE7QUFBQTs7QUFBQSw2Q0FjSixDQUFDLElBQUQsRUFBTyxFQUFQLEVBQVdFLE1BQU1FLEtBQWpCLENBZEk7O0FBQUE7QUFBQTtBQUFBLG1CQWtCSSxrQkFBU04sSUFBVCxFQUFlLE1BQWYsQ0FsQko7O0FBQUE7QUFrQlRPLGdCQWxCUztBQW9CUEMsZUFwQk8sR0FvQkRDLFFBQVEsY0FBUixDQXBCQztBQUFBLHVCQXFCTUEsUUFBUTs7QUFFM0I7QUFGbUIsYUFyQk4sRUFxQkxDLE1BckJLLFlBcUJMQSxNQXJCSztBQXdCYixnQkFBSUMsUUFBUUMsR0FBUixDQUFZQyxZQUFaLEtBQTZCLE1BQWpDLEVBQXlDO0FBQ2pDRCxpQkFEaUMsR0FDM0JILFFBQVEsa0JBQVIsQ0FEMkI7QUFFakNLLG1CQUZpQyxHQUV6QkwsUUFBUTs7QUFFdEI7QUFGYyxlQUZ5QjtBQUt2Q0YscUJBQU9PLE1BQU1DLFNBQU4sQ0FBZ0JSLElBQWhCLEVBQXNCO0FBQzNCUyx5QkFBUyxLQURrQjtBQUUzQkMseUJBQVMsQ0FDUCxDQUFDTCxHQUFELEVBQU07QUFDSk0sMkJBQVM7QUFDUEMsMEJBQU07QUFEQztBQURMLGlCQUFOLENBRE87QUFGa0IsZUFBdEIsRUFTSlosSUFUSDtBQVVEOztBQUVEO0FBQ01hLGtCQTFDTyxHQTBDRSxJQUFJVixNQUFKLDJFQUVUSCxJQUZTLCtGQUliO0FBQ0FjLHdCQUFVckIsSUFEVjtBQUVBc0IsNkJBQWU7QUFGZixhQUphLENBMUNGOztBQW1EYjs7QUFDTUMsd0JBcERPLEdBb0RRLEVBcERSLEVBcURQQyxLQXJETyxHQXFEQztBQUNOQyx1QkFBU0YsWUFESDtBQUVOZCx1QkFBU0QsSUFBSVIsSUFBSixDQUZIO0FBR04wQixzQkFBUTtBQUNORCx5QkFBU0Y7QUFESCxlQUhGOztBQU9OSSx5QkFBVyxtQkFBUTNCLElBQVIsQ0FQTDtBQVFONEIsMEJBQVk1Qjs7QUFHcEI7QUFYYyxhQXJERDtBQWlFYjZCLG1CQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosbUJBQU9VLGdCQUFQLENBQXdCO0FBQ3RCVCx3QkFBVXJCO0FBRFk7O0FBSXhCO0FBSkEsY0FLQSxPQUFPNkIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBcEIsa0JBQU1FLEtBQU4sR0FBY0YsTUFBTUUsS0FBTixJQUFlLEVBQTdCO0FBQ015Qix1QkE3RU8sR0E2RU8sRUE3RVA7O0FBK0ViOztBQUNBLGlCQUFTQyxJQUFULElBQWlCUixNQUFNRSxNQUFOLENBQWFELE9BQTlCLEVBQXVDO0FBQ3JDLGtCQUFJRCxNQUFNRSxNQUFOLENBQWFELE9BQWIsQ0FBcUJRLGNBQXJCLENBQW9DRCxJQUFwQyxLQUE2QzVCLE1BQU1FLEtBQU4sQ0FBWTJCLGNBQVosQ0FBMkJELElBQTNCLENBQWpELEVBQW1GO0FBQzNFRSxvQkFEMkUsR0FDcEVWLE1BQU1FLE1BQU4sQ0FBYUQsT0FBYixDQUFxQk8sSUFBckIsRUFBMkJHLE1BQTNCLEVBRG9FOzs7QUFHakYsb0JBQUksRUFBRUQsZ0JBQWdCRSxLQUFsQixLQUE0QixDQUFDLHlCQUFVRixJQUFWLEVBQWdCOUIsTUFBTUUsS0FBTixDQUFZMEIsSUFBWixDQUFoQixDQUFqQyxFQUFxRTtBQUNuRUQsOEJBQVlDLElBQVosSUFBb0IsSUFBcEI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7QUFDQWpDLGtCQUFNTSxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JILElBRGEsRUFFYnNCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQTs7QUFLZjtBQUxBLGNBM0ZhLGlDQWlHTixDQUFDLEtBQUQsRUFBUU0sV0FBUixFQUFxQlAsTUFBTUUsTUFBTixDQUFhRCxPQUFsQyxDQWpHTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tICcuLi9kZWVwLWVxdWFsJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgc3RhdFxuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHt9LCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIC8vIGxvYWQgZmlsZVxuICBsZXQgY29kZSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICBjb25zdCByZXEgPSByZXF1aXJlKCdyZXF1aXJlLWxpa2UnKVxuICBjb25zdCB7IFNjcmlwdCB9ID0gcmVxdWlyZSgndm0nKVxuXG4gIC8vIGNydWRlIHRlc3QgdG8gc2VlIGlmIGJhYmVsIGlzIG5lZWRlZFxuICBpZiAocHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID09PSAndHJ1ZScpIHtcbiAgICBjb25zdCBlbnYgPSByZXF1aXJlKCdiYWJlbC1wcmVzZXQtZW52JylcbiAgICBjb25zdCBiYWJlbCA9IHJlcXVpcmUoJ2JhYmVsLWNvcmUnKVxuXG4gICAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gICAgY29kZSA9IGJhYmVsLnRyYW5zZm9ybShjb2RlLCB7XG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIHByZXNldHM6IFtcbiAgICAgICAgW2Vudiwge1xuICAgICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIF1cbiAgICB9KS5jb2RlXG4gIH1cblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBmaWd1cmUgb3V0IHdoaWNoIHRhc2tzIGFyZSBidXN0XG4gIHN0YXRlLnRhc2tzID0gc3RhdGUudGFza3MgfHwge31cbiAgY29uc3QgYnVzdGVkVGFza3MgPSB7fVxuXG4gIC8vIG9ubHkgdHJ5IGNoZWNraW5nIGZvciBzaW5nbGUgdGFza3NcbiAgZm9yIChsZXQgdGFzayBpbiBzY29wZS5tb2R1bGUuZXhwb3J0cykge1xuICAgIGlmIChzY29wZS5tb2R1bGUuZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eSh0YXNrKSAmJiBzdGF0ZS50YXNrcy5oYXNPd25Qcm9wZXJ0eSh0YXNrKSkge1xuICAgICAgY29uc3QganNvbiA9IHNjb3BlLm1vZHVsZS5leHBvcnRzW3Rhc2tdLnRvSlNPTigpXG5cbiAgICAgIGlmICghKGpzb24gaW5zdGFuY2VvZiBBcnJheSkgJiYgIWRlZXBFcXVhbChqc29uLCBzdGF0ZS50YXNrc1t0YXNrXSkpIHtcbiAgICAgICAgYnVzdGVkVGFza3NbdGFza10gPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ18nLCBbXG4gICAgbG1vZCxcbiAgICBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICBdKVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIGJ1c3RlZFRhc2tzLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=