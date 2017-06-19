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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/tasks/mgr.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var taskDefns = void 0;
var bustedTasks = void 0;

function fromArray(arr) {
  if (arr[0] === 'parallel') {
    return (0, _parallel2.default)(arr[1]);
  }

  return (0, _watch2.default)(arr[1]);
}

var defineTasks = exports.defineTasks = function defineTasks(defns, busted) {
  taskDefns = defns;
  bustedTasks = busted;

  _parallel2.default.defineTasks(defns, busted);
};

var create = exports.create = function create(tasks, projectDir) {
  var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'start';

  var goal = void 0;

  if (tasks.length === 1) {
    var name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal);
    }

    goal = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return goal[mode](name, projectDir, !!bustedTasks[name]);

            case 3:
              _context.next = 9;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context['catch'](0);

              (0, _log2.default)('hopp:' + name).error(_context.t0.stack || _context.t0);
              throw 'Build failed.';

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 5]]);
    }))();
  } else {
    goal = Promise.all(tasks.map(function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name) {
        var task;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                task = taskDefns[name];


                if (task instanceof Array) {
                  task = fromArray(task);
                }

                _context2.prev = 2;
                _context2.next = 5;
                return task[mode](name, projectDir, !!bustedTasks[name]);

              case 5:
                _context2.next = 11;
                break;

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2['catch'](2);

                (0, _log2.default)('hopp:' + name).error(_context2.t0.stack || _context2.t0);
                throw 'Build failed.';

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined, [[2, 7]]);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }()));
  }

  return goal;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImJ1c3RlZFRhc2tzIiwiZnJvbUFycmF5IiwiYXJyIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCIsImNyZWF0ZSIsInRhc2tzIiwicHJvamVjdERpciIsIm1vZGUiLCJnb2FsIiwibGVuZ3RoIiwibmFtZSIsIkFycmF5IiwiZXJyb3IiLCJzdGFjayIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7MmNBUkE7Ozs7OztBQVVBLElBQUlBLGtCQUFKO0FBQ0EsSUFBSUMsb0JBQUo7O0FBRUEsU0FBU0MsU0FBVCxDQUFtQkMsR0FBbkIsRUFBd0I7QUFDdEIsTUFBSUEsSUFBSSxDQUFKLE1BQVcsVUFBZixFQUEyQjtBQUN6QixXQUFPLHdCQUFlQSxJQUFJLENBQUosQ0FBZixDQUFQO0FBQ0Q7O0FBRUQsU0FBTyxxQkFBWUEsSUFBSSxDQUFKLENBQVosQ0FBUDtBQUNEOztBQUVNLElBQU1DLG9DQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQzVDTixjQUFZSyxLQUFaO0FBQ0FKLGdCQUFjSyxNQUFkOztBQUVBLHFCQUFlRixXQUFmLENBQTJCQyxLQUEzQixFQUFrQ0MsTUFBbEM7QUFDRCxDQUxNOztBQU9BLElBQU1DLDBCQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsS0FBRCxFQUFRQyxVQUFSLEVBQXVDO0FBQUEsTUFBbkJDLElBQW1CLHVFQUFaLE9BQVk7O0FBQzNELE1BQUlDLGFBQUo7O0FBRUEsTUFBSUgsTUFBTUksTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUN0QixRQUFJQyxPQUFPTCxNQUFNLENBQU4sQ0FBWDtBQUNBRyxXQUFPWCxVQUFVUSxNQUFNLENBQU4sQ0FBVixDQUFQOztBQUVBLFFBQUlHLGdCQUFnQkcsS0FBcEIsRUFBMkI7QUFDekJILGFBQU9ULFVBQVVTLElBQVYsQ0FBUDtBQUNEOztBQUVEQSxXQUFPLDBDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBRUVBLEtBQUtELElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBRkY7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFJSiwyQ0FBcUJBLElBQXJCLEVBQTZCRSxLQUE3QixDQUFtQyxZQUFJQyxLQUFKLGVBQW5DO0FBSkksb0JBS0csZUFMSDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFELElBQVA7QUFRRCxHQWhCRCxNQWdCTztBQUNMTCxXQUFPTSxRQUFRQyxHQUFSLENBQVlWLE1BQU1XLEdBQU47QUFBQSw0REFBVSxrQkFBTU4sSUFBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdkJPLG9CQUR1QixHQUNoQnBCLFVBQVVhLElBQVYsQ0FEZ0I7OztBQUczQixvQkFBSU8sZ0JBQWdCTixLQUFwQixFQUEyQjtBQUN6Qk0seUJBQU9sQixVQUFVa0IsSUFBVixDQUFQO0FBQ0Q7O0FBTDBCO0FBQUE7QUFBQSx1QkFRbkJBLEtBQUtWLElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBUm1COztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBVXpCLDZDQUFxQkEsSUFBckIsRUFBNkJFLEtBQTdCLENBQW1DLGFBQUlDLEtBQUosZ0JBQW5DO0FBVnlCLHNCQVdsQixlQVhrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFWOztBQUFBO0FBQUE7QUFBQTtBQUFBLFFBQVosQ0FBUDtBQWNEOztBQUVELFNBQU9MLElBQVA7QUFDRCxDQXJDTSIsImZpbGUiOiJnb2FsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBjcmVhdGVXYXRjaCBmcm9tICcuL3dhdGNoJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi9wYXJhbGxlbCdcblxubGV0IHRhc2tEZWZuc1xubGV0IGJ1c3RlZFRhc2tzXG5cbmZ1bmN0aW9uIGZyb21BcnJheShhcnIpIHtcbiAgaWYgKGFyclswXSA9PT0gJ3BhcmFsbGVsJykge1xuICAgIHJldHVybiBjcmVhdGVQYXJhbGxlbChhcnJbMV0pXG4gIH1cbiAgXG4gIHJldHVybiBjcmVhdGVXYXRjaChhcnJbMV0pXG59XG5cbmV4cG9ydCBjb25zdCBkZWZpbmVUYXNrcyA9IChkZWZucywgYnVzdGVkKSA9PiB7XG4gIHRhc2tEZWZucyA9IGRlZm5zXG4gIGJ1c3RlZFRhc2tzID0gYnVzdGVkXG5cbiAgY3JlYXRlUGFyYWxsZWwuZGVmaW5lVGFza3MoZGVmbnMsIGJ1c3RlZClcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGZyb21BcnJheShnb2FsKVxuICAgIH1cblxuICAgIGdvYWwgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZ29hbFttb2RlXShuYW1lLCBwcm9qZWN0RGlyLCAhIWJ1c3RlZFRhc2tzW25hbWVdKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YCkuZXJyb3IoZXJyLnN0YWNrIHx8IGVycilcbiAgICAgICAgdGhyb3cgKCdCdWlsZCBmYWlsZWQuJylcbiAgICAgIH1cbiAgICB9KSgpXG4gIH0gZWxzZSB7XG4gICAgZ29hbCA9IFByb21pc2UuYWxsKHRhc2tzLm1hcChhc3luYyBuYW1lID0+IHtcbiAgICAgIGxldCB0YXNrID0gdGFza0RlZm5zW25hbWVdXG5cbiAgICAgIGlmICh0YXNrIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGFzayA9IGZyb21BcnJheSh0YXNrKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrW21vZGVdKG5hbWUsIHByb2plY3REaXIsICEhYnVzdGVkVGFza3NbbmFtZV0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgcmV0dXJuIGdvYWxcbn0iXX0=