'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @file src/hopp.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright 2017 10244872 Canada Inc..
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mgr = require('./tasks/mgr');

var _mgr2 = _interopRequireDefault(_mgr);

var _cache = require('./cache');

var cache = _interopRequireWildcard(_cache);

var _steps = require('./tasks/steps');

var _steps2 = _interopRequireDefault(_steps);

var _watch = require('./tasks/watch');

var _watch2 = _interopRequireDefault(_watch);

var _loadPlugins3 = require('./tasks/loadPlugins');

var _loadPlugins4 = _interopRequireDefault(_loadPlugins3);

var _parallel = require('./tasks/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./utils/log')('hopp'),
    debug = _require.debug;

/**
 * Normalizes a plugin/preset name to be added to
 * the prototype.
 */


function normalize(name) {
  var normalized = '';

  for (var i = 12; i < name.length; i += 1) {
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
    var _this = this;

    var args = [].concat(Array.prototype.slice.call(arguments));

    if (type === 'plugin') {
      this.d.stack.push([name, method, plugName]);

      this.pluginArgs[plugName] = this.pluginArgs[plugName] || Object.create(null);
      this.pluginArgs[plugName][method] = args;
    } else {
      var preset = require(_path2.default.resolve(directory, 'node_modules', name));
      var substack = preset.apply(null, args);

      substack.forEach(function (row) {
        var _row = _slicedToArray(row, 1),
            name = _row[0];

        if (name[0] === '/') {
          _this.d.stack.push(row);
        } else {
          _this[name].apply(_this, row[1]);
        }
      });
    }

    return this;
  };
}

/**
 * Add single plugin to prototype.
 */
function addPlugin(name, plugins, directory) {
  var type = name.indexOf('plugin') !== -1 ? 'plugin' : 'preset';
  var plugName = normalize(name);

  debug('adding %s %s as %s', type, name, plugName);

  // check for conflicts
  if (_mgr2.default.fn[plugName] !== undefined) {
    throw new Error(`Conflicting ${type}: ${name} (${plugName} already exists)`);
  }

  // add the plugin to the hopp prototype so it can be
  // used for the rest of the build process
  // this function is the proxy of the 'default' function
  _mgr2.default.fn[plugName] = createMethod(type, name, plugName, 'default', directory);

  // add any other methods
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = plugins[name][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var method = _step.value;

      if (method !== '__esModule' && method !== 'config' && method !== 'default') {
        _mgr2.default.fn[plugName][method] = createMethod(type, name, plugName, method, directory);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * Create hopp object based on plugins.
 */

exports.default = function (directory) {
  var _loadPlugins = (0, _loadPlugins4.default)(directory),
      _loadPlugins2 = _slicedToArray(_loadPlugins, 2),
      fromCache = _loadPlugins2[0],
      plugins = _loadPlugins2[1];

  for (var name in plugins) {
    addPlugin(name, plugins, directory);
  }

  /**
   * Expose hopp class for task creation.
   */
  var init = function init(src) {
    return new _mgr2.default(src);
  };

  init.all = _parallel2.default;
  init.steps = _steps2.default;
  init.watch = _watch2.default;

  /**
   * API for loading local plugins.
   * 
   * Just noop if we've got a valid cache.
   */
  init.load = fromCache ? function () {
    return undefined;
  } : function (pathToPlugin) {
    debug('loading local plugin: %s', pathToPlugin);

    // try and grab name from package.json
    // otherwise use the directory's name
    var pluginName = function () {
      try {
        return require(pathToPlugin + '/package.json').name;
      } catch (_) {
        return _path2.default.basename(pathToPlugin);
      }
    }();

    // add to local list in cache
    var localPlugins = cache.valOr('lp', Object.create(null));
    localPlugins[pluginName] = pathToPlugin;

    // add to list
    plugins[pluginName] = Object.keys(require(pathToPlugin));

    // run normal add
    addPlugin(pluginName, plugins, directory);
  };

  return init;
};

//# sourceMappingURL=hopp.js.map