'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = exports.sourcemap = exports.plugin = exports.val = exports.load = undefined;

var _fs = require('./fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/cache/load.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('./utils/log')('hopp'),
    debug = _require.debug,
    log = _require.log;

var lock = void 0;

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
            lockfile = directory + '/hopp.lock';

            // bring cache into existence

            _context.t1 = process.env.RECACHE;

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

            return _context.abrupt('return', lock = { p: {} });

          case 17:

            // load lock file
            debug('Loading cache');
            _context.prev = 18;
            _context.t2 = JSON;
            _context.next = 22;
            return (0, _fs.readFile)(lockfile, 'utf8');

          case 22:
            _context.t3 = _context.sent;
            return _context.abrupt('return', lock = _context.t2.parse.call(_context.t2, _context.t3));

          case 26:
            _context.prev = 26;
            _context.t4 = _context['catch'](18);

            log('Corrupted cache; ejecting.');
            return _context.abrupt('return', lock = { p: {} });

          case 30:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[18, 26]]);
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