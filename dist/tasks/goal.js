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
    return (0, _parallel2.default)(arr[1], taskDefns);
  }

  return (0, _watch2.default)(arr[1]);
}

const defineTasks = exports.defineTasks = defns => {
  taskDefns = defns;
  _parallel2.default.defineTasks(defns);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImZyb21BcnJheSIsImFyciIsImRlZmluZVRhc2tzIiwiZGVmbnMiLCJjcmVhdGUiLCJ0YXNrcyIsInByb2plY3REaXIiLCJtb2RlIiwiZ29hbCIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsImVyciIsImVycm9yIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSUEsU0FBSixDLENBVkE7Ozs7OztBQVlBLFNBQVNDLFNBQVQsQ0FBbUJDLEdBQW5CLEVBQXdCRixTQUF4QixFQUFtQztBQUNqQyxNQUFJRSxJQUFJLENBQUosTUFBVyxVQUFmLEVBQTJCO0FBQ3pCLFdBQU8sd0JBQWVBLElBQUksQ0FBSixDQUFmLEVBQXVCRixTQUF2QixDQUFQO0FBQ0Q7O0FBRUQsU0FBTyxxQkFBWUUsSUFBSSxDQUFKLENBQVosQ0FBUDtBQUNEOztBQUVNLE1BQU1DLG9DQUFjQyxTQUFTO0FBQ2xDSixjQUFZSSxLQUFaO0FBQ0EscUJBQWVELFdBQWYsQ0FBMkJDLEtBQTNCO0FBQ0QsQ0FITTs7QUFLQSxNQUFNQywwQkFBUyxDQUFDQyxLQUFELEVBQVFDLFVBQVIsRUFBb0JDLE9BQU8sT0FBM0IsS0FBdUM7QUFDM0QsTUFBSUMsSUFBSjs7QUFFQSxNQUFJSCxNQUFNSSxNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFFBQUlDLE9BQU9MLE1BQU0sQ0FBTixDQUFYO0FBQ0FHLFdBQU9ULFVBQVVNLE1BQU0sQ0FBTixDQUFWLENBQVA7O0FBRUEsUUFBSUcsZ0JBQWdCRyxLQUFwQixFQUEyQjtBQUN6QkgsYUFBT1IsVUFBVVEsSUFBVixFQUFnQlQsU0FBaEIsQ0FBUDtBQUNEOztBQUVEUyxXQUFPLENBQUMsWUFBWTtBQUNsQixVQUFJO0FBQ0YsY0FBTUEsS0FBS0QsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9NLEdBQVAsRUFBWTtBQUNaLDJCQUFjLFFBQU9GLElBQUssRUFBMUIsRUFBNkJHLEtBQTdCLENBQW1DRCxJQUFJRSxLQUFKLElBQWFGLEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQVBNLEdBQVA7QUFRRCxHQWhCRCxNQWdCTztBQUNMSixXQUFPTyxRQUFRQyxHQUFSLENBQVlYLE1BQU1ZLEdBQU4sQ0FBVSxNQUFNUCxJQUFOLElBQWM7QUFDekMsVUFBSVEsT0FBT25CLFVBQVVXLElBQVYsQ0FBWDs7QUFFQSxVQUFJUSxnQkFBZ0JQLEtBQXBCLEVBQTJCO0FBQ3pCTyxlQUFPbEIsVUFBVWtCLElBQVYsRUFBZ0JuQixTQUFoQixDQUFQO0FBQ0Q7O0FBRUQsVUFBSTtBQUNGLGNBQU1tQixLQUFLWCxJQUFMLEVBQVdHLElBQVgsRUFBaUJKLFVBQWpCLENBQU47QUFDRCxPQUZELENBRUUsT0FBT00sR0FBUCxFQUFZO0FBQ1osMkJBQWMsUUFBT0YsSUFBSyxFQUExQixFQUE2QkcsS0FBN0IsQ0FBbUNELElBQUlFLEtBQUosSUFBYUYsR0FBaEQ7QUFDQSxjQUFPLGVBQVA7QUFDRDtBQUNGLEtBYmtCLENBQVosQ0FBUDtBQWNEOztBQUVELFNBQU9KLElBQVA7QUFDRCxDQXJDTSIsImZpbGUiOiJnb2FsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBjcmVhdGVXYXRjaCBmcm9tICcuL3dhdGNoJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi9wYXJhbGxlbCdcblxubGV0IHRhc2tEZWZuc1xuXG5mdW5jdGlvbiBmcm9tQXJyYXkoYXJyLCB0YXNrRGVmbnMpIHtcbiAgaWYgKGFyclswXSA9PT0gJ3BhcmFsbGVsJykge1xuICAgIHJldHVybiBjcmVhdGVQYXJhbGxlbChhcnJbMV0sIHRhc2tEZWZucylcbiAgfVxuICBcbiAgcmV0dXJuIGNyZWF0ZVdhdGNoKGFyclsxXSlcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmluZVRhc2tzID0gZGVmbnMgPT4ge1xuICB0YXNrRGVmbnMgPSBkZWZuc1xuICBjcmVhdGVQYXJhbGxlbC5kZWZpbmVUYXNrcyhkZWZucylcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGZyb21BcnJheShnb2FsLCB0YXNrRGVmbnMpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsW21vZGVdKG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gZnJvbUFycmF5KHRhc2ssIHRhc2tEZWZucylcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGFza1ttb2RlXShuYW1lLCBwcm9qZWN0RGlyKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSlcbiAgfVxuXG4gIHJldHVybiBnb2FsXG59Il19