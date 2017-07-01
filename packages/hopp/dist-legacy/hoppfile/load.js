'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

var _fs = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function () {
  var _ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(file) {
    var lmod, state, _ref2, _ref3, tasks, bustedTasks, task, json;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof file !== 'string')) {
              _context.next = 2;
              break;
            }

            throw new Error('Unknown arguments');

          case 2:
            _context.next = 4;
            return (0, _bluebird.resolve)((0, _fs.stat)(file));

          case 4:
            lmod = +_context.sent.mtime;


            // try to load from cache
            state = {};
            _ref2 = cache.val('_') || [];
            _ref3 = _slicedToArray(_ref2, 2);
            state.lmod = _ref3[0];
            state.tasks = _ref3[1];

            if (!(state.lmod === lmod)) {
              _context.next = 12;
              break;
            }

            return _context.abrupt('return', [true, {}, state.tasks]);

          case 12:

            // load via require
            tasks = require(file);

            // figure out which tasks are bust

            state.tasks = state.tasks || {};
            bustedTasks = {};

            // only try checking for single tasks

            for (task in tasks) {
              if (tasks.hasOwnProperty(task) && state.tasks.hasOwnProperty(task)) {
                json = tasks[task].toJSON();


                if (!(json instanceof Array) && !(0, _utils.deepEqual)(json, state.tasks[task])) {
                  bustedTasks[task] = true;
                }
              }
            }

            // cache exports
            _context.t0 = cache;
            _context.t1 = /function|=>/;
            _context.next = 20;
            return (0, _bluebird.resolve)((0, _fs.readFile)(require.resolve(file), 'utf8'));

          case 20:
            _context.t2 = _context.sent;

            if (!_context.t1.test.call(_context.t1, _context.t2)) {
              _context.next = 25;
              break;
            }

            _context.t3 =

            // if any functions exist, we can't cache the file
            [0, null]

            // otherwise, cache normally
            ;
            _context.next = 26;
            break;

          case 25:
            _context.t3 = [lmod, tasks];

          case 26:
            _context.t4 = _context.t3;

            _context.t0.val.call(_context.t0, '_', _context.t4);

            return _context.abrupt('return', [false, bustedTasks, tasks]);

          case 29:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

//# sourceMappingURL=load.js.map