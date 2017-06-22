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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
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

              (0, _log2.default)('hopp:' + name).error(_context.t0 && _context.t0.stack ? _context.t0.stack : _context.t0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImJ1c3RlZFRhc2tzIiwiZnJvbUFycmF5IiwiYXJyIiwiZGVmaW5lVGFza3MiLCJkZWZucyIsImJ1c3RlZCIsImNyZWF0ZSIsInRhc2tzIiwicHJvamVjdERpciIsIm1vZGUiLCJnb2FsIiwibGVuZ3RoIiwibmFtZSIsIkFycmF5IiwiZXJyb3IiLCJzdGFjayIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0YXNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7MmNBUkE7Ozs7OztBQVVBLElBQUlBLGtCQUFKO0FBQ0EsSUFBSUMsb0JBQUo7O0FBRUEsU0FBU0MsU0FBVCxDQUFtQkMsR0FBbkIsRUFBd0I7QUFDdEIsTUFBSUEsSUFBSSxDQUFKLE1BQVcsVUFBZixFQUEyQjtBQUN6QixXQUFPLHdCQUFlQSxJQUFJLENBQUosQ0FBZixDQUFQO0FBQ0Q7O0FBRUQsU0FBTyxxQkFBWUEsSUFBSSxDQUFKLENBQVosQ0FBUDtBQUNEOztBQUVNLElBQU1DLG9DQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQzVDTixjQUFZSyxLQUFaO0FBQ0FKLGdCQUFjSyxNQUFkOztBQUVBLHFCQUFlRixXQUFmLENBQTJCQyxLQUEzQixFQUFrQ0MsTUFBbEM7QUFDRCxDQUxNOztBQU9BLElBQU1DLDBCQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsS0FBRCxFQUFRQyxVQUFSLEVBQXVDO0FBQUEsTUFBbkJDLElBQW1CLHVFQUFaLE9BQVk7O0FBQzNELE1BQUlDLGFBQUo7O0FBRUEsTUFBSUgsTUFBTUksTUFBTixLQUFpQixDQUFyQixFQUF3QjtBQUN0QixRQUFJQyxPQUFPTCxNQUFNLENBQU4sQ0FBWDtBQUNBRyxXQUFPWCxVQUFVUSxNQUFNLENBQU4sQ0FBVixDQUFQOztBQUVBLFFBQUlHLGdCQUFnQkcsS0FBcEIsRUFBMkI7QUFDekJILGFBQU9ULFVBQVVTLElBQVYsQ0FBUDtBQUNEOztBQUVEQSxXQUFPLDBDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBRUVBLEtBQUtELElBQUwsRUFBV0csSUFBWCxFQUFpQkosVUFBakIsRUFBNkIsQ0FBQyxDQUFDUixZQUFZWSxJQUFaLENBQS9CLENBRkY7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFJSiwyQ0FBcUJBLElBQXJCLEVBQTZCRSxLQUE3QixDQUFtQyxlQUFPLFlBQUlDLEtBQVgsR0FBbUIsWUFBSUEsS0FBdkIsY0FBbkM7QUFKSSxvQkFLRyxlQUxIOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQUQsSUFBUDtBQVFELEdBaEJELE1BZ0JPO0FBQ0xMLFdBQU9NLFFBQVFDLEdBQVIsQ0FBWVYsTUFBTVcsR0FBTjtBQUFBLDREQUFVLGtCQUFNTixJQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN2Qk8sb0JBRHVCLEdBQ2hCcEIsVUFBVWEsSUFBVixDQURnQjs7O0FBRzNCLG9CQUFJTyxnQkFBZ0JOLEtBQXBCLEVBQTJCO0FBQ3pCTSx5QkFBT2xCLFVBQVVrQixJQUFWLENBQVA7QUFDRDs7QUFMMEI7QUFBQTtBQUFBLHVCQVFuQkEsS0FBS1YsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixFQUE2QixDQUFDLENBQUNSLFlBQVlZLElBQVosQ0FBL0IsQ0FSbUI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFVekIsNkNBQXFCQSxJQUFyQixFQUE2QkUsS0FBN0IsQ0FBbUMsYUFBSUMsS0FBSixnQkFBbkM7QUFWeUIsc0JBV2xCLGVBWGtCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQVY7O0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFBWixDQUFQO0FBY0Q7O0FBRUQsU0FBT0wsSUFBUDtBQUNELENBckNNIiwiZmlsZSI6ImdvYWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZVdhdGNoIGZyb20gJy4vd2F0Y2gnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3BhcmFsbGVsJ1xuXG5sZXQgdGFza0RlZm5zXG5sZXQgYnVzdGVkVGFza3NcblxuZnVuY3Rpb24gZnJvbUFycmF5KGFycikge1xuICBpZiAoYXJyWzBdID09PSAncGFyYWxsZWwnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVBhcmFsbGVsKGFyclsxXSlcbiAgfVxuICBcbiAgcmV0dXJuIGNyZWF0ZVdhdGNoKGFyclsxXSlcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmluZVRhc2tzID0gKGRlZm5zLCBidXN0ZWQpID0+IHtcbiAgdGFza0RlZm5zID0gZGVmbnNcbiAgYnVzdGVkVGFza3MgPSBidXN0ZWRcblxuICBjcmVhdGVQYXJhbGxlbC5kZWZpbmVUYXNrcyhkZWZucywgYnVzdGVkKVxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlID0gKHRhc2tzLCBwcm9qZWN0RGlyLCBtb2RlID0gJ3N0YXJ0JykgPT4ge1xuICBsZXQgZ29hbFxuXG4gIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbmFtZSA9IHRhc2tzWzBdXG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gZnJvbUFycmF5KGdvYWwpXG4gICAgfVxuXG4gICAgZ29hbCA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBnb2FsW21vZGVdKG5hbWUsIHByb2plY3REaXIsICEhYnVzdGVkVGFza3NbbmFtZV0pXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIgJiYgZXJyLnN0YWNrID8gZXJyLnN0YWNrIDogZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKClcbiAgfSBlbHNlIHtcbiAgICBnb2FsID0gUHJvbWlzZS5hbGwodGFza3MubWFwKGFzeW5jIG5hbWUgPT4ge1xuICAgICAgbGV0IHRhc2sgPSB0YXNrRGVmbnNbbmFtZV1cblxuICAgICAgaWYgKHRhc2sgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXNrID0gZnJvbUFycmF5KHRhc2spXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRhc2tbbW9kZV0obmFtZSwgcHJvamVjdERpciwgISFidXN0ZWRUYXNrc1tuYW1lXSlcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cblxuICByZXR1cm4gZ29hbFxufVxuIl19