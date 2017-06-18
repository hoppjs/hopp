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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/tasks/mgr.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var taskDefns = void 0;

var defineTasks = exports.defineTasks = function defineTasks(defns) {
  taskDefns = defns;
};

var create = exports.create = function create(tasks, projectDir) {
  var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'start';

  var goal = void 0;

  if (tasks.length === 1) {
    var name = tasks[0];
    goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = (0, _parallel2.default)(goal, taskDefns);
    }

    goal = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return goal[mode](name, projectDir);

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
                  task = (0, _parallel2.default)(task, taskDefns);
                }

                _context2.prev = 2;
                _context2.next = 5;
                return task[mode](name, projectDir);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImRlZmluZVRhc2tzIiwiZGVmbnMiLCJjcmVhdGUiLCJ0YXNrcyIsInByb2plY3REaXIiLCJtb2RlIiwiZ29hbCIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsImVycm9yIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7OzsyY0FQQTs7Ozs7O0FBU0EsSUFBSUEsa0JBQUo7O0FBRU8sSUFBTUMsb0NBQWMsU0FBZEEsV0FBYyxRQUFTO0FBQ2xDRCxjQUFZRSxLQUFaO0FBQ0QsQ0FGTTs7QUFJQSxJQUFNQywwQkFBUyxTQUFUQSxNQUFTLENBQUNDLEtBQUQsRUFBUUMsVUFBUixFQUF1QztBQUFBLE1BQW5CQyxJQUFtQix1RUFBWixPQUFZOztBQUMzRCxNQUFJQyxhQUFKOztBQUVBLE1BQUlILE1BQU1JLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsUUFBSUMsT0FBT0wsTUFBTSxDQUFOLENBQVg7QUFDQUcsV0FBT1AsVUFBVUksTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxRQUFJRyxnQkFBZ0JHLEtBQXBCLEVBQTJCO0FBQ3pCSCxhQUFPLHdCQUFlQSxJQUFmLEVBQXFCUCxTQUFyQixDQUFQO0FBQ0Q7O0FBRURPLFdBQU8sMENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFFRUEsS0FBS0QsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUZGOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBSUosMkNBQXFCSSxJQUFyQixFQUE2QkUsS0FBN0IsQ0FBbUMsWUFBSUMsS0FBSixlQUFuQztBQUpJLG9CQUtHLGVBTEg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBRCxJQUFQO0FBUUQsR0FoQkQsTUFnQk87QUFDTEwsV0FBT00sUUFBUUMsR0FBUixDQUFZVixNQUFNVyxHQUFOO0FBQUEsNERBQVUsa0JBQU1OLElBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3ZCTyxvQkFEdUIsR0FDaEJoQixVQUFVUyxJQUFWLENBRGdCOzs7QUFHM0Isb0JBQUlPLGdCQUFnQk4sS0FBcEIsRUFBMkI7QUFDekJNLHlCQUFPLHdCQUFlQSxJQUFmLEVBQXFCaEIsU0FBckIsQ0FBUDtBQUNEOztBQUwwQjtBQUFBO0FBQUEsdUJBUW5CZ0IsS0FBS1YsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQVJtQjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQVV6Qiw2Q0FBcUJJLElBQXJCLEVBQTZCRSxLQUE3QixDQUFtQyxhQUFJQyxLQUFKLGdCQUFuQztBQVZ5QixzQkFXbEIsZUFYa0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBVjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUFaLENBQVA7QUFjRDs7QUFFRCxTQUFPTCxJQUFQO0FBQ0QsQ0FyQ00iLCJmaWxlIjoiZ29hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcbmltcG9ydCBjcmVhdGVQYXJhbGxlbCBmcm9tICcuL3BhcmFsbGVsJ1xuXG5sZXQgdGFza0RlZm5zXG5cbmV4cG9ydCBjb25zdCBkZWZpbmVUYXNrcyA9IGRlZm5zID0+IHtcbiAgdGFza0RlZm5zID0gZGVmbnNcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9ICh0YXNrcywgcHJvamVjdERpciwgbW9kZSA9ICdzdGFydCcpID0+IHtcbiAgbGV0IGdvYWxcblxuICBpZiAodGFza3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IG5hbWUgPSB0YXNrc1swXVxuICAgIGdvYWwgPSB0YXNrRGVmbnNbdGFza3NbMF1dXG4gICAgXG4gICAgaWYgKGdvYWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZ29hbCA9IGNyZWF0ZVBhcmFsbGVsKGdvYWwsIHRhc2tEZWZucylcbiAgICB9XG5cbiAgICBnb2FsID0gKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGdvYWxbbW9kZV0obmFtZSwgcHJvamVjdERpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkoKVxuICB9IGVsc2Uge1xuICAgIGdvYWwgPSBQcm9taXNlLmFsbCh0YXNrcy5tYXAoYXN5bmMgbmFtZSA9PiB7XG4gICAgICBsZXQgdGFzayA9IHRhc2tEZWZuc1tuYW1lXVxuXG4gICAgICBpZiAodGFzayBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRhc2sgPSBjcmVhdGVQYXJhbGxlbCh0YXNrLCB0YXNrRGVmbnMpXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRhc2tbbW9kZV0obmFtZSwgcHJvamVjdERpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkpXG4gIH1cblxuICByZXR1cm4gZ29hbFxufSJdfQ==