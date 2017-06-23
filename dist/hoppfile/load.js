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
    let babel, env;

    try {
      babel = require('babel-core');
      env = require('babel-preset-env');
    } catch (err) {
      throw new Error('Please install babel-core locally to use the harmony flag.');
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsImNvZGUiLCJyZXEiLCJyZXF1aXJlIiwiU2NyaXB0IiwicHJvY2VzcyIsImVudiIsIkhBUk1PTllfRkxBRyIsImJhYmVsIiwiZXJyIiwidHJhbnNmb3JtIiwiYmFiZWxyYyIsInByZXNldHMiLCJ0YXJnZXRzIiwibm9kZSIsInNjcmlwdCIsImZpbGVuYW1lIiwiZGlzcGxheUVycm9ycyIsInNjb3BlRXhwb3J0cyIsInNjb3BlIiwiZXhwb3J0cyIsIm1vZHVsZSIsIl9fZGlybmFtZSIsIl9fZmlsZW5hbWUiLCJnbG9iYWwiLCJydW5JblRoaXNDb250ZXh0IiwiYnVzdGVkVGFza3MiLCJ0YXNrIiwiaGFzT3duUHJvcGVydHkiLCJqc29uIiwidG9KU09OIiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BOztBQUNBOztJQUFZQSxLOztBQUNaOztBQUNBOzs7O0FBVEE7Ozs7OztrQkFXZSxNQUFNQyxJQUFOLElBQWM7QUFDM0I7QUFDQSxNQUFLLE9BQU9BLElBQVAsS0FBZ0IsUUFBckIsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJQyxLQUFKLENBQVUsbUJBQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsUUFBTUMsT0FBTyxDQUFDLENBQUMsTUFBTSxjQUFLRixJQUFMLENBQVAsRUFBbUJHLEtBQWpDOztBQUVBO0FBQ0EsUUFBTUMsUUFBUSxFQUFkLENBQ0MsQ0FBQ0EsTUFBTUYsSUFBUCxFQUFhRSxNQUFNQyxLQUFuQixJQUE0Qk4sTUFBTU8sR0FBTixDQUFVLEdBQVYsS0FBa0IsRUFBOUM7O0FBRUQsTUFBSUYsTUFBTUYsSUFBTixLQUFlQSxJQUFuQixFQUF5QjtBQUN2QixXQUFPLENBQUMsSUFBRCxFQUFPLEVBQVAsRUFBV0UsTUFBTUMsS0FBakIsQ0FBUDtBQUNEOztBQUVEO0FBQ0EsTUFBSUUsT0FBTyxNQUFNLGtCQUFTUCxJQUFULEVBQWUsTUFBZixDQUFqQjs7QUFFQSxRQUFNUSxNQUFNQyxRQUFRLGNBQVIsQ0FBWjtBQUNBLFFBQU0sRUFBRUMsTUFBRixLQUFhRCxRQUFRLElBQVIsQ0FBbkI7O0FBRUE7QUFDQSxNQUFJRSxRQUFRQyxHQUFSLENBQVlDLFlBQVosS0FBNkIsTUFBakMsRUFBeUM7QUFDdkMsUUFBSUMsS0FBSixFQUFXRixHQUFYOztBQUVBLFFBQUk7QUFDRkUsY0FBUUwsUUFBUSxZQUFSLENBQVI7QUFDQUcsWUFBTUgsUUFBUSxrQkFBUixDQUFOO0FBQ0QsS0FIRCxDQUdFLE9BQU9NLEdBQVAsRUFBWTtBQUNaLFlBQU0sSUFBSWQsS0FBSixDQUFVLDREQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBTSxXQUFPTyxNQUFNRSxTQUFOLENBQWdCVCxJQUFoQixFQUFzQjtBQUMzQlUsZUFBUyxLQURrQjtBQUUzQkMsZUFBUyxDQUNQLENBQUNOLEdBQUQsRUFBTTtBQUNKTyxpQkFBUztBQUNQQyxnQkFBTTtBQURDO0FBREwsT0FBTixDQURPO0FBRmtCLEtBQXRCLEVBU0piLElBVEg7QUFVRDs7QUFFRDtBQUNBLFFBQU1jLFNBQVMsSUFBSVgsTUFBSixDQUNaO1FBQ0dILElBQUs7dUZBRkksRUFJYjtBQUNBZSxjQUFVdEIsSUFEVjtBQUVBdUIsbUJBQWU7QUFGZixHQUphLENBQWY7O0FBU0E7QUFDQSxRQUFNQyxlQUFlLEVBQXJCO0FBQUEsUUFDTUMsUUFBUTtBQUNOQyxhQUFTRixZQURIO0FBRU5mLGFBQVNELElBQUlSLElBQUosQ0FGSDtBQUdOMkIsWUFBUTtBQUNORCxlQUFTRjtBQURILEtBSEY7O0FBT05JLGVBQVcsbUJBQVE1QixJQUFSLENBUEw7QUFRTjZCLGdCQUFZN0I7O0FBR3BCO0FBWGMsR0FEZCxDQWFBOEIsT0FBT0wsS0FBUCxHQUFlQSxLQUFmOztBQUVBO0FBQ0FKLFNBQU9VLGdCQUFQLENBQXdCO0FBQ3RCVCxjQUFVdEI7QUFEWSxHQUF4Qjs7QUFJQTtBQUNBLFNBQU84QixPQUFPTCxLQUFkOztBQUVBO0FBQ0FyQixRQUFNQyxLQUFOLEdBQWNELE1BQU1DLEtBQU4sSUFBZSxFQUE3QjtBQUNBLFFBQU0yQixjQUFjLEVBQXBCOztBQUVBO0FBQ0EsT0FBSyxJQUFJQyxJQUFULElBQWlCUixNQUFNRSxNQUFOLENBQWFELE9BQTlCLEVBQXVDO0FBQ3JDLFFBQUlELE1BQU1FLE1BQU4sQ0FBYUQsT0FBYixDQUFxQlEsY0FBckIsQ0FBb0NELElBQXBDLEtBQTZDN0IsTUFBTUMsS0FBTixDQUFZNkIsY0FBWixDQUEyQkQsSUFBM0IsQ0FBakQsRUFBbUY7QUFDakYsWUFBTUUsT0FBT1YsTUFBTUUsTUFBTixDQUFhRCxPQUFiLENBQXFCTyxJQUFyQixFQUEyQkcsTUFBM0IsRUFBYjs7QUFFQSxVQUFJLEVBQUVELGdCQUFnQkUsS0FBbEIsS0FBNEIsQ0FBQyxzQkFBVUYsSUFBVixFQUFnQi9CLE1BQU1DLEtBQU4sQ0FBWTRCLElBQVosQ0FBaEIsQ0FBakMsRUFBcUU7QUFDbkVELG9CQUFZQyxJQUFaLElBQW9CLElBQXBCO0FBQ0Q7QUFDRjtBQUNGOztBQUVEO0FBQ0FsQyxRQUFNTyxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JKLElBRGEsRUFFYnVCLE1BQU1FLE1BQU4sQ0FBYUQsT0FGQSxDQUFmOztBQUtBO0FBQ0EsU0FBTyxDQUFDLEtBQUQsRUFBUU0sV0FBUixFQUFxQlAsTUFBTUUsTUFBTixDQUFhRCxPQUFsQyxDQUFQO0FBQ0QsQyIsImZpbGUiOiJsb2FkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSAnLi4vdXRpbHMnXG5pbXBvcnQgeyBzdGF0LCByZWFkRmlsZSB9IGZyb20gJy4uL2ZzJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgc3RhdFxuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHt9LCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIC8vIGxvYWQgZmlsZVxuICBsZXQgY29kZSA9IGF3YWl0IHJlYWRGaWxlKGZpbGUsICd1dGY4JylcblxuICBjb25zdCByZXEgPSByZXF1aXJlKCdyZXF1aXJlLWxpa2UnKVxuICBjb25zdCB7IFNjcmlwdCB9ID0gcmVxdWlyZSgndm0nKVxuXG4gIC8vIGNydWRlIHRlc3QgdG8gc2VlIGlmIGJhYmVsIGlzIG5lZWRlZFxuICBpZiAocHJvY2Vzcy5lbnYuSEFSTU9OWV9GTEFHID09PSAndHJ1ZScpIHtcbiAgICBsZXQgYmFiZWwsIGVudlxuXG4gICAgdHJ5IHtcbiAgICAgIGJhYmVsID0gcmVxdWlyZSgnYmFiZWwtY29yZScpXG4gICAgICBlbnYgPSByZXF1aXJlKCdiYWJlbC1wcmVzZXQtZW52JylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluc3RhbGwgYmFiZWwtY29yZSBsb2NhbGx5IHRvIHVzZSB0aGUgaGFybW9ueSBmbGFnLicpXG4gICAgfVxuXG4gICAgLy8gY29tcGlsZSB3aXRoIGJhYmVsXG4gICAgY29kZSA9IGJhYmVsLnRyYW5zZm9ybShjb2RlLCB7XG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIHByZXNldHM6IFtcbiAgICAgICAgW2Vudiwge1xuICAgICAgICAgIHRhcmdldHM6IHtcbiAgICAgICAgICAgIG5vZGU6ICdjdXJyZW50J1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIF1cbiAgICB9KS5jb2RlXG4gIH1cblxuICAvLyBzZXR1cCB2aXJ0dWFsIHNjcmlwdFxuICBjb25zdCBzY3JpcHQgPSBuZXcgU2NyaXB0KFxuICAgIGAoZnVuY3Rpb24gKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSwgX19maWxlbmFtZSwgX19kaXJuYW1lKSB7XG4gICAgICAke2NvZGV9XG4gICAgIH0oc2NvcGUuZXhwb3J0cywgc2NvcGUucmVxdWlyZSwgc2NvcGUubW9kdWxlLCBzY29wZS5fX2ZpbGVuYW1lLCBzY29wZS5fX2Rpcm5hbWUpKWBcbiAgLCB7XG4gICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgZGlzcGxheUVycm9yczogdHJ1ZVxuICB9KVxuXG4gIC8vIHNldHVwIG1vY2sgc2NvcGVcbiAgY29uc3Qgc2NvcGVFeHBvcnRzID0ge31cbiAgICAgICwgc2NvcGUgPSB7XG4gICAgICAgICAgZXhwb3J0czogc2NvcGVFeHBvcnRzLFxuICAgICAgICAgIHJlcXVpcmU6IHJlcShmaWxlKSxcbiAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGV4cG9ydHM6IHNjb3BlRXhwb3J0c1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfX2Rpcm5hbWU6IGRpcm5hbWUoZmlsZSksXG4gICAgICAgICAgX19maWxlbmFtZTogZmlsZVxuICAgICAgICB9XG5cbiAgLy8gZXhwb3NlIHRvIHNjcmlwdFxuICBnbG9iYWwuc2NvcGUgPSBzY29wZVxuXG4gIC8vIHJ1biBzY3JpcHRcbiAgc2NyaXB0LnJ1bkluVGhpc0NvbnRleHQoe1xuICAgIGZpbGVuYW1lOiBmaWxlXG4gIH0pXG5cbiAgLy8gY2xlYW4gZ2xvYmFsIHNjb3BlXG4gIGRlbGV0ZSBnbG9iYWwuc2NvcGVcblxuICAvLyBmaWd1cmUgb3V0IHdoaWNoIHRhc2tzIGFyZSBidXN0XG4gIHN0YXRlLnRhc2tzID0gc3RhdGUudGFza3MgfHwge31cbiAgY29uc3QgYnVzdGVkVGFza3MgPSB7fVxuXG4gIC8vIG9ubHkgdHJ5IGNoZWNraW5nIGZvciBzaW5nbGUgdGFza3NcbiAgZm9yIChsZXQgdGFzayBpbiBzY29wZS5tb2R1bGUuZXhwb3J0cykge1xuICAgIGlmIChzY29wZS5tb2R1bGUuZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eSh0YXNrKSAmJiBzdGF0ZS50YXNrcy5oYXNPd25Qcm9wZXJ0eSh0YXNrKSkge1xuICAgICAgY29uc3QganNvbiA9IHNjb3BlLm1vZHVsZS5leHBvcnRzW3Rhc2tdLnRvSlNPTigpXG5cbiAgICAgIGlmICghKGpzb24gaW5zdGFuY2VvZiBBcnJheSkgJiYgIWRlZXBFcXVhbChqc29uLCBzdGF0ZS50YXNrc1t0YXNrXSkpIHtcbiAgICAgICAgYnVzdGVkVGFza3NbdGFza10gPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gY2FjaGUgZXhwb3J0c1xuICBjYWNoZS52YWwoJ18nLCBbXG4gICAgbG1vZCxcbiAgICBzY29wZS5tb2R1bGUuZXhwb3J0c1xuICBdKVxuXG4gIC8vIHJldHVybiBleHBvcnRzXG4gIHJldHVybiBbZmFsc2UsIGJ1c3RlZFRhc2tzLCBzY29wZS5tb2R1bGUuZXhwb3J0c11cbn1cbiJdfQ==