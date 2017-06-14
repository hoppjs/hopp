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

var _uninum = require('../utils/uninum');

var UN = _interopRequireWildcard(_uninum);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const babel = require('babel-core'); /**
                                      * @file src/utils/load.js
                                      * @license MIT
                                      * @copyright 2017 Karim Alibhai.
                                      */

exports.default = async file => {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments');
  }

  // get file contents
  const lmod = +(await (0, _fs.stat)(file)).mtime;
  const data = await (0, _fs.readFile)(file, 'utf8'

  // try to load from cache
  );const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

  // unpack time
  state.lmod = UN.toNumber(state.lmod);

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
  cache.val('_', [UN.toString(lmod), scope.module.exports]

  // return exports
  );return [false, scope.module.exports];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiVU4iLCJiYWJlbCIsInJlcXVpcmUiLCJmaWxlIiwiRXJyb3IiLCJsbW9kIiwibXRpbWUiLCJkYXRhIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsInRvTnVtYmVyIiwiY29kZSIsInRyYW5zZm9ybSIsImJhYmVscmMiLCJwcmVzZXRzIiwidGFyZ2V0cyIsIm5vZGUiLCJzY3JpcHQiLCJmaWxlbmFtZSIsImRpc3BsYXlFcnJvcnMiLCJzY29wZUV4cG9ydHMiLCJzY29wZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0lBQVlDLEU7Ozs7OztBQUVaLE1BQU1DLFFBQVFDLFFBQVEsWUFBUixDQUFkLEMsQ0FkQTs7Ozs7O2tCQWdCZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDO0FBQ0EsUUFBTUMsT0FBTyxNQUFNLGtCQUFTSixJQUFULEVBQWU7O0FBRWxDO0FBRm1CLEdBQW5CLENBR0EsTUFBTUssUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUgsSUFBUCxFQUFhRyxNQUFNQyxLQUFuQixJQUE0QlYsTUFBTVcsR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQ7QUFDQUYsUUFBTUgsSUFBTixHQUFhTCxHQUFHVyxRQUFILENBQVlILE1BQU1ILElBQWxCLENBQWI7O0FBRUEsTUFBSUcsTUFBTUgsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPRyxNQUFNQyxLQUFiLENBQVA7QUFDRDs7QUFFRDtBQUNBLFFBQU0sRUFBRUcsSUFBRixLQUFXWCxNQUFNWSxTQUFOLENBQWdCTixJQUFoQixFQUFzQjtBQUNyQ08sYUFBUyxLQUQ0QjtBQUVyQ0MsYUFBUyxDQUNQLDJCQUFNO0FBQ0pDLGVBQVM7QUFDUEMsY0FBTTtBQURDO0FBREwsS0FBTixDQURPO0FBRjRCOztBQVd2QztBQVhpQixHQUFqQixDQVlBLE1BQU1DLFNBQVMsZUFDWjtRQUNHTixJQUFLO3VGQUZJLEVBSWI7QUFDQU8sY0FBVWhCLElBRFY7QUFFQWlCLG1CQUFlO0FBRmYsR0FKYSxDQUFmOztBQVNBO0FBQ0EsUUFBTUMsZUFBZSxFQUFyQjtBQUFBLFFBQ01DLFFBQVE7QUFDTkMsYUFBU0YsWUFESDtBQUVObkIsYUFBUywyQkFBSUMsSUFBSixDQUZIO0FBR05xQixZQUFRO0FBQ05ELGVBQVNGO0FBREgsS0FIRjs7QUFPTkksZUFBVyxtQkFBUXRCLElBQVIsQ0FQTDtBQVFOdUIsZ0JBQVl2Qjs7QUFHcEI7QUFYYyxHQURkLENBYUF3QixPQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosU0FBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULGNBQVVoQjtBQURZOztBQUl4QjtBQUpBLElBS0EsT0FBT3dCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQXZCLFFBQU1XLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYlYsR0FBRzZCLFFBQUgsQ0FBWXhCLElBQVosQ0FEYSxFQUViaUIsTUFBTUUsTUFBTixDQUFhRCxPQUZBOztBQUtmO0FBTEEsSUFNQSxPQUFPLENBQUMsS0FBRCxFQUFRRCxNQUFNRSxNQUFOLENBQWFELE9BQXJCLENBQVA7QUFDRCxDIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgZW52IGZyb20gJ2JhYmVsLXByZXNldC1lbnYnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHJlcSBmcm9tICdyZXF1aXJlLWxpa2UnXG5pbXBvcnQgeyBTY3JpcHQgfSBmcm9tICd2bSdcbmltcG9ydCAqIGFzIFVOIGZyb20gJy4uL3V0aWxzL3VuaW51bSdcblxuY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIGNvbnRlbnRzXG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IHt9XG4gIDtbc3RhdGUubG1vZCwgc3RhdGUudGFza3NdID0gY2FjaGUudmFsKCdfJykgfHwgW11cblxuICAvLyB1bnBhY2sgdGltZVxuICBzdGF0ZS5sbW9kID0gVU4udG9OdW1iZXIoc3RhdGUubG1vZClcblxuICBpZiAoc3RhdGUubG1vZCA9PT0gbG1vZCkge1xuICAgIHJldHVybiBbdHJ1ZSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgY29uc3QgeyBjb2RlIH0gPSBiYWJlbC50cmFuc2Zvcm0oZGF0YSwge1xuICAgIGJhYmVscmM6IGZhbHNlLFxuICAgIHByZXNldHM6IFtcbiAgICAgIFtlbnYsIHtcbiAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICB9XG4gICAgICB9XVxuICAgIF1cbiAgfSlcblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBVTi50b1N0cmluZyhsbW9kKSxcbiAgICBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICBdKVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIHNjb3BlLm1vZHVsZS5leHBvcnRzXVxufSJdfQ==