'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * @file src/plugins/steps.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

let taskTree;
let bustedTasks;

/**
 * Creates a Hopp-ish object that runs
 * subtasks in steps.
 */
const steps = tasks => ({
  /**
   * Starts all tasks one by one.
   *
   * @return {Promise} a promise that will be resolved when all tasks are done
   */
  start(name, directory) {
    return _asyncToGenerator(function* () {
      for (let task of tasks) {
        yield taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task]);
      }
    })();
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an tasksay of
   * JSON objects.
   *
   * @return {tasksay}
   */
  toJSON() {
    return ['steps', tasks];
  }
});

steps.defineTasks = (defns, busted) => {
  taskTree = defns;
  bustedTasks = busted;
};

exports.default = steps;