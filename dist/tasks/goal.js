'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = exports.defineTasks = undefined;

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _parallel = require('./parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

let taskDefns;

const defineTasks = exports.defineTasks = defns => {
  taskDefns = defns;
};

const create = exports.create = (tasks, projectDir, mode = 'start') => {
  let goal;

  if (tasks.length === 1) {
    let name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = (0, _parallel2.default)(goal, taskDefns);
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
        task = (0, _parallel2.default)(task, taskDefns);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImRlZmluZVRhc2tzIiwiZGVmbnMiLCJjcmVhdGUiLCJ0YXNrcyIsInByb2plY3REaXIiLCJtb2RlIiwiZ29hbCIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsImVyciIsImVycm9yIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7OztBQVBBOzs7Ozs7QUFTQSxJQUFJQSxTQUFKOztBQUVPLE1BQU1DLG9DQUFjQyxTQUFTO0FBQ2xDRixjQUFZRSxLQUFaO0FBQ0QsQ0FGTTs7QUFJQSxNQUFNQywwQkFBUyxDQUFDQyxLQUFELEVBQVFDLFVBQVIsRUFBb0JDLE9BQU8sT0FBM0IsS0FBdUM7QUFDM0QsTUFBSUMsSUFBSjs7QUFFQSxNQUFJSCxNQUFNSSxNQUFOLEtBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFFBQUlDLE9BQU9MLE1BQU0sQ0FBTixDQUFYO0FBQ0FHLFdBQU9QLFVBQVVJLE1BQU0sQ0FBTixDQUFWLENBQVA7O0FBRUEsUUFBSUcsZ0JBQWdCRyxLQUFwQixFQUEyQjtBQUN6QkgsYUFBTyx3QkFBZUEsSUFBZixFQUFxQlAsU0FBckIsQ0FBUDtBQUNEOztBQUVETyxXQUFPLENBQUMsWUFBWTtBQUNsQixVQUFJO0FBQ0YsY0FBTUEsS0FBS0QsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9NLEdBQVAsRUFBWTtBQUNaLDJCQUFjLFFBQU9GLElBQUssRUFBMUIsRUFBNkJHLEtBQTdCLENBQW1DRCxJQUFJRSxLQUFKLElBQWFGLEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQVBNLEdBQVA7QUFRRCxHQWhCRCxNQWdCTztBQUNMSixXQUFPTyxRQUFRQyxHQUFSLENBQVlYLE1BQU1ZLEdBQU4sQ0FBVSxNQUFNUCxJQUFOLElBQWM7QUFDekMsVUFBSVEsT0FBT2pCLFVBQVVTLElBQVYsQ0FBWDs7QUFFQSxVQUFJUSxnQkFBZ0JQLEtBQXBCLEVBQTJCO0FBQ3pCTyxlQUFPLHdCQUFlQSxJQUFmLEVBQXFCakIsU0FBckIsQ0FBUDtBQUNEOztBQUVELFVBQUk7QUFDRixjQUFNaUIsS0FBS1gsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUFOO0FBQ0QsT0FGRCxDQUVFLE9BQU9NLEdBQVAsRUFBWTtBQUNaLDJCQUFjLFFBQU9GLElBQUssRUFBMUIsRUFBNkJHLEtBQTdCLENBQW1DRCxJQUFJRSxLQUFKLElBQWFGLEdBQWhEO0FBQ0EsY0FBTyxlQUFQO0FBQ0Q7QUFDRixLQWJrQixDQUFaLENBQVA7QUFjRDs7QUFFRCxTQUFPSixJQUFQO0FBQ0QsQ0FyQ00iLCJmaWxlIjoiZ29hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3BhcmFsbGVsJ1xuXG5sZXQgdGFza0RlZm5zXG5cbmV4cG9ydCBjb25zdCBkZWZpbmVUYXNrcyA9IGRlZm5zID0+IHtcbiAgdGFza0RlZm5zID0gZGVmbnNcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGNyZWF0ZVBhcmFsbGVsKGdvYWwsIHRhc2tEZWZucylcbiAgICB9XG5cbiAgICBnb2FsID0gKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGdvYWxbbW9kZV0obmFtZSwgcHJvamVjdERpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkoKVxuICB9IGVsc2Uge1xuICAgIGdvYWwgPSBQcm9taXNlLmFsbCh0YXNrcy5tYXAoYXN5bmMgbmFtZSA9PiB7XG4gICAgICBsZXQgdGFzayA9IHRhc2tEZWZuc1tuYW1lXVxuXG4gICAgICBpZiAodGFzayBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRhc2sgPSBjcmVhdGVQYXJhbGxlbCh0YXNrLCB0YXNrRGVmbnMpXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRhc2tbbW9kZV0obmFtZSwgcHJvamVjdERpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cblxuICByZXR1cm4gZ29hbFxufSJdfQ==