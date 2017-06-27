'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

/**
 * Cache updater.
 */
var updateCache = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(lock) {
    var compat;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!_semver2.default.gt(lock.v, version)) {
              _context3.next = 2;
              break;
            }

            throw new Error('Sorry, this project was built with a newer version of hopp. Please upgrade hopp by running: npm i -g hopp');

          case 2:
            compat = void 0;

            // load converter

            try {
              compat = require('./compat/' + lock.v).default;
            } catch (err) {
              compat = require('./compat/else').default;
            }

            // do convert
            return _context3.abrupt('return', compat(lock));

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function updateCache(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var _fs = require('./fs');

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/cache/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('../package.json'),
    version = _require.version;

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
var load = exports.load = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directory) {
    var lockfile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!lock) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', lock);

          case 2:
            _context.t0 = typeof directory !== 'string';

            if (_context.t0) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return (0, _fs.exists)(directory);

          case 6:
            _context.t0 = !_context.sent;

          case 7:
            if (!_context.t0) {
              _context.next = 9;
              break;
            }

            throw new Error('Invalid directory given: ' + directory);

          case 9:

            // set cache file
            lockfile = `${directory}/hopp.lock`;

            // bring cache into existence

            _context.t1 = process.env.RECACHE === 'true';

            if (_context.t1) {
              _context.next = 15;
              break;
            }

            _context.next = 14;
            return (0, _fs.exists)(lockfile);

          case 14:
            _context.t1 = !_context.sent;

          case 15:
            if (!_context.t1) {
              _context.next = 17;
              break;
            }

            return _context.abrupt('return', lock = createCache());

          case 17:

            // load lock file
            debug('Loading cache');
            _context.prev = 18;
            _context.t2 = JSON;
            _context.next = 22;
            return (0, _fs.readFile)(lockfile, 'utf8');

          case 22:
            _context.t3 = _context.sent;
            lock = _context.t2.parse.call(_context.t2, _context.t3);

            debug('loaded cache at v%s', lock.v);
            _context.next = 31;
            break;

          case 27:
            _context.prev = 27;
            _context.t4 = _context['catch'](18);

            log('Corrupted cache; ejecting.');
            return _context.abrupt('return', lock = createCache());

          case 31:
            if (!(lock.v !== version)) {
              _context.next = 36;
              break;
            }

            log('Found stale cache; updating.');
            _context.next = 35;
            return updateCache(lock);

          case 35:
            lock = _context.sent;

          case 36:
            return _context.abrupt('return', lock);

          case 37:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[18, 27]]);
  }));

  return function load(_x) {
    return _ref.apply(this, arguments);
  };
}();

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
var save = exports.save = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(directory) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            debug('Saving cache');
            _context2.next = 3;
            return (0, _fs.writeFile)(directory + '/hopp.lock', JSON.stringify(lock));

          case 3:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function save(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

//# sourceMappingURL=cache.js.map