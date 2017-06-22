'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = async file => {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments');
  }

  // get file stat
  const lmod = +(await (0, _fs.stat)(file)).mtime;

  // try to load from cache
  const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

  if (state.lmod === lmod) {
    return [true, {}, state.tasks];
  }

  // load file
  let code = await (0, _fs.readFile)(file, 'utf8');

  const req = require('require-like');
  const { Script } = require('vm');

  // crude test to see if babel is needed
  if (process.env.HARMONY_FLAG === 'true') {
    const env = require('babel-preset-env');
    const babel = require('babel-core');

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
  const script = new Script(`(function (exports, require, module, __filename, __dirname) {
      ${code}
     }(scope.exports, scope.require, scope.module, scope.__filename, scope.__dirname))`, {
    filename: file,
    displayErrors: true
  });

  // setup mock scope
  const scopeExports = {},
        scope = {
    exports: scopeExports,
    require: req(file),
    module: {
      exports: scopeExports
    },

    __dirname: (0, _path.dirname)(file),
    __filename: file

    // expose to script
  };global.scope = scope;

  // run script
  script.runInThisContext({
    filename: file
  });

  // clean global scope
  delete global.scope;

  // figure out which tasks are bust
  state.tasks = state.tasks || {};
  const bustedTasks = {};

  // only try checking for single tasks
  for (let task in scope.module.exports) {
    if (scope.module.exports.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
      const json = scope.module.exports[task].toJSON();

      if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
        bustedTasks[task] = true;
      }
    }
  }

  // cache exports
  cache.val('_', [lmod, scope.module.exports]);

  // return exports
  return [false, bustedTasks, scope.module.exports];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0IiwiYnVzdGVkVGFza3MiLCJ0YXNrIiwiaGFzT3duUHJvcGVydHkiLCJqc29uIiwidG9KU09OIiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztBQUNBOztJQUFZQSxLOztBQUNaOztBQUNBOzs7O0FBVEE7Ozs7OztrQkFXZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDOztBQUVBO0FBQ0EsUUFBTUMsUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUYsSUFBUCxFQUFhRSxNQUFNQyxLQUFuQixJQUE0Qk4sTUFBTU8sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQsTUFBSUYsTUFBTUYsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPLEVBQVAsRUFBV0UsTUFBTUMsS0FBakIsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsTUFBSUUsT0FBTyxNQUFNLGtCQUFTUCxJQUFULEVBQWUsTUFBZixDQUFqQjs7QUFFQSxRQUFNUSxNQUFNQyxRQUFRLGNBQVIsQ0FBWjtBQUNBLFFBQU0sRUFBRUMsTUFBRixLQUFhRCxRQUFRLElBQVIsQ0FBbkI7O0FBRUE7QUFDQSxNQUFJRSxRQUFRQyxHQUFSLENBQVlDLFlBQVosS0FBNkIsTUFBakMsRUFBeUM7QUFDdkMsVUFBTUQsTUFBTUgsUUFBUSxrQkFBUixDQUFaO0FBQ0EsVUFBTUssUUFBUUwsUUFBUSxZQUFSLENBQWQ7O0FBRUE7QUFDQUYsV0FBT08sTUFBTUMsU0FBTixDQUFnQlIsSUFBaEIsRUFBc0I7QUFDM0JTLGVBQVMsS0FEa0I7QUFFM0JDLGVBQVMsQ0FDUCxDQUFDTCxHQUFELEVBQU07QUFDSk0saUJBQVM7QUFDUEMsZ0JBQU07QUFEQztBQURMLE9BQU4sQ0FETztBQUZrQixLQUF0QixFQVNKWixJQVRIO0FBVUQ7O0FBRUQ7QUFDQSxRQUFNYSxTQUFTLElBQUlWLE1BQUosQ0FDWjtRQUNHSCxJQUFLO3VGQUZJLEVBSWI7QUFDQWMsY0FBVXJCLElBRFY7QUFFQXNCLG1CQUFlO0FBRmYsR0FKYSxDQUFmOztBQVNBO0FBQ0EsUUFBTUMsZUFBZSxFQUFyQjtBQUFBLFFBQ01DLFFBQVE7QUFDTkMsYUFBU0YsWUFESDtBQUVOZCxhQUFTRCxJQUFJUixJQUFKLENBRkg7QUFHTjBCLFlBQVE7QUFDTkQsZUFBU0Y7QUFESCxLQUhGOztBQU9OSSxlQUFXLG1CQUFRM0IsSUFBUixDQVBMO0FBUU40QixnQkFBWTVCOztBQUdwQjtBQVhjLEdBRGQsQ0FhQTZCLE9BQU9MLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixTQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsY0FBVXJCO0FBRFksR0FBeEI7O0FBSUE7QUFDQSxTQUFPNkIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBcEIsUUFBTUMsS0FBTixHQUFjRCxNQUFNQyxLQUFOLElBQWUsRUFBN0I7QUFDQSxRQUFNMEIsY0FBYyxFQUFwQjs7QUFFQTtBQUNBLE9BQUssSUFBSUMsSUFBVCxJQUFpQlIsTUFBTUUsTUFBTixDQUFhRCxPQUE5QixFQUF1QztBQUNyQyxRQUFJRCxNQUFNRSxNQUFOLENBQWFELE9BQWIsQ0FBcUJRLGNBQXJCLENBQW9DRCxJQUFwQyxLQUE2QzVCLE1BQU1DLEtBQU4sQ0FBWTRCLGNBQVosQ0FBMkJELElBQTNCLENBQWpELEVBQW1GO0FBQ2pGLFlBQU1FLE9BQU9WLE1BQU1FLE1BQU4sQ0FBYUQsT0FBYixDQUFxQk8sSUFBckIsRUFBMkJHLE1BQTNCLEVBQWI7O0FBRUEsVUFBSSxFQUFFRCxnQkFBZ0JFLEtBQWxCLEtBQTRCLENBQUMsc0JBQVVGLElBQVYsRUFBZ0I5QixNQUFNQyxLQUFOLENBQVkyQixJQUFaLENBQWhCLENBQWpDLEVBQXFFO0FBQ25FRCxvQkFBWUMsSUFBWixJQUFvQixJQUFwQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBakMsUUFBTU8sR0FBTixDQUFVLEdBQVYsRUFBZSxDQUNiSixJQURhLEVBRWJzQixNQUFNRSxNQUFOLENBQWFELE9BRkEsQ0FBZjs7QUFLQTtBQUNBLFNBQU8sQ0FBQyxLQUFELEVBQVFNLFdBQVIsRUFBcUJQLE1BQU1FLE1BQU4sQ0FBYUQsT0FBbEMsQ0FBUDtBQUNELEMiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRlZXBFcXVhbCB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIHN0YXRcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCB7fSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBsb2FkIGZpbGVcbiAgbGV0IGNvZGUgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgY29uc3QgcmVxID0gcmVxdWlyZSgncmVxdWlyZS1saWtlJylcbiAgY29uc3QgeyBTY3JpcHQgfSA9IHJlcXVpcmUoJ3ZtJylcblxuICAvLyBjcnVkZSB0ZXN0IHRvIHNlZSBpZiBiYWJlbCBpcyBuZWVkZWRcbiAgaWYgKHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9PT0gJ3RydWUnKSB7XG4gICAgY29uc3QgZW52ID0gcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWVudicpXG4gICAgY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuICAgIC8vIGNvbXBpbGUgd2l0aCBiYWJlbFxuICAgIGNvZGUgPSBiYWJlbC50cmFuc2Zvcm0oY29kZSwge1xuICAgICAgYmFiZWxyYzogZmFsc2UsXG4gICAgICBwcmVzZXRzOiBbXG4gICAgICAgIFtlbnYsIHtcbiAgICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICBdXG4gICAgfSkuY29kZVxuICB9XG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gZmlndXJlIG91dCB3aGljaCB0YXNrcyBhcmUgYnVzdFxuICBzdGF0ZS50YXNrcyA9IHN0YXRlLnRhc2tzIHx8IHt9XG4gIGNvbnN0IGJ1c3RlZFRhc2tzID0ge31cblxuICAvLyBvbmx5IHRyeSBjaGVja2luZyBmb3Igc2luZ2xlIHRhc2tzXG4gIGZvciAobGV0IHRhc2sgaW4gc2NvcGUubW9kdWxlLmV4cG9ydHMpIHtcbiAgICBpZiAoc2NvcGUubW9kdWxlLmV4cG9ydHMuaGFzT3duUHJvcGVydHkodGFzaykgJiYgc3RhdGUudGFza3MuaGFzT3duUHJvcGVydHkodGFzaykpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBzY29wZS5tb2R1bGUuZXhwb3J0c1t0YXNrXS50b0pTT04oKVxuXG4gICAgICBpZiAoIShqc29uIGluc3RhbmNlb2YgQXJyYXkpICYmICFkZWVwRXF1YWwoanNvbiwgc3RhdGUudGFza3NbdGFza10pKSB7XG4gICAgICAgIGJ1c3RlZFRhc2tzW3Rhc2tdID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBidXN0ZWRUYXNrcywgc2NvcGUubW9kdWxlLmV4cG9ydHNdXG59XG4iXX0=