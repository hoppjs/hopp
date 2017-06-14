'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('../fs');

var _babelPresetEnv = require('babel-preset-env');

var _babelPresetEnv2 = _interopRequireDefault(_babelPresetEnv);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

var _requireLike = require('require-like');

var _requireLike2 = _interopRequireDefault(_requireLike);

var _vm = require('vm');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var babel = require('babel-core');

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
    var lmod, data, state, _babel$transform, code, script, scopeExports, scope;

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
            _context.next = 7;
            return (0, _fs.readFile)(file, 'utf8'

            // try to load from cache
            );

          case 7:
            data = _context.sent;
            state = cache.val('tree') || {};

            if (!(state.lmod === lmod)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt('return', [true, state.tasks]);

          case 11:

            // compile with babel
            _babel$transform = babel.transform(data, {
              babelrc: false,
              presets: [[_babelPresetEnv2.default, {
                targets: {
                  node: 'current'
                }
              }]]
            }

            // setup virtual script
            ), code = _babel$transform.code;
            script = new _vm.Script('(function (exports, require, module, __filename, __dirname) {\n      ' + code + '\n     }(scope.exports, scope.require, scope.module, scope.__filename, scope.__dirname))', {
              filename: file,
              displayErrors: true
            });

            // setup mock scope

            scopeExports = {}, scope = {
              exports: scopeExports,
              require: (0, _requireLike2.default)(file),
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

            // cache exports
            cache.val('tree', {
              lmod: lmod,
              tasks: scope.module.exports
            }

            // return exports
            );return _context.abrupt('return', [false, scope.module.exports]);

          case 19:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiYmFiZWwiLCJyZXF1aXJlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiZGF0YSIsInN0YXRlIiwidmFsIiwidGFza3MiLCJ0cmFuc2Zvcm0iLCJiYWJlbHJjIiwicHJlc2V0cyIsInRhcmdldHMiLCJub2RlIiwiY29kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FYQTs7Ozs7O0FBYUEsSUFBTUMsUUFBUUMsUUFBUSxZQUFSLENBQWQ7Ozt1REFFZSxpQkFBTUMsSUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBRVIsT0FBT0EsSUFBUCxLQUFnQixRQUZSO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQUdMLElBQUlDLEtBQUosQ0FBVSxtQkFBVixDQUhLOztBQUFBO0FBQUE7QUFBQSxtQkFPUSxjQUFLRCxJQUFMLENBUFI7O0FBQUE7QUFPUEUsZ0JBUE8sa0JBT29CQyxLQVBwQjtBQUFBO0FBQUEsbUJBUU0sa0JBQVNILElBQVQsRUFBZTs7QUFFbEM7QUFGbUIsYUFSTjs7QUFBQTtBQVFQSSxnQkFSTztBQVdQQyxpQkFYTyxHQVdDUixNQUFNUyxHQUFOLENBQVUsTUFBVixLQUFxQixFQVh0Qjs7QUFBQSxrQkFhVEQsTUFBTUgsSUFBTixLQUFlQSxJQWJOO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWNKLENBQUMsSUFBRCxFQUFPRyxNQUFNRSxLQUFiLENBZEk7O0FBQUE7O0FBaUJiO0FBakJhLCtCQWtCSVQsTUFBTVUsU0FBTixDQUFnQkosSUFBaEIsRUFBc0I7QUFDckNLLHVCQUFTLEtBRDRCO0FBRXJDQyx1QkFBUyxDQUNQLDJCQUFNO0FBQ0pDLHlCQUFTO0FBQ1BDLHdCQUFNO0FBREM7QUFETCxlQUFOLENBRE87QUFGNEI7O0FBV3ZDO0FBWGlCLGFBbEJKLEVBa0JMQyxJQWxCSyxvQkFrQkxBLElBbEJLO0FBOEJQQyxrQkE5Qk8sR0E4QkUseUZBRVRELElBRlMsK0ZBSWI7QUFDQUUsd0JBQVVmLElBRFY7QUFFQWdCLDZCQUFlO0FBRmYsYUFKYSxDQTlCRjs7QUF1Q2I7O0FBQ01DLHdCQXhDTyxHQXdDUSxFQXhDUixFQXlDUEMsS0F6Q08sR0F5Q0M7QUFDTkMsdUJBQVNGLFlBREg7QUFFTmxCLHVCQUFTLDJCQUFJQyxJQUFKLENBRkg7QUFHTm9CLHNCQUFRO0FBQ05ELHlCQUFTRjtBQURILGVBSEY7O0FBT05JLHlCQUFXLG1CQUFRckIsSUFBUixDQVBMO0FBUU5zQiwwQkFBWXRCOztBQUdwQjtBQVhjLGFBekNEO0FBcURidUIsbUJBQU9MLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixtQkFBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULHdCQUFVZjtBQURZOztBQUl4QjtBQUpBLGNBS0EsT0FBT3VCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQXJCLGtCQUFNUyxHQUFOLENBQVUsTUFBVixFQUFrQjtBQUNoQkosd0JBRGdCO0FBRWhCSyxxQkFBT1csTUFBTUUsTUFBTixDQUFhRDtBQUZKOztBQUtsQjtBQUxBLGNBaEVhLGlDQXNFTixDQUFDLEtBQUQsRUFBUUQsTUFBTUUsTUFBTixDQUFhRCxPQUFyQixDQXRFTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgZW52IGZyb20gJ2JhYmVsLXByZXNldC1lbnYnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHJlcSBmcm9tICdyZXF1aXJlLWxpa2UnXG5pbXBvcnQgeyBTY3JpcHQgfSBmcm9tICd2bSdcblxuY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIGNvbnRlbnRzXG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IGNhY2hlLnZhbCgndHJlZScpIHx8IHt9XG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gIGNvbnN0IHsgY29kZSB9ID0gYmFiZWwudHJhbnNmb3JtKGRhdGEsIHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBwcmVzZXRzOiBbXG4gICAgICBbZW52LCB7XG4gICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICBdXG4gIH0pXG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ3RyZWUnLCB7XG4gICAgbG1vZCxcbiAgICB0YXNrczogc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgfSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=