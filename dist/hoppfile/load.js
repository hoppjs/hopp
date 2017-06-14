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

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const babel = require('babel-core');

exports.default = async file => {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments');
  }

  // get file contents
  const lmod = +(await (0, _fs.stat)(file)).mtime;
  const data = await (0, _fs.readFile)(file, 'utf8'

  // try to load from cache
  );const state = cache.val('tree') || {};

  if (state.lmod === lmod) {
    return [true, state.tasks];
  }

  // compile with babel
  const { code } = babel.transform(data, {
    babelrc: false,
    presets: [[_babelPresetEnv2.default, {
      targets: {
        node: 'current'
      }
    }]]
  }

  // setup virtual script
  );const script = new _vm.Script(`(function (exports, require, module, __filename, __dirname) {
      ${code}
     }(scope.exports, scope.require, scope.module, scope.__filename, scope.__dirname))`, {
    filename: file,
    displayErrors: true
  });

  // setup mock scope
  const scopeExports = {},
        scope = {
    exports: scopeExports,
    require: (0, _requireLike2.default)(file),
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
  }

  // clean global scope
  );delete global.scope;

  // cache exports
  cache.val('tree', {
    lmod,
    tasks: scope.module.exports
  }

  // return exports
  );return [false, scope.module.exports];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiYmFiZWwiLCJyZXF1aXJlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiZGF0YSIsInN0YXRlIiwidmFsIiwidGFza3MiLCJjb2RlIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7OztBQVhBOzs7Ozs7QUFhQSxNQUFNQyxRQUFRQyxRQUFRLFlBQVIsQ0FBZDs7a0JBRWUsTUFBTUMsSUFBTixJQUFjO0FBQzNCO0FBQ0EsTUFBSyxPQUFPQSxJQUFQLEtBQWdCLFFBQXJCLEVBQWdDO0FBQzlCLFVBQU0sSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1DLE9BQU8sQ0FBQyxDQUFDLE1BQU0sY0FBS0YsSUFBTCxDQUFQLEVBQW1CRyxLQUFqQztBQUNBLFFBQU1DLE9BQU8sTUFBTSxrQkFBU0osSUFBVCxFQUFlOztBQUVsQztBQUZtQixHQUFuQixDQUdBLE1BQU1LLFFBQVFSLE1BQU1TLEdBQU4sQ0FBVSxNQUFWLEtBQXFCLEVBQW5DOztBQUVBLE1BQUlELE1BQU1ILElBQU4sS0FBZUEsSUFBbkIsRUFBeUI7QUFDdkIsV0FBTyxDQUFDLElBQUQsRUFBT0csTUFBTUUsS0FBYixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFNLEVBQUVDLElBQUYsS0FBV1YsTUFBTVcsU0FBTixDQUFnQkwsSUFBaEIsRUFBc0I7QUFDckNNLGFBQVMsS0FENEI7QUFFckNDLGFBQVMsQ0FDUCwyQkFBTTtBQUNKQyxlQUFTO0FBQ1BDLGNBQU07QUFEQztBQURMLEtBQU4sQ0FETztBQUY0Qjs7QUFXdkM7QUFYaUIsR0FBakIsQ0FZQSxNQUFNQyxTQUFTLGVBQ1o7UUFDR04sSUFBSzt1RkFGSSxFQUliO0FBQ0FPLGNBQVVmLElBRFY7QUFFQWdCLG1CQUFlO0FBRmYsR0FKYSxDQUFmOztBQVNBO0FBQ0EsUUFBTUMsZUFBZSxFQUFyQjtBQUFBLFFBQ01DLFFBQVE7QUFDTkMsYUFBU0YsWUFESDtBQUVObEIsYUFBUywyQkFBSUMsSUFBSixDQUZIO0FBR05vQixZQUFRO0FBQ05ELGVBQVNGO0FBREgsS0FIRjs7QUFPTkksZUFBVyxtQkFBUXJCLElBQVIsQ0FQTDtBQVFOc0IsZ0JBQVl0Qjs7QUFHcEI7QUFYYyxHQURkLENBYUF1QixPQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosU0FBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULGNBQVVmO0FBRFk7O0FBSXhCO0FBSkEsSUFLQSxPQUFPdUIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBckIsUUFBTVMsR0FBTixDQUFVLE1BQVYsRUFBa0I7QUFDaEJKLFFBRGdCO0FBRWhCSyxXQUFPVyxNQUFNRSxNQUFOLENBQWFEO0FBRko7O0FBS2xCO0FBTEEsSUFNQSxPQUFPLENBQUMsS0FBRCxFQUFRRCxNQUFNRSxNQUFOLENBQWFELE9BQXJCLENBQVA7QUFDRCxDIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgZW52IGZyb20gJ2JhYmVsLXByZXNldC1lbnYnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHJlcSBmcm9tICdyZXF1aXJlLWxpa2UnXG5pbXBvcnQgeyBTY3JpcHQgfSBmcm9tICd2bSdcblxuY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIGNvbnRlbnRzXG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IGNhY2hlLnZhbCgndHJlZScpIHx8IHt9XG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gIGNvbnN0IHsgY29kZSB9ID0gYmFiZWwudHJhbnNmb3JtKGRhdGEsIHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBwcmVzZXRzOiBbXG4gICAgICBbZW52LCB7XG4gICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICBdXG4gIH0pXG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ3RyZWUnLCB7XG4gICAgbG1vZCxcbiAgICB0YXNrczogc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgfSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=