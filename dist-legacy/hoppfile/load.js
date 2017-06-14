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

var _babelCore = require('babel-core');

var _babelCore2 = _interopRequireDefault(_babelCore);

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
            _babel$transform = _babelCore2.default.transform(data, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiZGF0YSIsInN0YXRlIiwidmFsIiwidGFza3MiLCJ0cmFuc2Zvcm0iLCJiYWJlbHJjIiwicHJlc2V0cyIsInRhcmdldHMiLCJub2RlIiwiY29kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OzsyY0FaQTs7Ozs7Ozt1REFjZSxpQkFBTUMsSUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBRVIsT0FBT0EsSUFBUCxLQUFnQixRQUZSO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQUdMLElBQUlDLEtBQUosQ0FBVSxtQkFBVixDQUhLOztBQUFBO0FBQUE7QUFBQSxtQkFPUSxjQUFLRCxJQUFMLENBUFI7O0FBQUE7QUFPUEUsZ0JBUE8sa0JBT29CQyxLQVBwQjtBQUFBO0FBQUEsbUJBUU0sa0JBQVNILElBQVQsRUFBZTs7QUFFbEM7QUFGbUIsYUFSTjs7QUFBQTtBQVFQSSxnQkFSTztBQVdQQyxpQkFYTyxHQVdDTixNQUFNTyxHQUFOLENBQVUsTUFBVixLQUFxQixFQVh0Qjs7QUFBQSxrQkFhVEQsTUFBTUgsSUFBTixLQUFlQSxJQWJOO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWNKLENBQUMsSUFBRCxFQUFPRyxNQUFNRSxLQUFiLENBZEk7O0FBQUE7O0FBaUJiO0FBakJhLCtCQWtCSSxvQkFBTUMsU0FBTixDQUFnQkosSUFBaEIsRUFBc0I7QUFDckNLLHVCQUFTLEtBRDRCO0FBRXJDQyx1QkFBUyxDQUNQLDJCQUFNO0FBQ0pDLHlCQUFTO0FBQ1BDLHdCQUFNO0FBREM7QUFETCxlQUFOLENBRE87QUFGNEI7O0FBV3ZDO0FBWGlCLGFBbEJKLEVBa0JMQyxJQWxCSyxvQkFrQkxBLElBbEJLO0FBOEJQQyxrQkE5Qk8sR0E4QkUseUZBRVRELElBRlMsK0ZBSWI7QUFDQUUsd0JBQVVmLElBRFY7QUFFQWdCLDZCQUFlO0FBRmYsYUFKYSxDQTlCRjs7QUF1Q2I7O0FBQ01DLHdCQXhDTyxHQXdDUSxFQXhDUixFQXlDUEMsS0F6Q08sR0F5Q0M7QUFDTkMsdUJBQVNGLFlBREg7QUFFTkcsdUJBQVMsMkJBQUlwQixJQUFKLENBRkg7QUFHTnFCLHNCQUFRO0FBQ05GLHlCQUFTRjtBQURILGVBSEY7O0FBT05LLHlCQUFXLG1CQUFRdEIsSUFBUixDQVBMO0FBUU51QiwwQkFBWXZCOztBQUdwQjtBQVhjLGFBekNEO0FBcURid0IsbUJBQU9OLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixtQkFBT1csZ0JBQVAsQ0FBd0I7QUFDdEJWLHdCQUFVZjtBQURZOztBQUl4QjtBQUpBLGNBS0EsT0FBT3dCLE9BQU9OLEtBQWQ7O0FBRUE7QUFDQW5CLGtCQUFNTyxHQUFOLENBQVUsTUFBVixFQUFrQjtBQUNoQkosd0JBRGdCO0FBRWhCSyxxQkFBT1csTUFBTUcsTUFBTixDQUFhRjtBQUZKOztBQUtsQjtBQUxBLGNBaEVhLGlDQXNFTixDQUFDLEtBQUQsRUFBUUQsTUFBTUcsTUFBTixDQUFhRixPQUFyQixDQXRFTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgZW52IGZyb20gJ2JhYmVsLXByZXNldC1lbnYnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IGJhYmVsIGZyb20gJ2JhYmVsLWNvcmUnXG5pbXBvcnQgcmVxIGZyb20gJ3JlcXVpcmUtbGlrZSdcbmltcG9ydCB7IFNjcmlwdCB9IGZyb20gJ3ZtJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgY29udGVudHNcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0gY2FjaGUudmFsKCd0cmVlJykgfHwge31cblxuICBpZiAoc3RhdGUubG1vZCA9PT0gbG1vZCkge1xuICAgIHJldHVybiBbdHJ1ZSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgY29uc3QgeyBjb2RlIH0gPSBiYWJlbC50cmFuc2Zvcm0oZGF0YSwge1xuICAgIGJhYmVscmM6IGZhbHNlLFxuICAgIHByZXNldHM6IFtcbiAgICAgIFtlbnYsIHtcbiAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICB9XG4gICAgICB9XVxuICAgIF1cbiAgfSlcblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgndHJlZScsIHtcbiAgICBsbW9kLFxuICAgIHRhc2tzOiBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICB9KVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIHNjb3BlLm1vZHVsZS5leHBvcnRzXVxufSJdfQ==