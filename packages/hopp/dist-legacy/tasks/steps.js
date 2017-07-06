'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

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
    start(name, directory) {
      var _this = this;

      return (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee() {
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
                  _context.next = 14;
                  break;
                }

                task = _step.value;

                if (!(task.indexOf(':') !== -1)) {
                  _context.next = 9;
                  break;
                }

                throw new Error('You cannot use `:` in a task name. It is a restricted token.');

              case 9:
                _context.next = 11;
                return (0, _bluebird.resolve)(taskTree[task].start(`${name}:${task}`, directory, !!bustedTasks[task]));

              case 11:
                _iteratorNormalCompletion = true;
                _context.next = 5;
                break;

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context['catch'](3);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[3, 16, 20, 28], [21,, 23, 27]]);
      }))();
    },

    /**
     * Watch all subtasks.
     */
    watch(name, directory) {
      return (0, _bluebird.all)(tasks.map(function (task) {
        if (task.indexOf(':') !== -1) {
          throw new Error('You cannot use `:` in a task name. It is a restricted token.');
        }

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
    toJSON() {
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