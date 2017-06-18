'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _path = require('path');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
    return [true, state.tasks];
  }

  // load file
  let code = await (0, _fs.readFile)(file, 'utf8');

  const req = require('require-like');
  const { Script } = require('vm'

  // crude test to see if babel is needed
  );if (process.env.HARMONY_FLAG === 'true') {
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
  cache.val('_', [lmod, scope.module.exports]

  // return exports
  );return [false, scope.module.exports];
}; /**
    * @file src/utils/load.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztrQkFFZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDOztBQUVBO0FBQ0EsUUFBTUMsUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUYsSUFBUCxFQUFhRSxNQUFNQyxLQUFuQixJQUE0Qk4sTUFBTU8sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQsTUFBSUYsTUFBTUYsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPRSxNQUFNQyxLQUFiLENBQVA7QUFDRDs7QUFFRDtBQUNBLE1BQUlFLE9BQU8sTUFBTSxrQkFBU1AsSUFBVCxFQUFlLE1BQWYsQ0FBakI7O0FBRUEsUUFBTVEsTUFBTUMsUUFBUSxjQUFSLENBQVo7QUFDQSxRQUFNLEVBQUVDLE1BQUYsS0FBYUQsUUFBUTs7QUFFM0I7QUFGbUIsR0FBbkIsQ0FHQSxJQUFJRSxRQUFRQyxHQUFSLENBQVlDLFlBQVosS0FBNkIsTUFBakMsRUFBeUM7QUFDdkMsVUFBTUQsTUFBTUgsUUFBUSxrQkFBUixDQUFaO0FBQ0EsVUFBTUssUUFBUUwsUUFBUTs7QUFFdEI7QUFGYyxLQUFkLENBR0FGLE9BQU9PLE1BQU1DLFNBQU4sQ0FBZ0JSLElBQWhCLEVBQXNCO0FBQzNCUyxlQUFTLEtBRGtCO0FBRTNCQyxlQUFTLENBQ1AsQ0FBQ0wsR0FBRCxFQUFNO0FBQ0pNLGlCQUFTO0FBQ1BDLGdCQUFNO0FBREM7QUFETCxPQUFOLENBRE87QUFGa0IsS0FBdEIsRUFTSlosSUFUSDtBQVVEOztBQUVEO0FBQ0EsUUFBTWEsU0FBUyxJQUFJVixNQUFKLENBQ1o7UUFDR0gsSUFBSzt1RkFGSSxFQUliO0FBQ0FjLGNBQVVyQixJQURWO0FBRUFzQixtQkFBZTtBQUZmLEdBSmEsQ0FBZjs7QUFTQTtBQUNBLFFBQU1DLGVBQWUsRUFBckI7QUFBQSxRQUNNQyxRQUFRO0FBQ05DLGFBQVNGLFlBREg7QUFFTmQsYUFBU0QsSUFBSVIsSUFBSixDQUZIO0FBR04wQixZQUFRO0FBQ05ELGVBQVNGO0FBREgsS0FIRjs7QUFPTkksZUFBVyxtQkFBUTNCLElBQVIsQ0FQTDtBQVFONEIsZ0JBQVk1Qjs7QUFHcEI7QUFYYyxHQURkLENBYUE2QixPQUFPTCxLQUFQLEdBQWVBLEtBQWY7O0FBRUE7QUFDQUosU0FBT1UsZ0JBQVAsQ0FBd0I7QUFDdEJULGNBQVVyQjtBQURZOztBQUl4QjtBQUpBLElBS0EsT0FBTzZCLE9BQU9MLEtBQWQ7O0FBRUE7QUFDQXpCLFFBQU1PLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYkosSUFEYSxFQUVic0IsTUFBTUUsTUFBTixDQUFhRCxPQUZBOztBQUtmO0FBTEEsSUFNQSxPQUFPLENBQUMsS0FBRCxFQUFRRCxNQUFNRSxNQUFOLENBQWFELE9BQXJCLENBQVA7QUFDRCxDLEVBN0ZEIiwiZmlsZSI6ImxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy91dGlscy9sb2FkLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCB7IHN0YXQsIHJlYWRGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgc3RhdFxuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgLy8gbG9hZCBmaWxlXG4gIGxldCBjb2RlID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIGNvbnN0IHJlcSA9IHJlcXVpcmUoJ3JlcXVpcmUtbGlrZScpXG4gIGNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKCd2bScpXG5cbiAgLy8gY3J1ZGUgdGVzdCB0byBzZWUgaWYgYmFiZWwgaXMgbmVlZGVkXG4gIGlmIChwcm9jZXNzLmVudi5IQVJNT05ZX0ZMQUcgPT09ICd0cnVlJykge1xuICAgIGNvbnN0IGVudiA9IHJlcXVpcmUoJ2JhYmVsLXByZXNldC1lbnYnKVxuICAgIGNvbnN0IGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpXG5cbiAgICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgICBjb2RlID0gYmFiZWwudHJhbnNmb3JtKGNvZGUsIHtcbiAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgcHJlc2V0czogW1xuICAgICAgICBbZW52LCB7XG4gICAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgXVxuICAgIH0pLmNvZGVcbiAgfVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=