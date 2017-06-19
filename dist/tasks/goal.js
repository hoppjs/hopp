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

let bustedTasks;

function fromArray(arr) {
  if (arr[0] === 'parallel') {
    return (0, _parallel2.default)(arr[1]);
  }

  return (0, _watch2.default)(arr[1]);
}

const defineTasks = exports.defineTasks = (defns, busted) => {
  taskDefns = defns;
  bustedTasks = busted;

  _parallel2.default.defineTasks(defns, busted);
};

const create = exports.create = (tasks, projectDir, mode = 'start') => {
  let goal;

  if (tasks.length === 1) {
    let name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal);
    }

    goal = (async () => {
      try {
        await goal[mode](name, projectDir, !!bustedTasks[name]);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    })();
  } else {
    goal = Promise.all(tasks.map(async name => {
      let task = taskDefns[name];

      if (task instanceof Array) {
        task = fromArray(task);
      }

      try {
        await task[mode](name, projectDir, !!bustedTasks[name]);
      } catch (err) {
        (0, _log2.default)(`hopp:${name}`).error(err.stack || err);
        throw 'Build failed.';
      }
    }));
  }

  return goal;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImJ1c3RlZFRhc2tzIiwiZnJvbUFycmF5IiwiYXJyIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCIsImNyZWF0ZSIsInRhc2tzIiwicHJvamVjdERpciIsIm1vZGUiLCJnb2FsIiwibGVuZ3RoIiwibmFtZSIsIkFycmF5IiwiZXJyIiwiZXJyb3IiLCJzdGFjayIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJQSxTQUFKLEMsQ0FWQTs7Ozs7O0FBV0EsSUFBSUMsV0FBSjs7QUFFQSxTQUFTQyxTQUFULENBQW1CQyxHQUFuQixFQUF3QjtBQUN0QixNQUFJQSxJQUFJLENBQUosTUFBVyxVQUFmLEVBQTJCO0FBQ3pCLFdBQU8sd0JBQWVBLElBQUksQ0FBSixDQUFmLENBQVA7QUFDRDs7QUFFRCxTQUFPLHFCQUFZQSxJQUFJLENBQUosQ0FBWixDQUFQO0FBQ0Q7O0FBRU0sTUFBTUMsb0NBQWMsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLEtBQW1CO0FBQzVDTixjQUFZSyxLQUFaO0FBQ0FKLGdCQUFjSyxNQUFkOztBQUVBLHFCQUFlRixXQUFmLENBQTJCQyxLQUEzQixFQUFrQ0MsTUFBbEM7QUFDRCxDQUxNOztBQU9BLE1BQU1DLDBCQUFTLENBQUNDLEtBQUQsRUFBUUMsVUFBUixFQUFvQkMsT0FBTyxPQUEzQixLQUF1QztBQUMzRCxNQUFJQyxJQUFKOztBQUVBLE1BQUlILE1BQU1JLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsUUFBSUMsT0FBT0wsTUFBTSxDQUFOLENBQVg7QUFDQUcsV0FBT1gsVUFBVVEsTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxRQUFJRyxnQkFBZ0JHLEtBQXBCLEVBQTJCO0FBQ3pCSCxhQUFPVCxVQUFVUyxJQUFWLENBQVA7QUFDRDs7QUFFREEsV0FBTyxDQUFDLFlBQVk7QUFDbEIsVUFBSTtBQUNGLGNBQU1BLEtBQUtELElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBQU47QUFDRCxPQUZELENBRUUsT0FBT0UsR0FBUCxFQUFZO0FBQ1osMkJBQWMsUUFBT0YsSUFBSyxFQUExQixFQUE2QkcsS0FBN0IsQ0FBbUNELElBQUlFLEtBQUosSUFBYUYsR0FBaEQ7QUFDQSxjQUFPLGVBQVA7QUFDRDtBQUNGLEtBUE0sR0FBUDtBQVFELEdBaEJELE1BZ0JPO0FBQ0xKLFdBQU9PLFFBQVFDLEdBQVIsQ0FBWVgsTUFBTVksR0FBTixDQUFVLE1BQU1QLElBQU4sSUFBYztBQUN6QyxVQUFJUSxPQUFPckIsVUFBVWEsSUFBVixDQUFYOztBQUVBLFVBQUlRLGdCQUFnQlAsS0FBcEIsRUFBMkI7QUFDekJPLGVBQU9uQixVQUFVbUIsSUFBVixDQUFQO0FBQ0Q7O0FBRUQsVUFBSTtBQUNGLGNBQU1BLEtBQUtYLElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBQU47QUFDRCxPQUZELENBRUUsT0FBT0UsR0FBUCxFQUFZO0FBQ1osMkJBQWMsUUFBT0YsSUFBSyxFQUExQixFQUE2QkcsS0FBN0IsQ0FBbUNELElBQUlFLEtBQUosSUFBYUYsR0FBaEQ7QUFDQSxjQUFPLGVBQVA7QUFDRDtBQUNGLEtBYmtCLENBQVosQ0FBUDtBQWNEOztBQUVELFNBQU9KLElBQVA7QUFDRCxDQXJDTSIsImZpbGUiOiJnb2FsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBjcmVhdGVXYXRjaCBmcm9tICcuL3dhdGNoJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi9wYXJhbGxlbCdcblxubGV0IHRhc2tEZWZuc1xubGV0IGJ1c3RlZFRhc2tzXG5cbmZ1bmN0aW9uIGZyb21BcnJheShhcnIpIHtcbiAgaWYgKGFyclswXSA9PT0gJ3BhcmFsbGVsJykge1xuICAgIHJldHVybiBjcmVhdGVQYXJhbGxlbChhcnJbMV0pXG4gIH1cbiAgXG4gIHJldHVybiBjcmVhdGVXYXRjaChhcnJbMV0pXG59XG5cbmV4cG9ydCBjb25zdCBkZWZpbmVUYXNrcyA9IChkZWZucywgYnVzdGVkKSA9PiB7XG4gIHRhc2tEZWZucyA9IGRlZm5zXG4gIGJ1c3RlZFRhc2tzID0gYnVzdGVkXG5cbiAgY3JlYXRlUGFyYWxsZWwuZGVmaW5lVGFza3MoZGVmbnMsIGJ1c3RlZClcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGZyb21BcnJheShnb2FsKVxuICAgIH1cblxuICAgIGdvYWwgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZ29hbFttb2RlXShuYW1lLCBwcm9qZWN0RGlyLCAhIWJ1c3RlZFRhc2tzW25hbWVdKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcChhc3luYyBuYW1lID0+IHtcbiAgICAgIGxldCB0YXNrID0gdGFza0RlZm5zW25hbWVdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGZyb21BcnJheSh0YXNrKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrW21vZGVdKG5hbWUsIHByb2plY3REaXIsICEhYnVzdGVkVGFza3NbbmFtZV0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgcmV0dXJuIGdvYWxcbn0iXX0=