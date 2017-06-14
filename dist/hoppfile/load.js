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
  const data = await (0, _fs.readFile)(file, 'utf8'

  // try to load from cache
  );const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

  // unpack time
  state.lmod = UN.toNumber(state.lmod);

  if (state.lmod === lmod) {
    return [true, state.tasks];
  }

  const env = require('babel-preset-env');
  const babel = require('babel-core');
  const req = require('require-like');
  const { Script } = require('vm'

  // compile with babel
  );const { code } = babel.transform(data, {
    babelrc: false,
    presets: [[env, {
      targets: {
        node: 'current'
      }
    }]]
  }

  // setup virtual script
  );const script = new Script(`(function (exports, require, module, __filename, __dirname) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiVU4iLCJmaWxlIiwiRXJyb3IiLCJsbW9kIiwibXRpbWUiLCJkYXRhIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsInRvTnVtYmVyIiwiZW52IiwicmVxdWlyZSIsImJhYmVsIiwicmVxIiwiU2NyaXB0IiwiY29kZSIsInRyYW5zZm9ybSIsImJhYmVscmMiLCJwcmVzZXRzIiwidGFyZ2V0cyIsIm5vZGUiLCJzY3JpcHQiLCJmaWxlbmFtZSIsImRpc3BsYXlFcnJvcnMiLCJzY29wZUV4cG9ydHMiLCJzY29wZSIsImV4cG9ydHMiLCJtb2R1bGUiLCJfX2Rpcm5hbWUiLCJfX2ZpbGVuYW1lIiwiZ2xvYmFsIiwicnVuSW5UaGlzQ29udGV4dCIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7QUFDQTs7SUFBWUMsRTs7OztBQVRaOzs7Ozs7a0JBV2UsTUFBTUMsSUFBTixJQUFjO0FBQzNCO0FBQ0EsTUFBSyxPQUFPQSxJQUFQLEtBQWdCLFFBQXJCLEVBQWdDO0FBQzlCLFVBQU0sSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1DLE9BQU8sQ0FBQyxDQUFDLE1BQU0sY0FBS0YsSUFBTCxDQUFQLEVBQW1CRyxLQUFqQztBQUNBLFFBQU1DLE9BQU8sTUFBTSxrQkFBU0osSUFBVCxFQUFlOztBQUVsQztBQUZtQixHQUFuQixDQUdBLE1BQU1LLFFBQVEsRUFBZCxDQUNDLENBQUNBLE1BQU1ILElBQVAsRUFBYUcsTUFBTUMsS0FBbkIsSUFBNEJSLE1BQU1TLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBQTlDOztBQUVEO0FBQ0FGLFFBQU1ILElBQU4sR0FBYUgsR0FBR1MsUUFBSCxDQUFZSCxNQUFNSCxJQUFsQixDQUFiOztBQUVBLE1BQUlHLE1BQU1ILElBQU4sS0FBZUEsSUFBbkIsRUFBeUI7QUFDdkIsV0FBTyxDQUFDLElBQUQsRUFBT0csTUFBTUMsS0FBYixDQUFQO0FBQ0Q7O0FBRUQsUUFBTUcsTUFBTUMsUUFBUSxrQkFBUixDQUFaO0FBQ0EsUUFBTUMsUUFBUUQsUUFBUSxZQUFSLENBQWQ7QUFDQSxRQUFNRSxNQUFNRixRQUFRLGNBQVIsQ0FBWjtBQUNBLFFBQU0sRUFBRUcsTUFBRixLQUFhSCxRQUFROztBQUUzQjtBQUZtQixHQUFuQixDQUdBLE1BQU0sRUFBRUksSUFBRixLQUFXSCxNQUFNSSxTQUFOLENBQWdCWCxJQUFoQixFQUFzQjtBQUNyQ1ksYUFBUyxLQUQ0QjtBQUVyQ0MsYUFBUyxDQUNQLENBQUNSLEdBQUQsRUFBTTtBQUNKUyxlQUFTO0FBQ1BDLGNBQU07QUFEQztBQURMLEtBQU4sQ0FETztBQUY0Qjs7QUFXdkM7QUFYaUIsR0FBakIsQ0FZQSxNQUFNQyxTQUFTLElBQUlQLE1BQUosQ0FDWjtRQUNHQyxJQUFLO3VGQUZJLEVBSWI7QUFDQU8sY0FBVXJCLElBRFY7QUFFQXNCLG1CQUFlO0FBRmYsR0FKYSxDQUFmOztBQVNBO0FBQ0EsUUFBTUMsZUFBZSxFQUFyQjtBQUFBLFFBQ01DLFFBQVE7QUFDTkMsYUFBU0YsWUFESDtBQUVOYixhQUFTRSxJQUFJWixJQUFKLENBRkg7QUFHTjBCLFlBQVE7QUFDTkQsZUFBU0Y7QUFESCxLQUhGOztBQU9OSSxlQUFXLG1CQUFRM0IsSUFBUixDQVBMO0FBUU40QixnQkFBWTVCOztBQUdwQjtBQVhjLEdBRGQsQ0FhQTZCLE9BQU9MLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixTQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsY0FBVXJCO0FBRFk7O0FBSXhCO0FBSkEsSUFLQSxPQUFPNkIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBMUIsUUFBTVMsR0FBTixDQUFVLEdBQVYsRUFBZSxDQUNiUixHQUFHZ0MsUUFBSCxDQUFZN0IsSUFBWixDQURhLEVBRWJzQixNQUFNRSxNQUFOLENBQWFELE9BRkE7O0FBS2Y7QUFMQSxJQU1BLE9BQU8sQ0FBQyxLQUFELEVBQVFELE1BQU1FLE1BQU4sQ0FBYUQsT0FBckIsQ0FBUDtBQUNELEMiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBVTiBmcm9tICcuLi91dGlscy91bmludW0nXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZpbGUgPT4ge1xuICAvLyBpZiBiYWQgYXJncyBkaWVcbiAgaWYgKCB0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGFyZ3VtZW50cycpXG4gIH1cblxuICAvLyBnZXQgZmlsZSBjb250ZW50c1xuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgLy8gdW5wYWNrIHRpbWVcbiAgc3RhdGUubG1vZCA9IFVOLnRvTnVtYmVyKHN0YXRlLmxtb2QpXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgY29uc3QgZW52ID0gcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWVudicpXG4gIGNvbnN0IGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpXG4gIGNvbnN0IHJlcSA9IHJlcXVpcmUoJ3JlcXVpcmUtbGlrZScpXG4gIGNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKCd2bScpXG5cbiAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gIGNvbnN0IHsgY29kZSB9ID0gYmFiZWwudHJhbnNmb3JtKGRhdGEsIHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBwcmVzZXRzOiBbXG4gICAgICBbZW52LCB7XG4gICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICBdXG4gIH0pXG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ18nLCBbXG4gICAgVU4udG9TdHJpbmcobG1vZCksXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=