'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_JOBS = _os2.default.cpus().length; /**
                                            * @file src/plugins/parallel.js
                                            * @license MIT
                                            * @copyright 2017 10244872 Canada Inc.
                                            */

var _createLogger = (0, _utils.createLogger)('hopp'),
    debug = _createLogger.debug;

var taskTree = void 0;
var bustedTasks = void 0;

/**
 * Run all tasks in parallel.
 */
function runParallel(jobs, tasks, name, directory) {
  return new _bluebird2.default(function (resolve, reject) {
    if (_cluster2.default.isMaster) {
      if (tasks.length < jobs) {
        debug('starting %s jobs, 1 task per job', tasks.length);

        for (var i = 0; i < tasks.length; i++) {
          _cluster2.default.fork({
            JOB_START: i,
            JOB_SIZE: 1
          });
        }
      } else {
        var tasksPerJob = Math.floor(tasks.length / jobs);
        debug('starting %s jobs, %s tasks per job', jobs, tasksPerJob);

        // start all but last job
        for (var _i = 0; _i < jobs; _i++) {
          _cluster2.default.fork({
            JOB_START: _i * tasksPerJob,
            JOB_SIZE: _i === MAX_JOBS - 1 ? MAX_JOBS - tasksPerJob * (_i - 1) : tasksPerJob
          });
        }
      }

      // wait for the end of all the jobs
      var ndone = 0;

      _cluster2.default.on('exit', function (id, code) {
        ndone++;

        // if any worker fails, reject the promise
        if (code !== 0) {
          return reject(new Error(`Job ${id} failed.`));
        }

        // once all workers successfully return, resolve promise
        if (ndone === Math.min(tasks.length, jobs)) {
          resolve();
        }
      });
    } else {
      var FIRST_JOB = parseInt(process.env.JOB_START, 10);
      var LAST_JOB = parseInt(process.env.JOB_START, 10) + parseInt(process.env.JOB_SIZE, 10);

      // grab slice of tasks that this worker should do
      var subtasks = tasks.slice(FIRST_JOB, LAST_JOB);

      // run in async
      runAsync(subtasks, name, directory).then(function () {
        return process.exit(0);
      }).catch(function (err) {
        console.error(err && err.stack ? err.stack : err);
        process.exit(-1);
      });
    }
  });
}

/**
 * Run all tasks in async.
 */
function runAsync(tasks, name, directory) {
  // just async for now
  debug('running %s tasks in async', tasks.length);
  return (0, _bluebird.all)(tasks.map(function (task) {
    return runTask(task, name, directory);
  }));
}

/**
 * Run individual task.
 */
function runTask(task, name, directory) {
  return taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task]);
}

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
    start(name, directory) {
      var jobs = parseInt(process.env.WEB_CONCURRENCY);

      // if jobs not specified, just stick to async
      if (isNaN(jobs)) return runAsync(tasks, name, directory);

      // disallow negatives
      if (jobs < 0) throw new Error('Negative number of jobs not supported.');

      // if zero, assume max
      if (jobs === 0) jobs = MAX_JOBS;

      // run parallel
      return runParallel(jobs, tasks, name, directory);
    },

    /**
     * Converts tasks to JSON.
     * Just converts them into an tasksay of
     * JSON objects.
     *
     * @return {tasksay}
     */
    toJSON() {
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