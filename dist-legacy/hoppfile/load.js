'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
    var lmod, state, _ref2, _ref3, code, req, _require, Script, env, babel, script, scopeExports, scope;

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

            return _context.abrupt('return', [true, state.tasks]);

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

            // cache exports
            cache.val('_', [lmod, scope.module.exports]

            // return exports
            );return _context.abrupt('return', [false, scope.module.exports]);

          case 25:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQU1BOztBQUNBOztJQUFZQSxLOztBQUNaOzs7OzJjQVJBOzs7Ozs7O3VEQVVlLGlCQUFNQyxJQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFFUixPQUFPQSxJQUFQLEtBQWdCLFFBRlI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBR0wsSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBSEs7O0FBQUE7QUFBQTtBQUFBLG1CQU9RLGNBQUtELElBQUwsQ0FQUjs7QUFBQTtBQU9QRSxnQkFQTyxrQkFPb0JDLEtBUHBCOzs7QUFTYjtBQUNNQyxpQkFWTyxHQVVDLEVBVkQ7QUFBQSxvQkFXZ0JMLE1BQU1NLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBWGxDO0FBQUE7QUFXWEQsa0JBQU1GLElBWEs7QUFXQ0Usa0JBQU1FLEtBWFA7O0FBQUEsa0JBYVRGLE1BQU1GLElBQU4sS0FBZUEsSUFiTjtBQUFBO0FBQUE7QUFBQTs7QUFBQSw2Q0FjSixDQUFDLElBQUQsRUFBT0UsTUFBTUUsS0FBYixDQWRJOztBQUFBO0FBQUE7QUFBQSxtQkFrQkksa0JBQVNOLElBQVQsRUFBZSxNQUFmLENBbEJKOztBQUFBO0FBa0JUTyxnQkFsQlM7QUFvQlBDLGVBcEJPLEdBb0JEQyxRQUFRLGNBQVIsQ0FwQkM7QUFBQSx1QkFxQk1BLFFBQVE7O0FBRTNCO0FBRm1CLGFBckJOLEVBcUJMQyxNQXJCSyxZQXFCTEEsTUFyQks7QUF3QmIsZ0JBQUlDLFFBQVFDLEdBQVIsQ0FBWUMsWUFBWixLQUE2QixNQUFqQyxFQUF5QztBQUNqQ0QsaUJBRGlDLEdBQzNCSCxRQUFRLGtCQUFSLENBRDJCO0FBRWpDSyxtQkFGaUMsR0FFekJMLFFBQVE7O0FBRXRCO0FBRmMsZUFGeUI7QUFLdkNGLHFCQUFPTyxNQUFNQyxTQUFOLENBQWdCUixJQUFoQixFQUFzQjtBQUMzQlMseUJBQVMsS0FEa0I7QUFFM0JDLHlCQUFTLENBQ1AsQ0FBQ0wsR0FBRCxFQUFNO0FBQ0pNLDJCQUFTO0FBQ1BDLDBCQUFNO0FBREM7QUFETCxpQkFBTixDQURPO0FBRmtCLGVBQXRCLEVBU0paLElBVEg7QUFVRDs7QUFFRDtBQUNNYSxrQkExQ08sR0EwQ0UsSUFBSVYsTUFBSiwyRUFFVEgsSUFGUywrRkFJYjtBQUNBYyx3QkFBVXJCLElBRFY7QUFFQXNCLDZCQUFlO0FBRmYsYUFKYSxDQTFDRjs7QUFtRGI7O0FBQ01DLHdCQXBETyxHQW9EUSxFQXBEUixFQXFEUEMsS0FyRE8sR0FxREM7QUFDTkMsdUJBQVNGLFlBREg7QUFFTmQsdUJBQVNELElBQUlSLElBQUosQ0FGSDtBQUdOMEIsc0JBQVE7QUFDTkQseUJBQVNGO0FBREgsZUFIRjs7QUFPTkkseUJBQVcsbUJBQVEzQixJQUFSLENBUEw7QUFRTjRCLDBCQUFZNUI7O0FBR3BCO0FBWGMsYUFyREQ7QUFpRWI2QixtQkFBT0wsS0FBUCxHQUFlQSxLQUFmOztBQUVBO0FBQ0FKLG1CQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsd0JBQVVyQjtBQURZOztBQUl4QjtBQUpBLGNBS0EsT0FBTzZCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQXpCLGtCQUFNTSxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JILElBRGEsRUFFYnNCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQTs7QUFLZjtBQUxBLGNBNUVhLGlDQWtGTixDQUFDLEtBQUQsRUFBUUQsTUFBTUUsTUFBTixDQUFhRCxPQUFyQixDQWxGTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgc3RhdFxuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgLy8gbG9hZCBmaWxlXG4gIGxldCBjb2RlID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIGNvbnN0IHJlcSA9IHJlcXVpcmUoJ3JlcXVpcmUtbGlrZScpXG4gIGNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKCd2bScpXG5cbiAgLy8gY3J1ZGUgdGVzdCB0byBzZWUgaWYgYmFiZWwgaXMgbmVlZGVkXG4gIGlmIChwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPT09ICd0cnVlJykge1xuICAgIGNvbnN0IGVudiA9IHJlcXVpcmUoJ2JhYmVsLXByZXNldC1lbnYnKVxuICAgIGNvbnN0IGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpXG5cbiAgICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgICBjb2RlID0gYmFiZWwudHJhbnNmb3JtKGNvZGUsIHtcbiAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgcHJlc2V0czogW1xuICAgICAgICBbZW52LCB7XG4gICAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgXVxuICAgIH0pLmNvZGVcbiAgfVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=