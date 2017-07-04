'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = exports.defineTasks = undefined;

var _bluebird = require('bluebird');

var _watch = require('./watch');

var _watch2 = _interopRequireDefault(_watch);

var _steps = require('./steps');

var _steps2 = _interopRequireDefault(_steps);

var _parallel = require('./parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var taskDefns = void 0; /**
                         * @file src/tasks/mgr.js
                         * @license MIT
                         * @copyright 2017 10244872 Canada Inc.
                         */

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
   * If single task, don't bother wrapping with .all().
   */
  if (tasks.length === 1) {
    var name = tasks[0];
    var goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal);
    }

    if (!goal) {
      throw new Error(`${name}: no such task.`);
    }

    if (!(mode in goal)) {
      throw new Error(`Cannot run task ${name} in ${mode} mode!`);
    }

    return goal[mode](name, projectDir, !!bustedTasks[name]);
  }

  /**
   * Otherwise wrap all.
   */
  return (0, _bluebird.all)(tasks.map(function (name) {
    var task = taskDefns[name];

    if (task instanceof Array) {
      task = fromArray(task);
    }

    if (!task) {
      throw new Error(`${name}: no such task.`);
    }

    if (!(mode in task)) {
      throw new Error(`Cannot run task ${name} in ${mode} mode!`);
    }

    return task[mode](name, projectDir, !!bustedTasks[name]);
  }));
};

//# sourceMappingURL=goal.js.map