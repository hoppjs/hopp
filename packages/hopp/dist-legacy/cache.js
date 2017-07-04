'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

var _fs = require('fs');

var _require = require('../package.json'),
    version = _require.version; /**
                                 * @file src/cache/load.js
                                 * @license MIT
                                 * @copyright 2017 10244872 Canada Inc.
                                 */

var _require2 = require('./utils/log')('hopp'),
    debug = _require2.debug,
    log = _require2.log;

var lock = void 0;

/**
 * Define what an empty cache looks like.
 */
var createCache = function createCache() {
  return lock = {
    v: version,
    p: {}
  };
};

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */
var load = exports.load = function load(directory) {
  // send back internal cache if reloading
  if (lock) return lock;

  // verify directory
  if (typeof directory !== 'string' || !(0, _fs.existsSync)(directory)) {
    throw new Error('Invalid directory given: ' + directory);
  }

  // set cache file
  var lockfile = `${directory}/hopp.lock`;

  // bring cache into existence
  if (process.env.RECACHE === 'true' || !(0, _fs.existsSync)(lockfile)) {
    return lock = createCache();
  }

  // load lock file
  debug('Loading cache');
  try {
    lock = JSON.parse((0, _fs.readFileSync)(lockfile, 'utf8'));
    debug('loaded cache at v%s', lock.v);
  } catch (_) {
    log('Corrupted cache; ejecting.');
    return lock = createCache();
  }

  // handle version change
  if (lock.v !== version) {
    log('Found stale cache; updating.');
    return updateCache(lock);
  }

  return lock;
};

/**
 * Adds/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 * @returns {Any?} value from cache
 */
var val = exports.val = function val(key, value) {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Load/create cache for a plugin.
 * @param {}
 */
var plugin = exports.plugin = function plugin(pluginName) {
  var plugins = val('p');

  if (!plugins.hasOwnProperty(pluginName)) {
    plugins[pluginName] = {};
  }

  return plugins[pluginName];
};

/**
 * Get/set a sourcemap.
 * @param {String} taskName name of the task
 * @param {Object} sm sourcemap to save for the task
 * @returns {Object} sourcemap from cache
 */
var sourcemap = exports.sourcemap = function sourcemap(taskName, sm) {
  var sourcemap = val('sm');

  if (!sourcemap) {
    val('sm', sourcemap = {});
  }

  if (sm) {
    sourcemap[taskName] = sm;
  } else {
    sourcemap[taskName] = sourcemap[taskName] || {};
  }

  return sourcemap;
};

/**
 * Saves the lockfile again.
 * @param {*} directory
 */
var save = exports.save = function save(directory) {
  debug('Saving cache');
  (0, _fs.writeFileSync)(directory + '/hopp.lock', JSON.stringify(lock));
};

/**
 * Cache updater.
 */
function updateCache(lock) {
  // handle newer lock files
  if (require('semver').gt(lock.v, version)) {
    throw new Error('Sorry, this project was built with a newer version of hopp. Please upgrade hopp by running: npm i -g hopp');
  }

  var compat = void 0;

  // load converter
  try {
    compat = require('./compat/' + lock.v).default;
  } catch (err) {
    compat = require('./compat/else').default;
  }

  // do convert
  return compat(lock);
}

//# sourceMappingURL=cache.js.map