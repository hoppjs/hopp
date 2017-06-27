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

/**
 * @file src/tasks/mgr.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { error } = (0, _log2.default)('hopp');

let taskDefns;
let bustedTasks;

function fromArray(arr) {
  if (arr[0] === 'parallel') {
    return (0, _parallel2.default)(arr[1]);
  }

  if (arr[0] === 'steps') {
    return (0, _steps2.default)(arr[1]);
  }

  return (0, _watch2.default)(arr[1]);
}

const defineTasks = exports.defineTasks = (defns, busted) => {
  taskDefns = defns;
  bustedTasks = busted;

  _steps2.default.defineTasks(defns, busted);
  _parallel2.default.defineTasks(defns, busted);
};

const create = exports.create = (tasks, projectDir, mode = 'start') => {
  /**
   * Set timeout for hung tasks.
   */
  if (mode === 'start') {
    setTimeout(() => {
      error('Timeout exceeded! A task is hung.');
      process.exit(-1);
    }, 10 * 60 * 1000);
  }

  /**
   * If single task, don't bother wrapping with .all().
   */
  if (tasks.length === 1) {
    let name = tasks[0];
    let goal = taskDefns[tasks[0]];

    if (goal instanceof Array) {
      goal = fromArray(goal);
    }

    return goal[mode](name, projectDir, !!bustedTasks[name]);
  }

  /**
   * Otherwise wrap all.
   */
  return Promise.all(tasks.map(async name => {
    let task = taskDefns[name];

    if (task instanceof Array) {
      task = fromArray(task);
    }

    return task[mode](name, projectDir, !!bustedTasks[name]);
  }));
};

//# sourceMappingURL=goal.js.map