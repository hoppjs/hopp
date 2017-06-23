'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _loadPlugins = require('./tasks/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { debug } = require('./utils/log')('hopp');

/**
 * Create hopp object based on plugins.
 */
/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc..
 */

exports.default = async directory => {
  ;(await (0, _loadPlugins2.default)(directory)).forEach(name => {
    let plugName = '';

    for (let tmp = _path2.default.basename(name), i = 12; i < tmp.length; i += 1) {
      plugName += tmp[i] === '-' ? tmp[i++].toUpperCase() : tmp[i];
    }

    debug('adding plugin %s from %s', plugName, name);

    // add the plugin to the hopp prototype so it can be
    // used for the rest of the build process
    _mgr2.default.prototype[plugName] = function () {
      // instead of actually loading the plugin at this stage,
      // we will just pop its call into our internal call stack
      // for use later. this is useful when we are stepping through
      // an entire hoppfile but might only be running a single task

      this.d.stack.push([name, [].slice.call(arguments)]);

      return this;
    };
  });

  /**
   * Expose hopp class for task creation.
   */
  const init = src => new _mgr2.default(src);

  init.all = _parallel2.default;
  init.watch = _watch2.default;

  return init;
};
//# sourceMappingURL=hopp.js.map