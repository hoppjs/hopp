'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mgr = require('./mgr');

var _mgr2 = _interopRequireDefault(_mgr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms parts of the given JSON tree
 * into runnable tasks.
 * @param {Object} tree a tree of serialized tasks
 * @param {Array} tasks list of tasks to be transformed
 */
exports.default = (tree, tasks) => {
  for (let task of tasks) {
    const json = tree[task];

    // only convert single tasks, parallel get
    // converted later
    if (!(json instanceof Array)) {
      tree[task] = new _mgr2.default().fromJSON(json);
    }
  }
}; /**
    * @file src/tasks/tree.js
    * @license MIT
    * @copyright 2017 10244872 Canada Inc.
    */

//# sourceMappingURL=tree.js.map