'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = exports.defineTasks = undefined;

var _watch = require('./watch');

var _watch2 = _interopRequireDefault(_watch);

var _steps = require('./steps');

var _steps2 = _interopRequireDefault(_steps);

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

  if (arr[0] === 'steps') {
    return (0, _steps2.default)(arr[1]);
  }

  return (0, _watch2.default)(arr[1]);
}

var defineTasks = exports.defineTasks = function defineTasks(defns, busted) {
  taskDefns = defns;
  bustedTasks = busted;

  _steps2.default.defineTasks(defns, busted);
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
//# sourceMappingURL=goal.js.map