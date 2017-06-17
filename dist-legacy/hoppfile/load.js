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
    var lmod, code, state, _ref2, _ref3, req, _require, Script, env, babel, script, scopeExports, scope;

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
            code = _context.sent;
            state = {};
            _ref2 = cache.val('_') || [];
            _ref3 = _slicedToArray(_ref2, 2);
            state.lmod = _ref3[0];
            state.tasks = _ref3[1];

            if (!(state.lmod === lmod)) {
              _context.next = 15;
              break;
            }

            return _context.abrupt('return', [true, state.tasks]);

          case 15:
            req = require('require-like');
            _require = require('vm'

            // crude test to see if babel is needed
            ), Script = _require.Script;
            if (process.env.LEGACY_NODE || /import|export/.test(code)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiY29kZSIsInN0YXRlIiwidmFsIiwidGFza3MiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkxFR0FDWV9OT0RFIiwidGVzdCIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQU1BOztBQUNBOztJQUFZQSxLOztBQUNaOzs7OzJjQVJBOzs7Ozs7O3VEQVVlLGlCQUFNQyxJQUFOO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFFUixPQUFPQSxJQUFQLEtBQWdCLFFBRlI7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBR0wsSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBSEs7O0FBQUE7QUFBQTtBQUFBLG1CQU9RLGNBQUtELElBQUwsQ0FQUjs7QUFBQTtBQU9QRSxnQkFQTyxrQkFPb0JDLEtBUHBCO0FBQUE7QUFBQSxtQkFRSSxrQkFBU0gsSUFBVCxFQUFlOztBQUVoQztBQUZpQixhQVJKOztBQUFBO0FBUVRJLGdCQVJTO0FBV1BDLGlCQVhPLEdBV0MsRUFYRDtBQUFBLG9CQVlnQk4sTUFBTU8sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFabEM7QUFBQTtBQVlYRCxrQkFBTUgsSUFaSztBQVlDRyxrQkFBTUUsS0FaUDs7QUFBQSxrQkFjVEYsTUFBTUgsSUFBTixLQUFlQSxJQWROO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWVKLENBQUMsSUFBRCxFQUFPRyxNQUFNRSxLQUFiLENBZkk7O0FBQUE7QUFrQlBDLGVBbEJPLEdBa0JEQyxRQUFRLGNBQVIsQ0FsQkM7QUFBQSx1QkFtQk1BLFFBQVE7O0FBRTNCO0FBRm1CLGFBbkJOLEVBbUJMQyxNQW5CSyxZQW1CTEEsTUFuQks7QUFzQmIsZ0JBQUlDLFFBQVFDLEdBQVIsQ0FBWUMsV0FBWixJQUEyQixnQkFBZ0JDLElBQWhCLENBQXFCVixJQUFyQixDQUEvQixFQUEyRDtBQUNuRFEsaUJBRG1ELEdBQzdDSCxRQUFRLGtCQUFSLENBRDZDO0FBRW5ETSxtQkFGbUQsR0FFM0NOLFFBQVE7O0FBRXRCO0FBRmMsZUFGMkM7QUFLekRMLHFCQUFPVyxNQUFNQyxTQUFOLENBQWdCWixJQUFoQixFQUFzQjtBQUMzQmEseUJBQVMsS0FEa0I7QUFFM0JDLHlCQUFTLENBQ1AsQ0FBQ04sR0FBRCxFQUFNO0FBQ0pPLDJCQUFTO0FBQ1BDLDBCQUFNO0FBREM7QUFETCxpQkFBTixDQURPO0FBRmtCLGVBQXRCLEVBU0poQixJQVRIO0FBVUQ7O0FBRUQ7QUFDTWlCLGtCQXhDTyxHQXdDRSxJQUFJWCxNQUFKLDJFQUVUTixJQUZTLCtGQUliO0FBQ0FrQix3QkFBVXRCLElBRFY7QUFFQXVCLDZCQUFlO0FBRmYsYUFKYSxDQXhDRjs7QUFpRGI7O0FBQ01DLHdCQWxETyxHQWtEUSxFQWxEUixFQW1EUEMsS0FuRE8sR0FtREM7QUFDTkMsdUJBQVNGLFlBREg7QUFFTmYsdUJBQVNELElBQUlSLElBQUosQ0FGSDtBQUdOMkIsc0JBQVE7QUFDTkQseUJBQVNGO0FBREgsZUFIRjs7QUFPTkkseUJBQVcsbUJBQVE1QixJQUFSLENBUEw7QUFRTjZCLDBCQUFZN0I7O0FBR3BCO0FBWGMsYUFuREQ7QUErRGI4QixtQkFBT0wsS0FBUCxHQUFlQSxLQUFmOztBQUVBO0FBQ0FKLG1CQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsd0JBQVV0QjtBQURZOztBQUl4QjtBQUpBLGNBS0EsT0FBTzhCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQTFCLGtCQUFNTyxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JKLElBRGEsRUFFYnVCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQTs7QUFLZjtBQUxBLGNBMUVhLGlDQWdGTixDQUFDLEtBQUQsRUFBUUQsTUFBTUUsTUFBTixDQUFhRCxPQUFyQixDQWhGTTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgY29udGVudHNcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcbiAgbGV0IGNvZGUgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IHt9XG4gIDtbc3RhdGUubG1vZCwgc3RhdGUudGFza3NdID0gY2FjaGUudmFsKCdfJykgfHwgW11cblxuICBpZiAoc3RhdGUubG1vZCA9PT0gbG1vZCkge1xuICAgIHJldHVybiBbdHJ1ZSwgc3RhdGUudGFza3NdXG4gIH1cblxuICBjb25zdCByZXEgPSByZXF1aXJlKCdyZXF1aXJlLWxpa2UnKVxuICBjb25zdCB7IFNjcmlwdCB9ID0gcmVxdWlyZSgndm0nKVxuXG4gIC8vIGNydWRlIHRlc3QgdG8gc2VlIGlmIGJhYmVsIGlzIG5lZWRlZFxuICBpZiAocHJvY2Vzcy5lbnYuTEVHQUNZX05PREUgfHwgL2ltcG9ydHxleHBvcnQvLnRlc3QoY29kZSkpIHtcbiAgICBjb25zdCBlbnYgPSByZXF1aXJlKCdiYWJlbC1wcmVzZXQtZW52JylcbiAgICBjb25zdCBiYWJlbCA9IHJlcXVpcmUoJ2JhYmVsLWNvcmUnKVxuXG4gICAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gICAgY29kZSA9IGJhYmVsLnRyYW5zZm9ybShjb2RlLCB7XG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIHByZXNldHM6IFtcbiAgICAgICAgW2Vudiwge1xuICAgICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIF1cbiAgICB9KS5jb2RlXG4gIH1cblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBsbW9kLFxuICAgIHNjb3BlLm1vZHVsZS5leHBvcnRzXG4gIF0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgc2NvcGUubW9kdWxlLmV4cG9ydHNdXG59Il19