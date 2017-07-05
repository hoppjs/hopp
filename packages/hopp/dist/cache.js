'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.valOr = exports.val = exports.load = undefined;

var _fs = require('fs');

const { version } = require('../package.json'); /**
                                                 * @file src/cache/load.js
                                                 * @license MIT
                                                 * @copyright 2017 10244872 Canada Inc.
                                                 */

const { debug, log } = require('./utils/log')('hopp');
let lock;

/**
 * Define what an empty cache looks like.
 */
const createCache = () => lock = {
  v: version,
  p: {}
};

/**
 * Loads a cache from the project.
 * @param {String} directory project directory
 * @return {Object} the loaded cache
 */
const load = exports.load = directory => {
  // send back internal cache if reloading
  if (lock) return lock;

  // verify directory
  if (typeof directory !== 'string' || !(0, _fs.existsSync)(directory)) {
    throw new Error('Invalid directory given: ' + directory);
  }

  // set cache file
  const lockfile = `${directory}/hopp.lock`;

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
 * Gets/replaces a value in the cache.
 * @param {String} key
 * @param {Any} value anything stringifiable
 * @returns {Any?} value from cache
 */
const val = exports.val = (key, value) => {
  if (value === undefined) {
    return lock[key];
  }

  lock[key] = value;
};

/**
 * Gets a value from the cache or creates a new
 * one.
 * @param {String} key
 * @param {Any} fallback the default value to use
 * @returns {Any} value from cache
 */
const valOr = exports.valOr = (key, fallback) => {
  if (lock[key] === undefined) {
    lock[key] = fallback;
  }

  return lock[key];
};

/**
 * Load/create cache for a plugin.
 */
const plugin = exports.plugin = pluginName => {
  const plugins = val('p');

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
const sourcemap = exports.sourcemap = (taskName, sm) => {
  let sourcemap = val('sm');

  if (!sourcemap) {
    val('sm', sourcemap = Object.create(null));
  }

  if (sm) {
    sourcemap[taskName] = sm;
  } else {
    sourcemap[taskName] = sourcemap[taskName] || Object.create(null);
  }

  return sourcemap;
};

/**
 * Saves the lockfile again.
 * @param {*} directory
 */
const save = exports.save = directory => {
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

  let compat;

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