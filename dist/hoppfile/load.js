'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

var _uninum = require('../utils/uninum');

var UN = _interopRequireWildcard(_uninum);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
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
  let code = await (0, _fs.readFile)(file, 'utf8'

  // try to load from cache
  );const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

  // unpack time
  state.lmod = UN.toNumber(state.lmod);

  if (state.lmod === lmod) {
    return [true, state.tasks];
  }

  const req = require('require-like');
  const { Script } = require('vm'

  // crude test to see if babel is needed
  );if (process.env.LEGACY_NODE || /import|export/.test(code)) {
    const env = require('babel-preset-env');
    const babel = require('babel-core'

    // compile with babel
    );code = babel.transform(code, {
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
  }

  // clean global scope
  );delete global.scope;

  // cache exports
  cache.val('_', [UN.toString(lmod), scope.module.exports]

  // return exports
  );return [false, scope.module.exports];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiVU4iLCJmaWxlIiwiRXJyb3IiLCJsbW9kIiwibXRpbWUiLCJjb2RlIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsInRvTnVtYmVyIiwicmVxIiwicmVxdWlyZSIsIlNjcmlwdCIsInByb2Nlc3MiLCJlbnYiLCJMRUdBQ1lfTk9ERSIsInRlc3QiLCJiYWJlbCIsInRyYW5zZm9ybSIsImJhYmVscmMiLCJwcmVzZXRzIiwidGFyZ2V0cyIsIm5vZGUiLCJzY3JpcHQiLCJmaWxlbmFtZSIsImRpc3BsYXlFcnJvcnMiLCJzY29wZUV4cG9ydHMiLCJzY29wZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7QUFDQTs7SUFBWUMsRTs7OztBQVRaOzs7Ozs7a0JBV2UsTUFBTUMsSUFBTixJQUFjO0FBQzNCO0FBQ0EsTUFBSyxPQUFPQSxJQUFQLEtBQWdCLFFBQXJCLEVBQWdDO0FBQzlCLFVBQU0sSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1DLE9BQU8sQ0FBQyxDQUFDLE1BQU0sY0FBS0YsSUFBTCxDQUFQLEVBQW1CRyxLQUFqQztBQUNBLE1BQUlDLE9BQU8sTUFBTSxrQkFBU0osSUFBVCxFQUFlOztBQUVoQztBQUZpQixHQUFqQixDQUdBLE1BQU1LLFFBQVEsRUFBZCxDQUNDLENBQUNBLE1BQU1ILElBQVAsRUFBYUcsTUFBTUMsS0FBbkIsSUFBNEJSLE1BQU1TLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBQTlDOztBQUVEO0FBQ0FGLFFBQU1ILElBQU4sR0FBYUgsR0FBR1MsUUFBSCxDQUFZSCxNQUFNSCxJQUFsQixDQUFiOztBQUVBLE1BQUlHLE1BQU1ILElBQU4sS0FBZUEsSUFBbkIsRUFBeUI7QUFDdkIsV0FBTyxDQUFDLElBQUQsRUFBT0csTUFBTUMsS0FBYixDQUFQO0FBQ0Q7O0FBRUQsUUFBTUcsTUFBTUMsUUFBUSxjQUFSLENBQVo7QUFDQSxRQUFNLEVBQUVDLE1BQUYsS0FBYUQsUUFBUTs7QUFFM0I7QUFGbUIsR0FBbkIsQ0FHQSxJQUFJRSxRQUFRQyxHQUFSLENBQVlDLFdBQVosSUFBMkIsZ0JBQWdCQyxJQUFoQixDQUFxQlgsSUFBckIsQ0FBL0IsRUFBMkQ7QUFDekQsVUFBTVMsTUFBTUgsUUFBUSxrQkFBUixDQUFaO0FBQ0EsVUFBTU0sUUFBUU4sUUFBUTs7QUFFdEI7QUFGYyxLQUFkLENBR0FOLE9BQU9ZLE1BQU1DLFNBQU4sQ0FBZ0JiLElBQWhCLEVBQXNCO0FBQzNCYyxlQUFTLEtBRGtCO0FBRTNCQyxlQUFTLENBQ1AsQ0FBQ04sR0FBRCxFQUFNO0FBQ0pPLGlCQUFTO0FBQ1BDLGdCQUFNO0FBREM7QUFETCxPQUFOLENBRE87QUFGa0IsS0FBdEIsRUFTSmpCLElBVEg7QUFVRDs7QUFFRDtBQUNBLFFBQU1rQixTQUFTLElBQUlYLE1BQUosQ0FDWjtRQUNHUCxJQUFLO3VGQUZJLEVBSWI7QUFDQW1CLGNBQVV2QixJQURWO0FBRUF3QixtQkFBZTtBQUZmLEdBSmEsQ0FBZjs7QUFTQTtBQUNBLFFBQU1DLGVBQWUsRUFBckI7QUFBQSxRQUNNQyxRQUFRO0FBQ05DLGFBQVNGLFlBREg7QUFFTmYsYUFBU0QsSUFBSVQsSUFBSixDQUZIO0FBR040QixZQUFRO0FBQ05ELGVBQVNGO0FBREgsS0FIRjs7QUFPTkksZUFBVyxtQkFBUTdCLElBQVIsQ0FQTDtBQVFOOEIsZ0JBQVk5Qjs7QUFHcEI7QUFYYyxHQURkLENBYUErQixPQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosU0FBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULGNBQVV2QjtBQURZOztBQUl4QjtBQUpBLElBS0EsT0FBTytCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQTVCLFFBQU1TLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYlIsR0FBR2tDLFFBQUgsQ0FBWS9CLElBQVosQ0FEYSxFQUVid0IsTUFBTUUsTUFBTixDQUFhRCxPQUZBOztBQUtmO0FBTEEsSUFNQSxPQUFPLENBQUMsS0FBRCxFQUFRRCxNQUFNRSxNQUFOLENBQWFELE9BQXJCLENBQVA7QUFDRCxDIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgVU4gZnJvbSAnLi4vdXRpbHMvdW5pbnVtJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgY29udGVudHNcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcbiAgbGV0IGNvZGUgPSBhd2FpdCByZWFkRmlsZShmaWxlLCAndXRmOCcpXG5cbiAgLy8gdHJ5IHRvIGxvYWQgZnJvbSBjYWNoZVxuICBjb25zdCBzdGF0ZSA9IHt9XG4gIDtbc3RhdGUubG1vZCwgc3RhdGUudGFza3NdID0gY2FjaGUudmFsKCdfJykgfHwgW11cblxuICAvLyB1bnBhY2sgdGltZVxuICBzdGF0ZS5sbW9kID0gVU4udG9OdW1iZXIoc3RhdGUubG1vZClcblxuICBpZiAoc3RhdGUubG1vZCA9PT0gbG1vZCkge1xuICAgIHJldHVybiBbdHJ1ZSwgc3RhdGUudGFza3NdXG4gIH1cblxuICBjb25zdCByZXEgPSByZXF1aXJlKCdyZXF1aXJlLWxpa2UnKVxuICBjb25zdCB7IFNjcmlwdCB9ID0gcmVxdWlyZSgndm0nKVxuXG4gIC8vIGNydWRlIHRlc3QgdG8gc2VlIGlmIGJhYmVsIGlzIG5lZWRlZFxuICBpZiAocHJvY2Vzcy5lbnYuTEVHQUNZX05PREUgfHwgL2ltcG9ydHxleHBvcnQvLnRlc3QoY29kZSkpIHtcbiAgICBjb25zdCBlbnYgPSByZXF1aXJlKCdiYWJlbC1wcmVzZXQtZW52JylcbiAgICBjb25zdCBiYWJlbCA9IHJlcXVpcmUoJ2JhYmVsLWNvcmUnKVxuXG4gICAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gICAgY29kZSA9IGJhYmVsLnRyYW5zZm9ybShjb2RlLCB7XG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIHByZXNldHM6IFtcbiAgICAgICAgW2Vudiwge1xuICAgICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIF1cbiAgICB9KS5jb2RlXG4gIH1cblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBVTi50b1N0cmluZyhsbW9kKSxcbiAgICBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICBdKVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIHNjb3BlLm1vZHVsZS5leHBvcnRzXVxufSJdfQ==