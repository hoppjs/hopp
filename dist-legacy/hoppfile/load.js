'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('../fs');

var _babelPresetEnv = require('babel-preset-env');

var _babelPresetEnv2 = _interopRequireDefault(_babelPresetEnv);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

var _requireLike = require('require-like');

var _requireLike2 = _interopRequireDefault(_requireLike);

var _vm = require('vm');

var _uninum = require('../utils/uninum');

var UN = _interopRequireWildcard(_uninum);

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
    var lmod, data, state, _ref2, _ref3, _babel$transform, code, script, scopeExports, scope;

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
            state = {};


            // unpack time
            _ref2 = cache.val('_') || [];
            _ref3 = _slicedToArray(_ref2, 2);
            state.lmod = _ref3[0];
            state.tasks = _ref3[1];
            state.lmod = UN.toNumber(state.lmod);

            if (!(state.lmod === lmod)) {
              _context.next = 16;
              break;
            }

            return _context.abrupt('return', [true, state.tasks]);

          case 16:

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
            cache.val('_', [UN.toString(lmod), scope.module.exports]

            // return exports
            );return _context.abrupt('return', [false, scope.module.exports]);

          case 24:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiVU4iLCJiYWJlbCIsInJlcXVpcmUiLCJmaWxlIiwiRXJyb3IiLCJsbW9kIiwibXRpbWUiLCJkYXRhIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsInRvTnVtYmVyIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsImNvZGUiLCJzY3JpcHQiLCJmaWxlbmFtZSIsImRpc3BsYXlFcnJvcnMiLCJzY29wZUV4cG9ydHMiLCJzY29wZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQU1BOztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUMsRTs7Ozs7OzJjQVpaOzs7Ozs7QUFjQSxJQUFNQyxRQUFRQyxRQUFRLFlBQVIsQ0FBZDs7O3VEQUVlLGlCQUFNQyxJQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFFUixPQUFPQSxJQUFQLEtBQWdCLFFBRlI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBR0wsSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBSEs7O0FBQUE7QUFBQTtBQUFBLG1CQU9RLGNBQUtELElBQUwsQ0FQUjs7QUFBQTtBQU9QRSxnQkFQTyxrQkFPb0JDLEtBUHBCO0FBQUE7QUFBQSxtQkFRTSxrQkFBU0gsSUFBVCxFQUFlOztBQUVsQztBQUZtQixhQVJOOztBQUFBO0FBUVBJLGdCQVJPO0FBV1BDLGlCQVhPLEdBV0MsRUFYRDs7O0FBY2I7QUFkYSxvQkFZZ0JULE1BQU1VLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBWmxDO0FBQUE7QUFZWEQsa0JBQU1ILElBWks7QUFZQ0csa0JBQU1FLEtBWlA7QUFlYkYsa0JBQU1ILElBQU4sR0FBYUwsR0FBR1csUUFBSCxDQUFZSCxNQUFNSCxJQUFsQixDQUFiOztBQWZhLGtCQWlCVEcsTUFBTUgsSUFBTixLQUFlQSxJQWpCTjtBQUFBO0FBQUE7QUFBQTs7QUFBQSw2Q0FrQkosQ0FBQyxJQUFELEVBQU9HLE1BQU1FLEtBQWIsQ0FsQkk7O0FBQUE7O0FBcUJiO0FBckJhLCtCQXNCSVQsTUFBTVcsU0FBTixDQUFnQkwsSUFBaEIsRUFBc0I7QUFDckNNLHVCQUFTLEtBRDRCO0FBRXJDQyx1QkFBUyxDQUNQLDJCQUFNO0FBQ0pDLHlCQUFTO0FBQ1BDLHdCQUFNO0FBREM7QUFETCxlQUFOLENBRE87QUFGNEI7O0FBV3ZDO0FBWGlCLGFBdEJKLEVBc0JMQyxJQXRCSyxvQkFzQkxBLElBdEJLO0FBa0NQQyxrQkFsQ08sR0FrQ0UseUZBRVRELElBRlMsK0ZBSWI7QUFDQUUsd0JBQVVoQixJQURWO0FBRUFpQiw2QkFBZTtBQUZmLGFBSmEsQ0FsQ0Y7O0FBMkNiOztBQUNNQyx3QkE1Q08sR0E0Q1EsRUE1Q1IsRUE2Q1BDLEtBN0NPLEdBNkNDO0FBQ05DLHVCQUFTRixZQURIO0FBRU5uQix1QkFBUywyQkFBSUMsSUFBSixDQUZIO0FBR05xQixzQkFBUTtBQUNORCx5QkFBU0Y7QUFESCxlQUhGOztBQU9OSSx5QkFBVyxtQkFBUXRCLElBQVIsQ0FQTDtBQVFOdUIsMEJBQVl2Qjs7QUFHcEI7QUFYYyxhQTdDRDtBQXlEYndCLG1CQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosbUJBQU9VLGdCQUFQLENBQXdCO0FBQ3RCVCx3QkFBVWhCO0FBRFk7O0FBSXhCO0FBSkEsY0FLQSxPQUFPd0IsT0FBT0wsS0FBZDs7QUFFQTtBQUNBdkIsa0JBQU1VLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYlQsR0FBRzZCLFFBQUgsQ0FBWXhCLElBQVosQ0FEYSxFQUViaUIsTUFBTUUsTUFBTixDQUFhRCxPQUZBOztBQUtmO0FBTEEsY0FwRWEsaUNBMEVOLENBQUMsS0FBRCxFQUFRRCxNQUFNRSxNQUFOLENBQWFELE9BQXJCLENBMUVNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCBlbnYgZnJvbSAnYmFiZWwtcHJlc2V0LWVudidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVxIGZyb20gJ3JlcXVpcmUtbGlrZSdcbmltcG9ydCB7IFNjcmlwdCB9IGZyb20gJ3ZtJ1xuaW1wb3J0ICogYXMgVU4gZnJvbSAnLi4vdXRpbHMvdW5pbnVtJ1xuXG5jb25zdCBiYWJlbCA9IHJlcXVpcmUoJ2JhYmVsLWNvcmUnKVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgY29udGVudHNcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIC8vIHVucGFjayB0aW1lXG4gIHN0YXRlLmxtb2QgPSBVTi50b051bWJlcihzdGF0ZS5sbW9kKVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIC8vIGNvbXBpbGUgd2l0aCBiYWJlbFxuICBjb25zdCB7IGNvZGUgfSA9IGJhYmVsLnRyYW5zZm9ybShkYXRhLCB7XG4gICAgYmFiZWxyYzogZmFsc2UsXG4gICAgcHJlc2V0czogW1xuICAgICAgW2Vudiwge1xuICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgXVxuICB9KVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIFVOLnRvU3RyaW5nKGxtb2QpLFxuICAgIHNjb3BlLm1vZHVsZS5leHBvcnRzXG4gIF0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgc2NvcGUubW9kdWxlLmV4cG9ydHNdXG59Il19