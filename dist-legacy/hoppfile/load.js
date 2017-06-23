'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('../fs');

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _utils = require('../utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/utils/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
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
            return (0, _fs.stat)(file);

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
            cache.val('_', [lmod, tasks]);

            // return exports
            return _context.abrupt('return', [false, bustedTasks, tasks]);

          case 18:
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