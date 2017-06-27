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

var _createLogger = (0, _log2.default)('hopp'),
    error = _createLogger.error;

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

  /**
   * Set timeout for hung tasks.
   */
  if (mode === 'start') {
    setTimeout(function () {
      error('Timeout exceeded! A task is hung.');
      process.exit(-1);
    }, 10 * 60 * 1000);
  }

  /**
   * If single task, don't bother wrapping with .all().
   */
  if (tasks.length === 1) {
    var name = tasks[0];
    var goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal);
    }

    return goal[mode](name, projectDir, !!bustedTasks[name]);
  }

  /**
   * Otherwise wrap all.
   */
  return Promise.all(tasks.map(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name) {
      var task;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              task = taskDefns[name];


              if (task instanceof Array) {
                task = fromArray(task);
              }

              return _context.abrupt('return', task[mode](name, projectDir, !!bustedTasks[name]));

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  }()));
};

//# sourceMappingURL=goal.js.map