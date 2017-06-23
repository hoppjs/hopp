'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * @file src/utils/load.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

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
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ0YXNrcyIsInZhbCIsInJlcXVpcmUiLCJidXN0ZWRUYXNrcyIsInRhc2siLCJoYXNPd25Qcm9wZXJ0eSIsImpzb24iLCJ0b0pTT04iLCJBcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7O0FBQ0E7Ozs7QUFUQTs7Ozs7O2tCQVdlLE1BQU1DLElBQU4sSUFBYztBQUMzQjtBQUNBLE1BQUssT0FBT0EsSUFBUCxLQUFnQixRQUFyQixFQUFnQztBQUM5QixVQUFNLElBQUlDLEtBQUosQ0FBVSxtQkFBVixDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFNQyxPQUFPLENBQUMsQ0FBQyxNQUFNLGNBQUtGLElBQUwsQ0FBUCxFQUFtQkcsS0FBakM7O0FBRUE7QUFDQSxRQUFNQyxRQUFRLEVBQWQsQ0FDQyxDQUFDQSxNQUFNRixJQUFQLEVBQWFFLE1BQU1DLEtBQW5CLElBQTRCTixNQUFNTyxHQUFOLENBQVUsR0FBVixLQUFrQixFQUE5Qzs7QUFFRCxNQUFJRixNQUFNRixJQUFOLEtBQWVBLElBQW5CLEVBQXlCO0FBQ3ZCLFdBQU8sQ0FBQyxJQUFELEVBQU8sRUFBUCxFQUFXRSxNQUFNQyxLQUFqQixDQUFQO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFNQSxRQUFRRSxRQUFRUCxJQUFSLENBQWQ7O0FBRUE7QUFDQUksUUFBTUMsS0FBTixHQUFjRCxNQUFNQyxLQUFOLElBQWUsRUFBN0I7QUFDQSxRQUFNRyxjQUFjLEVBQXBCOztBQUVBO0FBQ0EsT0FBSyxJQUFJQyxJQUFULElBQWlCSixLQUFqQixFQUF3QjtBQUN0QixRQUFJQSxNQUFNSyxjQUFOLENBQXFCRCxJQUFyQixLQUE4QkwsTUFBTUMsS0FBTixDQUFZSyxjQUFaLENBQTJCRCxJQUEzQixDQUFsQyxFQUFvRTtBQUNsRSxZQUFNRSxPQUFPTixNQUFNSSxJQUFOLEVBQVlHLE1BQVosRUFBYjs7QUFFQSxVQUFJLEVBQUVELGdCQUFnQkUsS0FBbEIsS0FBNEIsQ0FBQyxzQkFBVUYsSUFBVixFQUFnQlAsTUFBTUMsS0FBTixDQUFZSSxJQUFaLENBQWhCLENBQWpDLEVBQXFFO0FBQ25FRCxvQkFBWUMsSUFBWixJQUFvQixJQUFwQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBVixRQUFNTyxHQUFOLENBQVUsR0FBVixFQUFlLENBQ2JKLElBRGEsRUFFYkcsS0FGYSxDQUFmOztBQUtBO0FBQ0EsU0FBTyxDQUFDLEtBQUQsRUFBUUcsV0FBUixFQUFxQkgsS0FBckIsQ0FBUDtBQUNELEMiLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCB7IGRlZXBFcXVhbCB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9mcydcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIHN0YXRcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCB7fSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBsb2FkIHZpYSByZXF1aXJlXG4gIGNvbnN0IHRhc2tzID0gcmVxdWlyZShmaWxlKVxuXG4gIC8vIGZpZ3VyZSBvdXQgd2hpY2ggdGFza3MgYXJlIGJ1c3RcbiAgc3RhdGUudGFza3MgPSBzdGF0ZS50YXNrcyB8fCB7fVxuICBjb25zdCBidXN0ZWRUYXNrcyA9IHt9XG5cbiAgLy8gb25seSB0cnkgY2hlY2tpbmcgZm9yIHNpbmdsZSB0YXNrc1xuICBmb3IgKGxldCB0YXNrIGluIHRhc2tzKSB7XG4gICAgaWYgKHRhc2tzLmhhc093blByb3BlcnR5KHRhc2spICYmIHN0YXRlLnRhc2tzLmhhc093blByb3BlcnR5KHRhc2spKSB7XG4gICAgICBjb25zdCBqc29uID0gdGFza3NbdGFza10udG9KU09OKClcblxuICAgICAgaWYgKCEoanNvbiBpbnN0YW5jZW9mIEFycmF5KSAmJiAhZGVlcEVxdWFsKGpzb24sIHN0YXRlLnRhc2tzW3Rhc2tdKSkge1xuICAgICAgICBidXN0ZWRUYXNrc1t0YXNrXSA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBsbW9kLFxuICAgIHRhc2tzXG4gIF0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgYnVzdGVkVGFza3MsIHRhc2tzXVxufVxuIl19