'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = exports.defineTasks = undefined;

var _watch = require('./watch');

var _watch2 = _interopRequireDefault(_watch);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _parallel = require('./parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let taskDefns; /**
                * @file src/tasks/mgr.js
                * @license MIT
                * @copyright 2017 Karim Alibhai.
                */

function fromArray(arr, taskDefns) {
  if (arr[0] === 'parallel') {
    return (0, _parallel2.default)(arr, taskDefns);
  }

  return (0, _watch2.default)(arr);
}

const defineTasks = exports.defineTasks = defns => {
  taskDefns = defns;
};

const create = exports.create = (tasks, projectDir, mode = 'start') => {
  let goal;

  if (tasks.length === 1) {
    let name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal, taskDefns);
    }

    goal = (async () => {
      try {
        await goal[mode](name, projectDir);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    })();
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name];

      if (task instanceof Array) {
        task = fromArray(task, taskDefns);
      }

      try {
        await task[mode](name, projectDir);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    }));
  }

  return goal;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImZyb21BcnJheSIsImFyciIsImRlZmluZVRhc2tzIiwiZGVmbnMiLCJjcmVhdGUiLCJ0YXNrcyIsInByb2plY3REaXIiLCJtb2RlIiwiZ29hbCIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsImVyciIsImVycm9yIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSUEsU0FBSixDLENBVkE7Ozs7OztBQVlBLFNBQVNDLFNBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCRixTQUF4QixFQUFtQztBQUNqQyxNQUFJRSxJQUFJLENBQUosTUFBVyxVQUFmLEVBQTJCO0FBQ3pCLFdBQU8sd0JBQWVBLEdBQWYsRUFBb0JGLFNBQXBCLENBQVA7QUFDRDs7QUFFRCxTQUFPLHFCQUFZRSxHQUFaLENBQVA7QUFDRDs7QUFFTSxNQUFNQyxvQ0FBY0MsU0FBUztBQUNsQ0osY0FBWUksS0FBWjtBQUNELENBRk07O0FBSUEsTUFBTUMsMEJBQVMsQ0FBQ0MsS0FBRCxFQUFRQyxVQUFSLEVBQW9CQyxPQUFPLE9BQTNCLEtBQXVDO0FBQzNELE1BQUlDLElBQUo7O0FBRUEsTUFBSUgsTUFBTUksTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUN0QixRQUFJQyxPQUFPTCxNQUFNLENBQU4sQ0FBWDtBQUNBRyxXQUFPVCxVQUFVTSxNQUFNLENBQU4sQ0FBVixDQUFQOztBQUVBLFFBQUlHLGdCQUFnQkcsS0FBcEIsRUFBMkI7QUFDekJILGFBQU9SLFVBQVVRLElBQVYsRUFBZ0JULFNBQWhCLENBQVA7QUFDRDs7QUFFRFMsV0FBTyxDQUFDLFlBQVk7QUFDbEIsVUFBSTtBQUNGLGNBQU1BLEtBQUtELElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsQ0FBTjtBQUNELE9BRkQsQ0FFRSxPQUFPTSxHQUFQLEVBQVk7QUFDWiwyQkFBYyxRQUFPRixJQUFLLEVBQTFCLEVBQTZCRyxLQUE3QixDQUFtQ0QsSUFBSUUsS0FBSixJQUFhRixHQUFoRDtBQUNBLGNBQU8sZUFBUDtBQUNEO0FBQ0YsS0FQTSxHQUFQO0FBUUQsR0FoQkQsTUFnQk87QUFDTEosV0FBT08sUUFBUUMsR0FBUixDQUFZWCxNQUFNWSxHQUFOLENBQVUsTUFBTVAsSUFBTixJQUFjO0FBQ3pDLFVBQUlRLE9BQU9uQixVQUFVVyxJQUFWLENBQVg7O0FBRUEsVUFBSVEsZ0JBQWdCUCxLQUFwQixFQUEyQjtBQUN6Qk8sZUFBT2xCLFVBQVVrQixJQUFWLEVBQWdCbkIsU0FBaEIsQ0FBUDtBQUNEOztBQUVELFVBQUk7QUFDRixjQUFNbUIsS0FBS1gsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9NLEdBQVAsRUFBWTtBQUNaLDJCQUFjLFFBQU9GLElBQUssRUFBMUIsRUFBNkJHLEtBQTdCLENBQW1DRCxJQUFJRSxLQUFKLElBQWFGLEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQWJrQixDQUFaLENBQVA7QUFjRDs7QUFFRCxTQUFPSixJQUFQO0FBQ0QsQ0FyQ00iLCJmaWxlIjoiZ29hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlV2F0Y2ggZnJvbSAnLi93YXRjaCdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuaW1wb3J0IGNyZWF0ZVBhcmFsbGVsIGZyb20gJy4vcGFyYWxsZWwnXG5cbmxldCB0YXNrRGVmbnNcblxuZnVuY3Rpb24gZnJvbUFycmF5KGFyciwgdGFza0RlZm5zKSB7XG4gIGlmIChhcnJbMF0gPT09ICdwYXJhbGxlbCcpIHtcbiAgICByZXR1cm4gY3JlYXRlUGFyYWxsZWwoYXJyLCB0YXNrRGVmbnMpXG4gIH1cbiAgXG4gIHJldHVybiBjcmVhdGVXYXRjaChhcnIpXG59XG5cbmV4cG9ydCBjb25zdCBkZWZpbmVUYXNrcyA9IGRlZm5zID0+IHtcbiAgdGFza0RlZm5zID0gZGVmbnNcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGZyb21BcnJheShnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsW21vZGVdKG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gZnJvbUFycmF5KHRhc2ssIHRhc2tEZWZucylcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGFza1ttb2RlXShuYW1lLCBwcm9qZWN0RGlyKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIHJldHVybiBnb2FsXG59Il19