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

var taskTree = void 0;
var bustedTasks = void 0;

/**
 * Creates a Hopp-ish object that runs
 * subtasks in steps.
 */
var steps = function steps(tasks) {
  return {
    /**
     * Starts all tasks one by one.
     *
     * @return {Promise} a promise that will be resolved when all tasks are done
     */
    start: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, directory) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 3;
                _iterator = tasks[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 12;
                  break;
                }

                task = _step.value;
                _context.next = 9;
                return taskTree[task].start(name + ':' + task, directory, !!bustedTasks[task]);

              case 9:
                _iteratorNormalCompletion = true;
                _context.next = 5;
                break;

              case 12:
                _context.next = 18;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](3);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 18:
                _context.prev = 18;
                _context.prev = 19;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 21:
                _context.prev = 21;

                if (!_didIteratorError) {
                  _context.next = 24;
                  break;
                }

                throw _iteratorError;

              case 24:
                return _context.finish(21);

              case 25:
                return _context.finish(18);

              case 26:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 14, 18, 26], [19,, 21, 25]]);
      }));

      function start(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return start;
    }(),


    /**
     * Watch all subtasks.
     */
    watch: function watch(name, directory) {
      return Promise.all(tasks.map(function (task) {
        return taskTree[task].watch(name + ':' + task, directory);
      }));
    },


    /**
     * Converts tasks to JSON.
     * Just converts them into an tasksay of
     * JSON objects.
     *
     * @return {tasksay}
     */
    toJSON: function toJSON() {
      return ['steps', tasks];
    }
  };
};

steps.defineTasks = function (defns, busted) {
  taskTree = defns;
  bustedTasks = busted;
};

exports.default = steps;
//# sourceMappingURL=steps.js.map