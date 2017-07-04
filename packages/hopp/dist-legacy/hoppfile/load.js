'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function (file) {
  // if bad args die
  if (typeof file !== 'string') {
    throw new Error('Unknown arguments');
  }

  // get file stat
  var lmod = +(0, _fs.statSync)(file).mtime;

  // try to load from cache
  var state = {};
  var _ref = cache.val('_') || [];

  var _ref2 = _slicedToArray(_ref, 2);

  state.lmod = _ref2[0];
  state.tasks = _ref2[1];


  if (state.lmod === lmod) {
    return [true, {}, state.tasks];
  }

  // load via require
  var tasks = require(file);

  // figure out which tasks are bust
  state.tasks = state.tasks || {};
  var bustedTasks = {};

  // only try checking for single tasks
  for (var task in tasks) {
    if (tasks.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
      var json = tasks[task].toJSON();

      if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
        bustedTasks[task] = true;
      }
    }
  }

  // cache exports
  cache.val('_', /function|=>/.test((0, _fs.readFileSync)(require.resolve(file), 'utf8'))

  // if any functions exist, we can't cache the file
  ? [0, null]

  // otherwise, cache normally
  : [lmod, tasks]);

  // return exports
  return [false, bustedTasks, tasks];
};

//# sourceMappingURL=load.js.map