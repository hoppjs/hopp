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

function fromArray(arr, taskDefns) {
  if (arr[0] === 'parallel') {
    return (0, _parallel2.default)(arr, taskDefns);
  }

  return (0, _watch2.default)(arr);
}

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
      goal = fromArray(goal, taskDefns);
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
                  task = fromArray(task, taskDefns);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9nb2FsLmpzIl0sIm5hbWVzIjpbInRhc2tEZWZucyIsImZyb21BcnJheSIsImFyciIsImRlZmluZVRhc2tzIiwiZGVmbnMiLCJjcmVhdGUiLCJ0YXNrcyIsInByb2plY3REaXIiLCJtb2RlIiwiZ29hbCIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsImVycm9yIiwic3RhY2siLCJQcm9taXNlIiwiYWxsIiwibWFwIiwidGFzayJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7OzJjQVJBOzs7Ozs7QUFVQSxJQUFJQSxrQkFBSjs7QUFFQSxTQUFTQyxTQUFULENBQW1CQyxHQUFuQixFQUF3QkYsU0FBeEIsRUFBbUM7QUFDakMsTUFBSUUsSUFBSSxDQUFKLE1BQVcsVUFBZixFQUEyQjtBQUN6QixXQUFPLHdCQUFlQSxHQUFmLEVBQW9CRixTQUFwQixDQUFQO0FBQ0Q7O0FBRUQsU0FBTyxxQkFBWUUsR0FBWixDQUFQO0FBQ0Q7O0FBRU0sSUFBTUMsb0NBQWMsU0FBZEEsV0FBYyxRQUFTO0FBQ2xDSCxjQUFZSSxLQUFaO0FBQ0QsQ0FGTTs7QUFJQSxJQUFNQywwQkFBUyxTQUFUQSxNQUFTLENBQUNDLEtBQUQsRUFBUUMsVUFBUixFQUF1QztBQUFBLE1BQW5CQyxJQUFtQix1RUFBWixPQUFZOztBQUMzRCxNQUFJQyxhQUFKOztBQUVBLE1BQUlILE1BQU1JLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDdEIsUUFBSUMsT0FBT0wsTUFBTSxDQUFOLENBQVg7QUFDQUcsV0FBT1QsVUFBVU0sTUFBTSxDQUFOLENBQVYsQ0FBUDs7QUFFQSxRQUFJRyxnQkFBZ0JHLEtBQXBCLEVBQTJCO0FBQ3pCSCxhQUFPUixVQUFVUSxJQUFWLEVBQWdCVCxTQUFoQixDQUFQO0FBQ0Q7O0FBRURTLFdBQU8sMENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFFRUEsS0FBS0QsSUFBTCxFQUFXRyxJQUFYLEVBQWlCSixVQUFqQixDQUZGOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBSUosMkNBQXFCSSxJQUFyQixFQUE2QkUsS0FBN0IsQ0FBbUMsWUFBSUMsS0FBSixlQUFuQztBQUpJLG9CQUtHLGVBTEg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBRCxJQUFQO0FBUUQsR0FoQkQsTUFnQk87QUFDTEwsV0FBT00sUUFBUUMsR0FBUixDQUFZVixNQUFNVyxHQUFOO0FBQUEsNERBQVUsa0JBQU1OLElBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3ZCTyxvQkFEdUIsR0FDaEJsQixVQUFVVyxJQUFWLENBRGdCOzs7QUFHM0Isb0JBQUlPLGdCQUFnQk4sS0FBcEIsRUFBMkI7QUFDekJNLHlCQUFPakIsVUFBVWlCLElBQVYsRUFBZ0JsQixTQUFoQixDQUFQO0FBQ0Q7O0FBTDBCO0FBQUE7QUFBQSx1QkFRbkJrQixLQUFLVixJQUFMLEVBQVdHLElBQVgsRUFBaUJKLFVBQWpCLENBUm1COztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBVXpCLDZDQUFxQkksSUFBckIsRUFBNkJFLEtBQTdCLENBQW1DLGFBQUlDLEtBQUosZ0JBQW5DO0FBVnlCLHNCQVdsQixlQVhrQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFWOztBQUFBO0FBQUE7QUFBQTtBQUFBLFFBQVosQ0FBUDtBQWNEOztBQUVELFNBQU9MLElBQVA7QUFDRCxDQXJDTSIsImZpbGUiOiJnb2FsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBjcmVhdGVXYXRjaCBmcm9tICcuL3dhdGNoJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUGFyYWxsZWwgZnJvbSAnLi9wYXJhbGxlbCdcblxubGV0IHRhc2tEZWZuc1xuXG5mdW5jdGlvbiBmcm9tQXJyYXkoYXJyLCB0YXNrRGVmbnMpIHtcbiAgaWYgKGFyclswXSA9PT0gJ3BhcmFsbGVsJykge1xuICAgIHJldHVybiBjcmVhdGVQYXJhbGxlbChhcnIsIHRhc2tEZWZucylcbiAgfVxuICBcbiAgcmV0dXJuIGNyZWF0ZVdhdGNoKGFycilcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmluZVRhc2tzID0gZGVmbnMgPT4ge1xuICB0YXNrRGVmbnMgPSBkZWZuc1xufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlID0gKHRhc2tzLCBwcm9qZWN0RGlyLCBtb2RlID0gJ3N0YXJ0JykgPT4ge1xuICBsZXQgZ29hbFxuXG4gIGlmICh0YXNrcy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbmFtZSA9IHRhc2tzWzBdXG4gICAgZ29hbCA9IHRhc2tEZWZuc1t0YXNrc1swXV1cbiAgICBcbiAgICBpZiAoZ29hbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBnb2FsID0gZnJvbUFycmF5KGdvYWwsIHRhc2tEZWZucylcbiAgICB9XG5cbiAgICBnb2FsID0gKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGdvYWxbbW9kZV0obmFtZSwgcHJvamVjdERpcilcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApLmVycm9yKGVyci5zdGFjayB8fCBlcnIpXG4gICAgICAgIHRocm93ICgnQnVpbGQgZmFpbGVkLicpXG4gICAgICB9XG4gICAgfSkoKVxuICB9IGVsc2Uge1xuICAgIGdvYWwgPSBQcm9taXNlLmFsbCh0YXNrcy5tYXAoYXN5bmMgbmFtZSA9PiB7XG4gICAgICBsZXQgdGFzayA9IHRhc2tEZWZuc1tuYW1lXVxuXG4gICAgICBpZiAodGFzayBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRhc2sgPSBmcm9tQXJyYXkodGFzaywgdGFza0RlZm5zKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0YXNrW21vZGVdKG5hbWUsIHByb2plY3REaXIpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKS5lcnJvcihlcnIuc3RhY2sgfHwgZXJyKVxuICAgICAgICB0aHJvdyAoJ0J1aWxkIGZhaWxlZC4nKVxuICAgICAgfVxuICAgIH0pKVxuICB9XG5cbiAgcmV0dXJuIGdvYWxcbn0iXX0=