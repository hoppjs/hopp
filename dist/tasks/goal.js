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
                * @copyright 2017 10244872 Canada Inc.
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
        (0, _log2.default)(`hopp:${name}`).error(err && err.stack ? err.stack : err);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImJ1c3RlZFRhc2tzIiwiZnJvbUFycmF5IiwiYXJyIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCIsImNyZWF0ZSIsInRhc2tzIiwicHJvamVjdERpciIsIm1vZGUiLCJnb2FsIiwibGVuZ3RoIiwibmFtZSIsIkFycmF5IiwiZXJyIiwiZXJyb3IiLCJzdGFjayIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJQSxTQUFKLEMsQ0FWQTs7Ozs7O0FBV0EsSUFBSUMsV0FBSjs7QUFFQSxTQUFTQyxTQUFULENBQW1CQyxHQUFuQixFQUF3QjtBQUN0QixNQUFJQSxJQUFJLENBQUosTUFBVyxVQUFmLEVBQTJCO0FBQ3pCLFdBQU8sd0JBQWVBLElBQUksQ0FBSixDQUFmLENBQVA7QUFDRDs7QUFFRCxTQUFPLHFCQUFZQSxJQUFJLENBQUosQ0FBWixDQUFQO0FBQ0Q7O0FBRU0sTUFBTUMsb0NBQWMsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLEtBQW1CO0FBQzVDTixjQUFZSyxLQUFaO0FBQ0FKLGdCQUFjSyxNQUFkOztBQUVBLHFCQUFlRixXQUFmLENBQTJCQyxLQUEzQixFQUFrQ0MsTUFBbEM7QUFDRCxDQUxNOztBQU9BLE1BQU1DLDBCQUFTLENBQUNDLEtBQUQsRUFBUUMsVUFBUixFQUFvQkMsT0FBTyxPQUEzQixLQUF1QztBQUMzRCxNQUFJQyxJQUFKOztBQUVBLE1BQUlILE1BQU1JLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsUUFBSUMsT0FBT0wsTUFBTSxDQUFOLENBQVg7QUFDQUcsV0FBT1gsVUFBVVEsTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxRQUFJRyxnQkFBZ0JHLEtBQXBCLEVBQTJCO0FBQ3pCSCxhQUFPVCxVQUFVUyxJQUFWLENBQVA7QUFDRDs7QUFFREEsV0FBTyxDQUFDLFlBQVk7QUFDbEIsVUFBSTtBQUNGLGNBQU1BLEtBQUtELElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBQU47QUFDRCxPQUZELENBRUUsT0FBT0UsR0FBUCxFQUFZO0FBQ1osMkJBQWMsUUFBT0YsSUFBSyxFQUExQixFQUE2QkcsS0FBN0IsQ0FBbUNELE9BQU9BLElBQUlFLEtBQVgsR0FBbUJGLElBQUlFLEtBQXZCLEdBQStCRixHQUFsRTtBQUNBLGNBQU8sZUFBUDtBQUNEO0FBQ0YsS0FQTSxHQUFQO0FBUUQsR0FoQkQsTUFnQk87QUFDTEosV0FBT08sUUFBUUMsR0FBUixDQUFZWCxNQUFNWSxHQUFOLENBQVUsTUFBTVAsSUFBTixJQUFjO0FBQ3pDLFVBQUlRLE9BQU9yQixVQUFVYSxJQUFWLENBQVg7O0FBRUEsVUFBSVEsZ0JBQWdCUCxLQUFwQixFQUEyQjtBQUN6Qk8sZUFBT25CLFVBQVVtQixJQUFWLENBQVA7QUFDRDs7QUFFRCxVQUFJO0FBQ0YsY0FBTUEsS0FBS1gsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixFQUE2QixDQUFDLENBQUNSLFlBQVlZLElBQVosQ0FBL0IsQ0FBTjtBQUNELE9BRkQsQ0FFRSxPQUFPRSxHQUFQLEVBQVk7QUFDWiwyQkFBYyxRQUFPRixJQUFLLEVBQTFCLEVBQTZCRyxLQUE3QixDQUFtQ0QsSUFBSUUsS0FBSixJQUFhRixHQUFoRDtBQUNBLGNBQU8sZUFBUDtBQUNEO0FBQ0YsS0Fia0IsQ0FBWixDQUFQO0FBY0Q7O0FBRUQsU0FBT0osSUFBUDtBQUNELENBckNNIiwiZmlsZSI6ImdvYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vd2F0Y2gnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3BhcmFsbGVsJ1xuXG5sZXQgdGFza0RlZm5zXG5sZXQgYnVzdGVkVGFza3NcblxuZnVuY3Rpb24gZnJvbUFycmF5KGFycikge1xuICBpZiAoYXJyWzBdID09PSAncGFyYWxsZWwnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVBhcmFsbGVsKGFyclsxXSlcbiAgfVxuICBcbiAgcmV0dXJuIGNyZWF0ZVdhdGNoKGFyclsxXSlcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmluZVRhc2tzID0gKGRlZm5zLCBidXN0ZWQpID0+IHtcbiAgdGFza0RlZm5zID0gZGVmbnNcbiAgYnVzdGVkVGFza3MgPSBidXN0ZWRcblxuICBjcmVhdGVQYXJhbGxlbC5kZWZpbmVUYXNrcyhkZWZucywgYnVzdGVkKVxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlID0gKHRhc2tzLCBwcm9qZWN0RGlyLCBtb2RlID0gJ3N0YXJ0JykgPT4ge1xuICBsZXQgZ29hbFxuXG4gIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbmFtZSA9IHRhc2tzWzBdXG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gZnJvbUFycmF5KGdvYWwpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsW21vZGVdKG5hbWUsIHByb2plY3REaXIsICEhYnVzdGVkVGFza3NbbmFtZV0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIgJiYgZXJyLnN0YWNrID8gZXJyLnN0YWNrIDogZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gZnJvbUFycmF5KHRhc2spXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRhc2tbbW9kZV0obmFtZSwgcHJvamVjdERpciwgISFidXN0ZWRUYXNrc1tuYW1lXSlcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cblxuICByZXR1cm4gZ29hbFxufVxuIl19