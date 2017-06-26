'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (file) {
    // if bad args die
    if (typeof file !== 'string') {
      throw new Error('Unknown arguments');
    }

    // get file stat
    const lmod = +(yield (0, _fs.stat)(file)).mtime;

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
    cache.val('_', /function|=>/.test((yield (0, _fs.readFile)(require.resolve(file), 'utf8')))

    // if any functions exist, we can't cache the file
    ? [0, null]

    // otherwise, cache normally
    : [lmod, tasks]);

    // return exports
    return [false, bustedTasks, tasks];
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();