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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwiY29kZSIsInN0YXRlIiwidGFza3MiLCJ2YWwiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztrQkFFZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDO0FBQ0EsTUFBSUMsT0FBTyxNQUFNLGtCQUFTSixJQUFULEVBQWU7O0FBRWhDO0FBRmlCLEdBQWpCLENBR0EsTUFBTUssUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUgsSUFBUCxFQUFhRyxNQUFNQyxLQUFuQixJQUE0QlAsTUFBTVEsR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQsTUFBSUYsTUFBTUgsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPRyxNQUFNQyxLQUFiLENBQVA7QUFDRDs7QUFFRCxRQUFNRSxNQUFNQyxRQUFRLGNBQVIsQ0FBWjtBQUNBLFFBQU0sRUFBRUMsTUFBRixLQUFhRCxRQUFROztBQUUzQjtBQUZtQixHQUFuQixDQUdBLElBQUlFLFFBQVFDLEdBQVIsQ0FBWUMsWUFBWixLQUE2QixNQUFqQyxFQUF5QztBQUN2QyxVQUFNRCxNQUFNSCxRQUFRLGtCQUFSLENBQVo7QUFDQSxVQUFNSyxRQUFRTCxRQUFROztBQUV0QjtBQUZjLEtBQWQsQ0FHQUwsT0FBT1UsTUFBTUMsU0FBTixDQUFnQlgsSUFBaEIsRUFBc0I7QUFDM0JZLGVBQVMsS0FEa0I7QUFFM0JDLGVBQVMsQ0FDUCxDQUFDTCxHQUFELEVBQU07QUFDSk0saUJBQVM7QUFDUEMsZ0JBQU07QUFEQztBQURMLE9BQU4sQ0FETztBQUZrQixLQUF0QixFQVNKZixJQVRIO0FBVUQ7O0FBRUQ7QUFDQSxRQUFNZ0IsU0FBUyxJQUFJVixNQUFKLENBQ1o7UUFDR04sSUFBSzt1RkFGSSxFQUliO0FBQ0FpQixjQUFVckIsSUFEVjtBQUVBc0IsbUJBQWU7QUFGZixHQUphLENBQWY7O0FBU0E7QUFDQSxRQUFNQyxlQUFlLEVBQXJCO0FBQUEsUUFDTUMsUUFBUTtBQUNOQyxhQUFTRixZQURIO0FBRU5kLGFBQVNELElBQUlSLElBQUosQ0FGSDtBQUdOMEIsWUFBUTtBQUNORCxlQUFTRjtBQURILEtBSEY7O0FBT05JLGVBQVcsbUJBQVEzQixJQUFSLENBUEw7QUFRTjRCLGdCQUFZNUI7O0FBR3BCO0FBWGMsR0FEZCxDQWFBNkIsT0FBT0wsS0FBUCxHQUFlQSxLQUFmOztBQUVBO0FBQ0FKLFNBQU9VLGdCQUFQLENBQXdCO0FBQ3RCVCxjQUFVckI7QUFEWTs7QUFJeEI7QUFKQSxJQUtBLE9BQU82QixPQUFPTCxLQUFkOztBQUVBO0FBQ0F6QixRQUFNUSxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JMLElBRGEsRUFFYnNCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQTs7QUFLZjtBQUxBLElBTUEsT0FBTyxDQUFDLEtBQUQsRUFBUUQsTUFBTUUsTUFBTixDQUFhRCxPQUFyQixDQUFQO0FBQ0QsQyxFQTNGRCIsImZpbGUiOiJsb2FkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgeyBzdGF0LCByZWFkRmlsZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIGNvbnRlbnRzXG4gIGNvbnN0IGxtb2QgPSArKGF3YWl0IHN0YXQoZmlsZSkpLm10aW1lXG4gIGxldCBjb2RlID0gYXdhaXQgcmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHN0YXRlLnRhc2tzXVxuICB9XG5cbiAgY29uc3QgcmVxID0gcmVxdWlyZSgncmVxdWlyZS1saWtlJylcbiAgY29uc3QgeyBTY3JpcHQgfSA9IHJlcXVpcmUoJ3ZtJylcblxuICAvLyBjcnVkZSB0ZXN0IHRvIHNlZSBpZiBiYWJlbCBpcyBuZWVkZWRcbiAgaWYgKHByb2Nlc3MuZW52LkhBUk1PTllfRkxBRyA9PT0gJ3RydWUnKSB7XG4gICAgY29uc3QgZW52ID0gcmVxdWlyZSgnYmFiZWwtcHJlc2V0LWVudicpXG4gICAgY29uc3QgYmFiZWwgPSByZXF1aXJlKCdiYWJlbC1jb3JlJylcblxuICAgIC8vIGNvbXBpbGUgd2l0aCBiYWJlbFxuICAgIGNvZGUgPSBiYWJlbC50cmFuc2Zvcm0oY29kZSwge1xuICAgICAgYmFiZWxyYzogZmFsc2UsXG4gICAgICBwcmVzZXRzOiBbXG4gICAgICAgIFtlbnYsIHtcbiAgICAgICAgICB0YXJnZXRzOiB7XG4gICAgICAgICAgICBub2RlOiAnY3VycmVudCdcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICBdXG4gICAgfSkuY29kZVxuICB9XG5cbiAgLy8gc2V0dXAgdmlydHVhbCBzY3JpcHRcbiAgY29uc3Qgc2NyaXB0ID0gbmV3IFNjcmlwdChcbiAgICBgKGZ1bmN0aW9uIChleHBvcnRzLCByZXF1aXJlLCBtb2R1bGUsIF9fZmlsZW5hbWUsIF9fZGlybmFtZSkge1xuICAgICAgJHtjb2RlfVxuICAgICB9KHNjb3BlLmV4cG9ydHMsIHNjb3BlLnJlcXVpcmUsIHNjb3BlLm1vZHVsZSwgc2NvcGUuX19maWxlbmFtZSwgc2NvcGUuX19kaXJuYW1lKSlgXG4gICwge1xuICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgIGRpc3BsYXlFcnJvcnM6IHRydWVcbiAgfSlcblxuICAvLyBzZXR1cCBtb2NrIHNjb3BlXG4gIGNvbnN0IHNjb3BlRXhwb3J0cyA9IHt9XG4gICAgICAsIHNjb3BlID0ge1xuICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0cyxcbiAgICAgICAgICByZXF1aXJlOiByZXEoZmlsZSksXG4gICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBleHBvcnRzOiBzY29wZUV4cG9ydHNcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX19kaXJuYW1lOiBkaXJuYW1lKGZpbGUpLFxuICAgICAgICAgIF9fZmlsZW5hbWU6IGZpbGVcbiAgICAgICAgfVxuXG4gIC8vIGV4cG9zZSB0byBzY3JpcHRcbiAgZ2xvYmFsLnNjb3BlID0gc2NvcGVcblxuICAvLyBydW4gc2NyaXB0XG4gIHNjcmlwdC5ydW5JblRoaXNDb250ZXh0KHtcbiAgICBmaWxlbmFtZTogZmlsZVxuICB9KVxuXG4gIC8vIGNsZWFuIGdsb2JhbCBzY29wZVxuICBkZWxldGUgZ2xvYmFsLnNjb3BlXG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ18nLCBbXG4gICAgbG1vZCxcbiAgICBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICBdKVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIHNjb3BlLm1vZHVsZS5leHBvcnRzXVxufSJdfQ==