'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

/**
 * Cache updater.
 */
let updateCache = (() => {
  var _ref3 = _asyncToGenerator(function* (lock) {
    // handle newer lock files
    if (_semver2.default.gt(lock.v, version)) {
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
  });

  return function updateCache(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

var _fs = require('./fs');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/cache/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

const { version } = require('../package.json');
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
const load = exports.load = (() => {
  var _ref = _asyncToGenerator(function* (directory) {
    // send back internal cache if reloading
    if (lock) return lock;

    // verify directory
    if (typeof directory !== 'string' || !(yield (0, _fs.exists)(directory))) {
      throw new Error('Invalid directory given: ' + directory);
    }

    // set cache file
    const lockfile = `${directory}/hopp.lock`;

    // bring cache into existence
    if (process.env.RECACHE === 'true' || !(yield (0, _fs.exists)(lockfile))) {
      return lock = createCache();
    }

    // load lock file
    debug('Loading cache');
    try {
      lock = JSON.parse((yield (0, _fs.readFile)(lockfile, 'utf8')));
      debug('loaded cache at v%s', lock.v);
    } catch (_) {
      log('Corrupted cache; ejecting.');
      return lock = createCache();
    }

    // handle version change
    if (lock.v !== version) {
      log('Found stale cache; updating.');
      lock = yield updateCache(lock);
    }

    return lock;
  });

  return function load(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Adds/replaces a value in the cache.
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
 * Load/create cache for a plugin.
 * @param {}
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
const save = exports.save = (() => {
  var _ref2 = _asyncToGenerator(function* (directory) {
    debug('Saving cache');
    yield (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));
  });

  return function save(_x2) {
    return _ref2.apply(this, arguments);
  };
})();