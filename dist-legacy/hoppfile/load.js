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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob3BwZmlsZS9sb2FkLmpzIl0sIm5hbWVzIjpbImNhY2hlIiwiZmlsZSIsIkVycm9yIiwibG1vZCIsIm10aW1lIiwic3RhdGUiLCJ2YWwiLCJ0YXNrcyIsInJlcXVpcmUiLCJidXN0ZWRUYXNrcyIsInRhc2siLCJoYXNPd25Qcm9wZXJ0eSIsImpzb24iLCJ0b0pTT04iLCJBcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFNQTs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OzsyY0FSQTs7Ozs7Ozt1REFVZSxpQkFBTUMsSUFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBRVIsT0FBT0EsSUFBUCxLQUFnQixRQUZSO0FBQUE7QUFBQTtBQUFBOztBQUFBLGtCQUdMLElBQUlDLEtBQUosQ0FBVSxtQkFBVixDQUhLOztBQUFBO0FBQUE7QUFBQSxtQkFPUSxjQUFLRCxJQUFMLENBUFI7O0FBQUE7QUFPUEUsZ0JBUE8sa0JBT29CQyxLQVBwQjs7O0FBU2I7QUFDTUMsaUJBVk8sR0FVQyxFQVZEO0FBQUEsb0JBV2dCTCxNQUFNTSxHQUFOLENBQVUsR0FBVixLQUFrQixFQVhsQztBQUFBO0FBV1hELGtCQUFNRixJQVhLO0FBV0NFLGtCQUFNRSxLQVhQOztBQUFBLGtCQWFURixNQUFNRixJQUFOLEtBQWVBLElBYk47QUFBQTtBQUFBO0FBQUE7O0FBQUEsNkNBY0osQ0FBQyxJQUFELEVBQU8sRUFBUCxFQUFXRSxNQUFNRSxLQUFqQixDQWRJOztBQUFBOztBQWlCYjtBQUNNQSxpQkFsQk8sR0FrQkNDLFFBQVFQLElBQVIsQ0FsQkQ7O0FBb0JiOztBQUNBSSxrQkFBTUUsS0FBTixHQUFjRixNQUFNRSxLQUFOLElBQWUsRUFBN0I7QUFDTUUsdUJBdEJPLEdBc0JPLEVBdEJQOztBQXdCYjs7QUFDQSxpQkFBU0MsSUFBVCxJQUFpQkgsS0FBakIsRUFBd0I7QUFDdEIsa0JBQUlBLE1BQU1JLGNBQU4sQ0FBcUJELElBQXJCLEtBQThCTCxNQUFNRSxLQUFOLENBQVlJLGNBQVosQ0FBMkJELElBQTNCLENBQWxDLEVBQW9FO0FBQzVERSxvQkFENEQsR0FDckRMLE1BQU1HLElBQU4sRUFBWUcsTUFBWixFQURxRDs7O0FBR2xFLG9CQUFJLEVBQUVELGdCQUFnQkUsS0FBbEIsS0FBNEIsQ0FBQyxzQkFBVUYsSUFBVixFQUFnQlAsTUFBTUUsS0FBTixDQUFZRyxJQUFaLENBQWhCLENBQWpDLEVBQXFFO0FBQ25FRCw4QkFBWUMsSUFBWixJQUFvQixJQUFwQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBVixrQkFBTU0sR0FBTixDQUFVLEdBQVYsRUFBZSxDQUNiSCxJQURhLEVBRWJJLEtBRmEsQ0FBZjs7QUFLQTtBQXpDYSw2Q0EwQ04sQ0FBQyxLQUFELEVBQVFFLFdBQVIsRUFBcUJGLEtBQXJCLENBMUNNOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJmaWxlIjoibG9hZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3V0aWxzL2xvYWQuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IHsgc3RhdCB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgeyBkZWVwRXF1YWwgfSBmcm9tICcuLi91dGlscydcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZmlsZSA9PiB7XG4gIC8vIGlmIGJhZCBhcmdzIGRpZVxuICBpZiAoIHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gYXJndW1lbnRzJylcbiAgfVxuXG4gIC8vIGdldCBmaWxlIHN0YXRcbiAgY29uc3QgbG1vZCA9ICsoYXdhaXQgc3RhdChmaWxlKSkubXRpbWVcblxuICAvLyB0cnkgdG8gbG9hZCBmcm9tIGNhY2hlXG4gIGNvbnN0IHN0YXRlID0ge31cbiAgO1tzdGF0ZS5sbW9kLCBzdGF0ZS50YXNrc10gPSBjYWNoZS52YWwoJ18nKSB8fCBbXVxuXG4gIGlmIChzdGF0ZS5sbW9kID09PSBsbW9kKSB7XG4gICAgcmV0dXJuIFt0cnVlLCB7fSwgc3RhdGUudGFza3NdXG4gIH1cblxuICAvLyBsb2FkIHZpYSByZXF1aXJlXG4gIGNvbnN0IHRhc2tzID0gcmVxdWlyZShmaWxlKVxuXG4gIC8vIGZpZ3VyZSBvdXQgd2hpY2ggdGFza3MgYXJlIGJ1c3RcbiAgc3RhdGUudGFza3MgPSBzdGF0ZS50YXNrcyB8fCB7fVxuICBjb25zdCBidXN0ZWRUYXNrcyA9IHt9XG5cbiAgLy8gb25seSB0cnkgY2hlY2tpbmcgZm9yIHNpbmdsZSB0YXNrc1xuICBmb3IgKGxldCB0YXNrIGluIHRhc2tzKSB7XG4gICAgaWYgKHRhc2tzLmhhc093blByb3BlcnR5KHRhc2spICYmIHN0YXRlLnRhc2tzLmhhc093blByb3BlcnR5KHRhc2spKSB7XG4gICAgICBjb25zdCBqc29uID0gdGFza3NbdGFza10udG9KU09OKClcblxuICAgICAgaWYgKCEoanNvbiBpbnN0YW5jZW9mIEFycmF5KSAmJiAhZGVlcEVxdWFsKGpzb24sIHN0YXRlLnRhc2tzW3Rhc2tdKSkge1xuICAgICAgICBidXN0ZWRUYXNrc1t0YXNrXSA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBjYWNoZSBleHBvcnRzXG4gIGNhY2hlLnZhbCgnXycsIFtcbiAgICBsbW9kLFxuICAgIHRhc2tzXG4gIF0pXG5cbiAgLy8gcmV0dXJuIGV4cG9ydHNcbiAgcmV0dXJuIFtmYWxzZSwgYnVzdGVkVGFza3MsIHRhc2tzXVxufVxuIl19