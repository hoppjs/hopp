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
  const { code } = _babelCore2.default.transform(data, {
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
}; /**
    * @file src/utils/load.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiZGF0YSIsInN0YXRlIiwidmFsIiwidGFza3MiLCJjb2RlIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztrQkFFZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDO0FBQ0EsUUFBTUMsT0FBTyxNQUFNLGtCQUFTSixJQUFULEVBQWU7O0FBRWxDO0FBRm1CLEdBQW5CLENBR0EsTUFBTUssUUFBUU4sTUFBTU8sR0FBTixDQUFVLE1BQVYsS0FBcUIsRUFBbkM7O0FBRUEsTUFBSUQsTUFBTUgsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPRyxNQUFNRSxLQUFiLENBQVA7QUFDRDs7QUFFRDtBQUNBLFFBQU0sRUFBRUMsSUFBRixLQUFXLG9CQUFNQyxTQUFOLENBQWdCTCxJQUFoQixFQUFzQjtBQUNyQ00sYUFBUyxLQUQ0QjtBQUVyQ0MsYUFBUyxDQUNQLDJCQUFNO0FBQ0pDLGVBQVM7QUFDUEMsY0FBTTtBQURDO0FBREwsS0FBTixDQURPO0FBRjRCOztBQVd2QztBQVhpQixHQUFqQixDQVlBLE1BQU1DLFNBQVMsZUFDWjtRQUNHTixJQUFLO3VGQUZJLEVBSWI7QUFDQU8sY0FBVWYsSUFEVjtBQUVBZ0IsbUJBQWU7QUFGZixHQUphLENBQWY7O0FBU0E7QUFDQSxRQUFNQyxlQUFlLEVBQXJCO0FBQUEsUUFDTUMsUUFBUTtBQUNOQyxhQUFTRixZQURIO0FBRU5HLGFBQVMsMkJBQUlwQixJQUFKLENBRkg7QUFHTnFCLFlBQVE7QUFDTkYsZUFBU0Y7QUFESCxLQUhGOztBQU9OSyxlQUFXLG1CQUFRdEIsSUFBUixDQVBMO0FBUU51QixnQkFBWXZCOztBQUdwQjtBQVhjLEdBRGQsQ0FhQXdCLE9BQU9OLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixTQUFPVyxnQkFBUCxDQUF3QjtBQUN0QlYsY0FBVWY7QUFEWTs7QUFJeEI7QUFKQSxJQUtBLE9BQU93QixPQUFPTixLQUFkOztBQUVBO0FBQ0FuQixRQUFNTyxHQUFOLENBQVUsTUFBVixFQUFrQjtBQUNoQkosUUFEZ0I7QUFFaEJLLFdBQU9XLE1BQU1HLE1BQU4sQ0FBYUY7QUFGSjs7QUFLbEI7QUFMQSxJQU1BLE9BQU8sQ0FBQyxLQUFELEVBQVFELE1BQU1HLE1BQU4sQ0FBYUYsT0FBckIsQ0FBUDtBQUNELEMsRUFyRkQiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCBlbnYgZnJvbSAnYmFiZWwtcHJlc2V0LWVudidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgYmFiZWwgZnJvbSAnYmFiZWwtY29yZSdcbmltcG9ydCByZXEgZnJvbSAncmVxdWlyZS1saWtlJ1xuaW1wb3J0IHsgU2NyaXB0IH0gZnJvbSAndm0nXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZpbGUgPT4ge1xuICAvLyBpZiBiYWQgYXJncyBkaWVcbiAgaWYgKCB0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGFyZ3VtZW50cycpXG4gIH1cblxuICAvLyBnZXQgZmlsZSBjb250ZW50c1xuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSBjYWNoZS52YWwoJ3RyZWUnKSB8fCB7fVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIC8vIGNvbXBpbGUgd2l0aCBiYWJlbFxuICBjb25zdCB7IGNvZGUgfSA9IGJhYmVsLnRyYW5zZm9ybShkYXRhLCB7XG4gICAgYmFiZWxyYzogZmFsc2UsXG4gICAgcHJlc2V0czogW1xuICAgICAgW2Vudiwge1xuICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgXVxuICB9KVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCd0cmVlJywge1xuICAgIGxtb2QsXG4gICAgdGFza3M6IHNjb3BlLm1vZHVsZS5leHBvcnRzXG4gIH0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgc2NvcGUubW9kdWxlLmV4cG9ydHNdXG59Il19