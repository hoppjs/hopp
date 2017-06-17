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

  // get file contents
  const lmod = +(await (0, _fs.stat)(file)).mtime;
  let code = await (0, _fs.readFile)(file, 'utf8'

  // try to load from cache
  );const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

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
  cache.val('_', [lmod, scope.module.exports]

  // return exports
  );return [false, scope.module.exports];
}; /**
    * @file src/utils/load.js
    * @license MIT
    * @copyright 2017 Karim Alibhai.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiY29kZSIsInN0YXRlIiwidGFza3MiLCJ2YWwiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkxFR0FDWV9OT0RFIiwidGVzdCIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztrQkFFZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDO0FBQ0EsTUFBSUMsT0FBTyxNQUFNLGtCQUFTSixJQUFULEVBQWU7O0FBRWhDO0FBRmlCLEdBQWpCLENBR0EsTUFBTUssUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUgsSUFBUCxFQUFhRyxNQUFNQyxLQUFuQixJQUE0QlAsTUFBTVEsR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQsTUFBSUYsTUFBTUgsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPRyxNQUFNQyxLQUFiLENBQVA7QUFDRDs7QUFFRCxRQUFNRSxNQUFNQyxRQUFRLGNBQVIsQ0FBWjtBQUNBLFFBQU0sRUFBRUMsTUFBRixLQUFhRCxRQUFROztBQUUzQjtBQUZtQixHQUFuQixDQUdBLElBQUlFLFFBQVFDLEdBQVIsQ0FBWUMsV0FBWixJQUEyQixnQkFBZ0JDLElBQWhCLENBQXFCVixJQUFyQixDQUEvQixFQUEyRDtBQUN6RCxVQUFNUSxNQUFNSCxRQUFRLGtCQUFSLENBQVo7QUFDQSxVQUFNTSxRQUFRTixRQUFROztBQUV0QjtBQUZjLEtBQWQsQ0FHQUwsT0FBT1csTUFBTUMsU0FBTixDQUFnQlosSUFBaEIsRUFBc0I7QUFDM0JhLGVBQVMsS0FEa0I7QUFFM0JDLGVBQVMsQ0FDUCxDQUFDTixHQUFELEVBQU07QUFDSk8saUJBQVM7QUFDUEMsZ0JBQU07QUFEQztBQURMLE9BQU4sQ0FETztBQUZrQixLQUF0QixFQVNKaEIsSUFUSDtBQVVEOztBQUVEO0FBQ0EsUUFBTWlCLFNBQVMsSUFBSVgsTUFBSixDQUNaO1FBQ0dOLElBQUs7dUZBRkksRUFJYjtBQUNBa0IsY0FBVXRCLElBRFY7QUFFQXVCLG1CQUFlO0FBRmYsR0FKYSxDQUFmOztBQVNBO0FBQ0EsUUFBTUMsZUFBZSxFQUFyQjtBQUFBLFFBQ01DLFFBQVE7QUFDTkMsYUFBU0YsWUFESDtBQUVOZixhQUFTRCxJQUFJUixJQUFKLENBRkg7QUFHTjJCLFlBQVE7QUFDTkQsZUFBU0Y7QUFESCxLQUhGOztBQU9OSSxlQUFXLG1CQUFRNUIsSUFBUixDQVBMO0FBUU42QixnQkFBWTdCOztBQUdwQjtBQVhjLEdBRGQsQ0FhQThCLE9BQU9MLEtBQVAsR0FBZUEsS0FBZjs7QUFFQTtBQUNBSixTQUFPVSxnQkFBUCxDQUF3QjtBQUN0QlQsY0FBVXRCO0FBRFk7O0FBSXhCO0FBSkEsSUFLQSxPQUFPOEIsT0FBT0wsS0FBZDs7QUFFQTtBQUNBMUIsUUFBTVEsR0FBTixDQUFVLEdBQVYsRUFBZSxDQUNiTCxJQURhLEVBRWJ1QixNQUFNRSxNQUFOLENBQWFELE9BRkE7O0FBS2Y7QUFMQSxJQU1BLE9BQU8sQ0FBQyxLQUFELEVBQVFELE1BQU1FLE1BQU4sQ0FBYUQsT0FBckIsQ0FBUDtBQUNELEMsRUEzRkQiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZpbGUgPT4ge1xuICAvLyBpZiBiYWQgYXJncyBkaWVcbiAgaWYgKCB0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGFyZ3VtZW50cycpXG4gIH1cblxuICAvLyBnZXQgZmlsZSBjb250ZW50c1xuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuICBsZXQgY29kZSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIGNvbnN0IHJlcSA9IHJlcXVpcmUoJ3JlcXVpcmUtbGlrZScpXG4gIGNvbnN0IHsgU2NyaXB0IH0gPSByZXF1aXJlKCd2bScpXG5cbiAgLy8gY3J1ZGUgdGVzdCB0byBzZWUgaWYgYmFiZWwgaXMgbmVlZGVkXG4gIGlmIChwcm9jZXNzLmVudi5MRUdBQ1lfTk9ERSB8fCAvaW1wb3J0fGV4cG9ydC8udGVzdChjb2RlKSkge1xuICAgIGNvbnN0IGVudiA9IHJlcXVpcmUoJ2JhYmVsLXByZXNldC1lbnYnKVxuICAgIGNvbnN0IGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpXG5cbiAgICAvLyBjb21waWxlIHdpdGggYmFiZWxcbiAgICBjb2RlID0gYmFiZWwudHJhbnNmb3JtKGNvZGUsIHtcbiAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgcHJlc2V0czogW1xuICAgICAgICBbZW52LCB7XG4gICAgICAgICAgdGFyZ2V0czoge1xuICAgICAgICAgICAgbm9kZTogJ2N1cnJlbnQnXG4gICAgICAgICAgfVxuICAgICAgICB9XVxuICAgICAgXVxuICAgIH0pLmNvZGVcbiAgfVxuXG4gIC8vIHNldHVwIHZpcnR1YWwgc2NyaXB0XG4gIGNvbnN0IHNjcmlwdCA9IG5ldyBTY3JpcHQoXG4gICAgYChmdW5jdGlvbiAoZXhwb3J0cywgcmVxdWlyZSwgbW9kdWxlLCBfX2ZpbGVuYW1lLCBfX2Rpcm5hbWUpIHtcbiAgICAgICR7Y29kZX1cbiAgICAgfShzY29wZS5leHBvcnRzLCBzY29wZS5yZXF1aXJlLCBzY29wZS5tb2R1bGUsIHNjb3BlLl9fZmlsZW5hbWUsIHNjb3BlLl9fZGlybmFtZSkpYFxuICAsIHtcbiAgICBmaWxlbmFtZTogZmlsZSxcbiAgICBkaXNwbGF5RXJyb3JzOiB0cnVlXG4gIH0pXG5cbiAgLy8gc2V0dXAgbW9jayBzY29wZVxuICBjb25zdCBzY29wZUV4cG9ydHMgPSB7fVxuICAgICAgLCBzY29wZSA9IHtcbiAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHMsXG4gICAgICAgICAgcmVxdWlyZTogcmVxKGZpbGUpLFxuICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIF9fZGlybmFtZTogZGlybmFtZShmaWxlKSxcbiAgICAgICAgICBfX2ZpbGVuYW1lOiBmaWxlXG4gICAgICAgIH1cblxuICAvLyBleHBvc2UgdG8gc2NyaXB0XG4gIGdsb2JhbC5zY29wZSA9IHNjb3BlXG5cbiAgLy8gcnVuIHNjcmlwdFxuICBzY3JpcHQucnVuSW5UaGlzQ29udGV4dCh7XG4gICAgZmlsZW5hbWU6IGZpbGVcbiAgfSlcblxuICAvLyBjbGVhbiBnbG9iYWwgc2NvcGVcbiAgZGVsZXRlIGdsb2JhbC5zY29wZVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgc2NvcGUubW9kdWxlLmV4cG9ydHNcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn0iXX0=