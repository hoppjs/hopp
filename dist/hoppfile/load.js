'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

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
    return [true, {}, state.tasks];
  }

  // load via require
  const tasks = require(file);

  // figure out which tasks are bust
  state.tasks = state.tasks || {};
  const bustedTasks = {};

  // only try checking for single tasks
  for (let task in tasks) {
    if (tasks.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
      const json = tasks[task].toJSON();

      if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
        bustedTasks[task] = true;
      }
    }
  }

  // cache exports
  cache.val('_', [lmod, tasks]);

  // return exports
  return [false, bustedTasks, tasks];
}; /**
    * @file src/utils/load.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsInJlcXVpcmUiLCJidXN0ZWRUYXNrcyIsInRhc2siLCJoYXNPd25Qcm9wZXJ0eSIsImpzb24iLCJ0b0pTT04iLCJBcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7a0JBRWUsTUFBTUMsSUFBTixJQUFjO0FBQzNCO0FBQ0EsTUFBSyxPQUFPQSxJQUFQLEtBQWdCLFFBQXJCLEVBQWdDO0FBQzlCLFVBQU0sSUFBSUMsS0FBSixDQUFVLG1CQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBLFFBQU1DLE9BQU8sQ0FBQyxDQUFDLE1BQU0sY0FBS0YsSUFBTCxDQUFQLEVBQW1CRyxLQUFqQzs7QUFFQTtBQUNBLFFBQU1DLFFBQVEsRUFBZCxDQUNDLENBQUNBLE1BQU1GLElBQVAsRUFBYUUsTUFBTUMsS0FBbkIsSUFBNEJOLE1BQU1PLEdBQU4sQ0FBVSxHQUFWLEtBQWtCLEVBQTlDOztBQUVELE1BQUlGLE1BQU1GLElBQU4sS0FBZUEsSUFBbkIsRUFBeUI7QUFDdkIsV0FBTyxDQUFDLElBQUQsRUFBTyxFQUFQLEVBQVdFLE1BQU1DLEtBQWpCLENBQVA7QUFDRDs7QUFFRDtBQUNBLFFBQU1BLFFBQVFFLFFBQVFQLElBQVIsQ0FBZDs7QUFFQTtBQUNBSSxRQUFNQyxLQUFOLEdBQWNELE1BQU1DLEtBQU4sSUFBZSxFQUE3QjtBQUNBLFFBQU1HLGNBQWMsRUFBcEI7O0FBRUE7QUFDQSxPQUFLLElBQUlDLElBQVQsSUFBaUJKLEtBQWpCLEVBQXdCO0FBQ3RCLFFBQUlBLE1BQU1LLGNBQU4sQ0FBcUJELElBQXJCLEtBQThCTCxNQUFNQyxLQUFOLENBQVlLLGNBQVosQ0FBMkJELElBQTNCLENBQWxDLEVBQW9FO0FBQ2xFLFlBQU1FLE9BQU9OLE1BQU1JLElBQU4sRUFBWUcsTUFBWixFQUFiOztBQUVBLFVBQUksRUFBRUQsZ0JBQWdCRSxLQUFsQixLQUE0QixDQUFDLHNCQUFVRixJQUFWLEVBQWdCUCxNQUFNQyxLQUFOLENBQVlJLElBQVosQ0FBaEIsQ0FBakMsRUFBcUU7QUFDbkVELG9CQUFZQyxJQUFaLElBQW9CLElBQXBCO0FBQ0Q7QUFDRjtBQUNGOztBQUVEO0FBQ0FWLFFBQU1PLEdBQU4sQ0FBVSxHQUFWLEVBQWUsQ0FDYkosSUFEYSxFQUViRyxLQUZhLENBQWY7O0FBS0E7QUFDQSxTQUFPLENBQUMsS0FBRCxFQUFRRyxXQUFSLEVBQXFCSCxLQUFyQixDQUFQO0FBQ0QsQyxFQXJERCIsImZpbGUiOiJsb2FkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdXRpbHMvbG9hZC5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgeyBzdGF0IH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRlZXBFcXVhbCB9IGZyb20gJy4uL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmaWxlID0+IHtcbiAgLy8gaWYgYmFkIGFyZ3MgZGllXG4gIGlmICggdHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnICkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBhcmd1bWVudHMnKVxuICB9XG5cbiAgLy8gZ2V0IGZpbGUgc3RhdFxuICBjb25zdCBsbW9kID0gKyhhd2FpdCBzdGF0KGZpbGUpKS5tdGltZVxuXG4gIC8vIHRyeSB0byBsb2FkIGZyb20gY2FjaGVcbiAgY29uc3Qgc3RhdGUgPSB7fVxuICA7W3N0YXRlLmxtb2QsIHN0YXRlLnRhc2tzXSA9IGNhY2hlLnZhbCgnXycpIHx8IFtdXG5cbiAgaWYgKHN0YXRlLmxtb2QgPT09IGxtb2QpIHtcbiAgICByZXR1cm4gW3RydWUsIHt9LCBzdGF0ZS50YXNrc11cbiAgfVxuXG4gIC8vIGxvYWQgdmlhIHJlcXVpcmVcbiAgY29uc3QgdGFza3MgPSByZXF1aXJlKGZpbGUpXG5cbiAgLy8gZmlndXJlIG91dCB3aGljaCB0YXNrcyBhcmUgYnVzdFxuICBzdGF0ZS50YXNrcyA9IHN0YXRlLnRhc2tzIHx8IHt9XG4gIGNvbnN0IGJ1c3RlZFRhc2tzID0ge31cblxuICAvLyBvbmx5IHRyeSBjaGVja2luZyBmb3Igc2luZ2xlIHRhc2tzXG4gIGZvciAobGV0IHRhc2sgaW4gdGFza3MpIHtcbiAgICBpZiAodGFza3MuaGFzT3duUHJvcGVydHkodGFzaykgJiYgc3RhdGUudGFza3MuaGFzT3duUHJvcGVydHkodGFzaykpIHtcbiAgICAgIGNvbnN0IGpzb24gPSB0YXNrc1t0YXNrXS50b0pTT04oKVxuXG4gICAgICBpZiAoIShqc29uIGluc3RhbmNlb2YgQXJyYXkpICYmICFkZWVwRXF1YWwoanNvbiwgc3RhdGUudGFza3NbdGFza10pKSB7XG4gICAgICAgIGJ1c3RlZFRhc2tzW3Rhc2tdID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGNhY2hlIGV4cG9ydHNcbiAgY2FjaGUudmFsKCdfJywgW1xuICAgIGxtb2QsXG4gICAgdGFza3NcbiAgXSlcblxuICAvLyByZXR1cm4gZXhwb3J0c1xuICByZXR1cm4gW2ZhbHNlLCBidXN0ZWRUYXNrcywgdGFza3NdXG59XG4iXX0=