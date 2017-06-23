'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = async file => {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments');
  }

  // get file stat
  const lmod = +(await (0, _fs.stat)(file)).mtime;

  // try to load from cache
  const state = {};[state.lmod, state.tasks] = cache.val('_') || [];

  if (state.lmod === lmod) {
    return [true, {}, state.tasks];
  }

  // load via require
  const tasks = require(file);

  // figure out which tasks are bust
  state.tasks = state.tasks || {};
  const bustedTasks = {};

  // only try checking for single tasks
  for (let task in tasks) {
    if (tasks.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
      const json = tasks[task].toJSON();

      if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
        bustedTasks[task] = true;
      }
    }
  }

  // cache exports
  cache.val('_', [lmod, tasks]);

  // return exports
  return [false, bustedTasks, tasks];
}; /**
    * @file src/utils/load.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */
//# sourceMappingURL=load.js.map