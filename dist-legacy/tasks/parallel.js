'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @file src/plugins/parallel.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

var taskTree = void 0;
var bustedTasks = void 0;

/**
 * Creates a Hopp-ish object that runs
 * subtasks in parallel.
 */
var parallel = function parallel(tasks) {
  return {
    /**
     * Starts all tasks concurrently.
     *
     * @return {Promise} joins all task promises under .all()
     */
    start: function start(name, directory) {
      // just async for now
      return Promise.all(tasks.map(function (task) {
        return taskTree[task].start(name + ':' + task, directory, !!bustedTasks[task]);
      }));
    },


    /**
     * Converts tasks to JSON.
     * Just converts them into an array of
     * JSON objects.
     *
     * @return {Array}
     */
    toJSON: function toJSON() {
      return ['parallel', tasks];
    }
  };
};

parallel.defineTasks = function (defns, busted) {
  taskTree = defns;
  bustedTasks = busted;
};

exports.default = parallel;
//# sourceMappingURL=parallel.js.map