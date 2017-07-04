'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _steps = require('./tasks/steps');

var _steps2 = _interopRequireDefault(_steps);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _loadPlugins = require('./tasks/loadPlugins');

var _loadPlugins2 = _interopRequireDefault(_loadPlugins);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/hopp.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc..
 */

const { debug } = require('./utils/log')('hopp');

/**
 * Normalizes a plugin/preset name to be added to
 * the prototype.
 */
function normalize(name) {
  let normalized = '';

  for (let i = 12; i < name.length; i += 1) {
    normalized += name[i] === '-' ? name[i++].toUpperCase() : name[i];
  }

  return normalized;
}

/**
 * Generates a proxy method that allows all the plugin calls to be
 * cached.
 * 
 * Instead of actually loading the plugin at this stage, we will just
 * pop its call into our internal call stack for use later. this is
 * useful when we are stepping through an entire hoppfile but might
 * only be running a single task.
 */
function createMethod(type, name, plugName, method, directory) {
  return function () {
    if (type === 'plugin') {
      this.d.stack.push([name, [].slice.call(arguments), method]);
    } else {
      const preset = require(_path2.default.resolve(directory, 'node_modules', name));
      const substack = preset.apply(null, arguments);

      substack.forEach(row => {
        const [name] = row;

        if (name[0] === '/') {
          this.d.stack.push(row);
        } else {
          this[name].apply(this, row[1]);
        }
      });
    }

    return this;
  };
}

/**
 * Create hopp object based on plugins.
 */

exports.default = directory => {
  const plugins = (0, _loadPlugins2.default)(directory);

  for (const name in plugins) {
    if (plugins.hasOwnProperty(name)) {
      const type = name.indexOf('plugin') !== -1 ? 'plugin' : 'preset';
      const plugName = normalize(name);

      debug('adding %s %s as %s', type, name, plugName);

      // check for conflicts
      if (_mgr2.default.prototype.hasOwnProperty(plugName)) {
        throw new Error(`Conflicting ${type}: ${name} (${plugName} already exists)`);
      }

      // add the plugin to the hopp prototype so it can be
      // used for the rest of the build process
      // this function is the proxy of the 'default' function
      _mgr2.default.prototype[plugName] = createMethod(type, name, plugName, 'default', directory);

      // add any other methods
      for (const method of plugins[name]) {
        if (method !== '__esModule' && method !== 'config' && method !== 'default') {
          _mgr2.default.prototype[plugName][method] = createMethod(type, name, plugName, method, directory);
        }
      }
    }
  }

  /**
   * Expose hopp class for task creation.
   */
  const init = src => new _mgr2.default(src);

  init.all = _parallel2.default;
  init.steps = _steps2.default;
  init.watch = _watch2.default;

  return init;
};

//# sourceMappingURL=hopp.js.map