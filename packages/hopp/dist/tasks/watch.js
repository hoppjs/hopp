'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _goal = require('./goal');

var Goal = _interopRequireWildcard(_goal);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Creates a Hopp-ish object that runs
 * subtasks in watch mode.
 */
exports.default = tasks => ({
  /**
   * Starts all tasks in watch mode.
   *
   * @return {Promise} joins all watch promises under .all()
   */
  start(name, directory) {
    if (process.env.SKIP_BUILD === 'true') {
      throw new Error('Can\'t skip builds on a watch task.');
    }

    return Goal.create(tasks, directory, 'watch');
  },

  /**
   * Converts tasks to JSON.
   * Just converts them into an array of
   * JSON objects.
   *
   * @return {Array}
   */
  toJSON() {
    return ['watch', tasks];
  }
}); /**
     * @file src/plugins/watch.js
     * @license MIT
     * @copyright 2017 10244872 Canada Inc.
     */
//# sourceMappingURL=watch.js.map