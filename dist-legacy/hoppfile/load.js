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
            _require = require('vm'), Script = _require.Script;

            // crude test to see if babel is needed

            if (process.env.HARMONY_FLAG === 'true') {
              env = require('babel-preset-env');
              babel = require('babel-core');

              // compile with babel

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0IiwiYnVzdGVkVGFza3MiLCJ0YXNrIiwiaGFzT3duUHJvcGVydHkiLCJqc29uIiwidG9KU09OIiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBTUE7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7Ozs7MmNBVEE7Ozs7Ozs7dURBV2UsaUJBQU1DLElBQU47QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQUVSLE9BQU9BLElBQVAsS0FBZ0IsUUFGUjtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFHTCxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FISzs7QUFBQTtBQUFBO0FBQUEsbUJBT1EsY0FBS0QsSUFBTCxDQVBSOztBQUFBO0FBT1BFLGdCQVBPLGtCQU9vQkMsS0FQcEI7OztBQVNiO0FBQ01DLGlCQVZPLEdBVUMsRUFWRDtBQUFBLG9CQVdnQkwsTUFBTU0sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFYbEM7QUFBQTtBQVdYRCxrQkFBTUYsSUFYSztBQVdDRSxrQkFBTUUsS0FYUDs7QUFBQSxrQkFhVEYsTUFBTUYsSUFBTixLQUFlQSxJQWJOO0FBQUE7QUFBQTtBQUFBOztBQUFBLDZDQWNKLENBQUMsSUFBRCxFQUFPLEVBQVAsRUFBV0UsTUFBTUUsS0FBakIsQ0FkSTs7QUFBQTtBQUFBO0FBQUEsbUJBa0JJLGtCQUFTTixJQUFULEVBQWUsTUFBZixDQWxCSjs7QUFBQTtBQWtCVE8sZ0JBbEJTO0FBb0JQQyxlQXBCTyxHQW9CREMsUUFBUSxjQUFSLENBcEJDO0FBQUEsdUJBcUJNQSxRQUFRLElBQVIsQ0FyQk4sRUFxQkxDLE1BckJLLFlBcUJMQSxNQXJCSzs7QUF1QmI7O0FBQ0EsZ0JBQUlDLFFBQVFDLEdBQVIsQ0FBWUMsWUFBWixLQUE2QixNQUFqQyxFQUF5QztBQUNqQ0QsaUJBRGlDLEdBQzNCSCxRQUFRLGtCQUFSLENBRDJCO0FBRWpDSyxtQkFGaUMsR0FFekJMLFFBQVEsWUFBUixDQUZ5Qjs7QUFJdkM7O0FBQ0FGLHFCQUFPTyxNQUFNQyxTQUFOLENBQWdCUixJQUFoQixFQUFzQjtBQUMzQlMseUJBQVMsS0FEa0I7QUFFM0JDLHlCQUFTLENBQ1AsQ0FBQ0wsR0FBRCxFQUFNO0FBQ0pNLDJCQUFTO0FBQ1BDLDBCQUFNO0FBREM7QUFETCxpQkFBTixDQURPO0FBRmtCLGVBQXRCLEVBU0paLElBVEg7QUFVRDs7QUFFRDtBQUNNYSxrQkExQ08sR0EwQ0UsSUFBSVYsTUFBSiwyRUFFVEgsSUFGUywrRkFJYjtBQUNBYyx3QkFBVXJCLElBRFY7QUFFQXNCLDZCQUFlO0FBRmYsYUFKYSxDQTFDRjs7QUFtRGI7O0FBQ01DLHdCQXBETyxHQW9EUSxFQXBEUixFQXFEUEMsS0FyRE8sR0FxREM7QUFDTkMsdUJBQVNGLFlBREg7QUFFTmQsdUJBQVNELElBQUlSLElBQUosQ0FGSDtBQUdOMEIsc0JBQVE7QUFDTkQseUJBQVNGO0FBREgsZUFIRjs7QUFPTkkseUJBQVcsbUJBQVEzQixJQUFSLENBUEw7QUFRTjRCLDBCQUFZNUI7O0FBR3BCO0FBWGMsYUFyREQ7QUFpRWI2QixtQkFBT0wsS0FBUCxHQUFlQSxLQUFmOztBQUVBO0FBQ0FKLG1CQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsd0JBQVVyQjtBQURZLGFBQXhCOztBQUlBO0FBQ0EsbUJBQU82QixPQUFPTCxLQUFkOztBQUVBO0FBQ0FwQixrQkFBTUUsS0FBTixHQUFjRixNQUFNRSxLQUFOLElBQWUsRUFBN0I7QUFDTXlCLHVCQTdFTyxHQTZFTyxFQTdFUDs7QUErRWI7O0FBQ0EsaUJBQVNDLElBQVQsSUFBaUJSLE1BQU1FLE1BQU4sQ0FBYUQsT0FBOUIsRUFBdUM7QUFDckMsa0JBQUlELE1BQU1FLE1BQU4sQ0FBYUQsT0FBYixDQUFxQlEsY0FBckIsQ0FBb0NELElBQXBDLEtBQTZDNUIsTUFBTUUsS0FBTixDQUFZMkIsY0FBWixDQUEyQkQsSUFBM0IsQ0FBakQsRUFBbUY7QUFDM0VFLG9CQUQyRSxHQUNwRVYsTUFBTUUsTUFBTixDQUFhRCxPQUFiLENBQXFCTyxJQUFyQixFQUEyQkcsTUFBM0IsRUFEb0U7OztBQUdqRixvQkFBSSxFQUFFRCxnQkFBZ0JFLEtBQWxCLEtBQTRCLENBQUMsc0JBQVVGLElBQVYsRUFBZ0I5QixNQUFNRSxLQUFOLENBQVkwQixJQUFaLENBQWhCLENBQWpDLEVBQXFFO0FBQ25FRCw4QkFBWUMsSUFBWixJQUFvQixJQUFwQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBakMsa0JBQU1NLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYkgsSUFEYSxFQUVic0IsTUFBTUUsTUFBTixDQUFhRCxPQUZBLENBQWY7O0FBS0E7QUFoR2EsNkNBaUdOLENBQUMsS0FBRCxFQUFRTSxXQUFSLEVBQXFCUCxNQUFNRSxNQUFOLENBQWFELE9BQWxDLENBakdNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRlZXBFcXVhbCB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIHN0YXRcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCB7fSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBsb2FkIGZpbGVcbiAgbGV0IGNvZGUgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgY29uc3QgcmVxID0gcmVxdWlyZSgncmVxdWlyZS1saWtlJylcbiAgY29uc3QgeyBTY3JpcHQgfSA9IHJlcXVpcmUoJ3ZtJylcblxuICAvLyBjcnVkZSB0ZXN0IHRvIHNlZSBpZiBiYWJlbCBpcyBuZWVkZWRcbiAgaWYgKHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9PT0gJ3RydWUnKSB7XG4gICAgY29uc3QgZW52ID0gcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWVudicpXG4gICAgY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuICAgIC8vIGNvbXBpbGUgd2l0aCBiYWJlbFxuICAgIGNvZGUgPSBiYWJlbC50cmFuc2Zvcm0oY29kZSwge1xuICAgICAgYmFiZWxyYzogZmFsc2UsXG4gICAgICBwcmVzZXRzOiBbXG4gICAgICAgIFtlbnYsIHtcbiAgICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICBdXG4gICAgfSkuY29kZVxuICB9XG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gZmlndXJlIG91dCB3aGljaCB0YXNrcyBhcmUgYnVzdFxuICBzdGF0ZS50YXNrcyA9IHN0YXRlLnRhc2tzIHx8IHt9XG4gIGNvbnN0IGJ1c3RlZFRhc2tzID0ge31cblxuICAvLyBvbmx5IHRyeSBjaGVja2luZyBmb3Igc2luZ2xlIHRhc2tzXG4gIGZvciAobGV0IHRhc2sgaW4gc2NvcGUubW9kdWxlLmV4cG9ydHMpIHtcbiAgICBpZiAoc2NvcGUubW9kdWxlLmV4cG9ydHMuaGFzT3duUHJvcGVydHkodGFzaykgJiYgc3RhdGUudGFza3MuaGFzT3duUHJvcGVydHkodGFzaykpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBzY29wZS5tb2R1bGUuZXhwb3J0c1t0YXNrXS50b0pTT04oKVxuXG4gICAgICBpZiAoIShqc29uIGluc3RhbmNlb2YgQXJyYXkpICYmICFkZWVwRXF1YWwoanNvbiwgc3RhdGUudGFza3NbdGFza10pKSB7XG4gICAgICAgIGJ1c3RlZFRhc2tzW3Rhc2tdID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBidXN0ZWRUYXNrcywgc2NvcGUubW9kdWxlLmV4cG9ydHNdXG59XG4iXX0=