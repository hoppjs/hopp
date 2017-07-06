'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

let glob = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (task, pattern, cwd, useDoubleCache = false, recache = false) {

    /**
     * Recursive walk.
     */
    let walk = (() => {
      var _ref2 = (0, _bluebird.coroutine)(function* (relative, pttn, directory, recursive = false) {
        debug('walk(relative = %s, pttn = %s, directory = %s, recursive = %s) in %s [recache:%s, curr:%s]', relative, pttn, directory, recursive, cwd, recache, pttn[0]);

        pttn = pttn.slice();

        if (pttn.length === 0) {
          return [];
        }

        const curr = pttn.shift();
        let localResults = [];

        for (let file of yield (0, _bluebird.resolve)((0, _.readdir)(directory))) {
          // fix file path
          const filepath = directory + _path2.default.sep + file;
          const relativepath = relative + _path2.default.sep + file;

          // get stat from temp cache (for non-watch tasks) or stat()
          let fstat;

          if (useDoubleCache) {
            fstat = tempCache[filepath] = tempCache[filepath] || (yield (0, _bluebird.resolve)((0, _.stat)(filepath)));
          } else {
            fstat = yield (0, _bluebird.resolve)((0, _.stat)(filepath));
          }

          // pull from old cache, if it still exists
          if (retrievedCache[relativepath]) {
            statCache[relativepath] = retrievedCache[relativepath];
          }

          debug('match(%s,%s) => %s [%s]', filepath, curr, (0, _minimatch2.default)(file, curr), fstat.isFile() ? 'file' : 'dir');

          // has been modified
          debug('stat(%s) :: %s', +fstat.mtime, statCache[relativepath]);

          if ((0, _minimatch2.default)(file, curr)) {
            if (fstat.isFile()) {
              if (recache || !statCache[relativepath] || statCache[relativepath] !== +fstat.mtime) {
                statCache[relativepath] = +fstat.mtime;
                localResults.push(filepath);

                debug('add: %s', filepath);
              }
            } else {
              localResults = localResults.concat((yield (0, _bluebird.resolve)(walk(relativepath, pttn, filepath, recursive || curr === '**'))));
            }
          } else if (fstat.isDirectory() && recursive) {
            localResults = localResults.concat((yield (0, _bluebird.resolve)(walk(relativepath, [curr].concat(pttn), filepath, recursive))));
          }
        }

        return localResults;
      });

      return function walk(_x6, _x7, _x8, _x9) {
        return _ref2.apply(this, arguments);
      };
    })();

    /**
     * Run all patterns against directory.
     */


    // shorten task name based on hopp's internal convention
    task = task.split(':').pop();

    // prefer arrays
    if (!(pattern instanceof Array)) {
      pattern = [pattern];
    }

    // ensure global cache is present
    if (gstatCache === undefined) {
      gstatCache = cache.valOr('sc', Object.create(null));
    }

    // create local cache
    if (gstatCache[task] === undefined) {
      gstatCache[task] = Object.create(null);
    }

    // create new local cache and load the retreived cache
    let retrievedCache = gstatCache[task];
    let statCache = Object.create(null);

    // replace the retreived with new cache to get rid of stale
    // entries
    gstatCache[task] = statCache;

    // allow overrides from the env
    recache = recache || process.env.RECACHE === 'true';let results = [];
    for (let pttn of pattern) {
      if (pttn[0] === '/') {
        throw new Error('Not sure what to do with the / in your glob.');
      }

      const nm = glob.nonMagic(pttn);
      debug('nm = %j', nm);

      if (!nm) {
        results = results.concat((yield (0, _bluebird.resolve)(walk('.', pttn.split('/'), cwd))));
      } else {
        results = results.concat((yield (0, _bluebird.resolve)(walk(nm, pttn.replace(nm, '').substr(1).split('/'), _path2.default.resolve(cwd, nm)))));
      }
    }

    /**
     * Return final results object.
     */
    return results;
  });

  return function glob(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Get non-magical start of glob.
 * @param {String} pattern glob pattern
 * @returns {String} definitive path
 */


var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _ = require('./');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/glob.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const { debug } = require('../utils/log')('hopp:glob');

let gstatCache;
const tempCache = Object.create(null);

glob.nonMagic = function (pattern) {
  let newpath = '';

  for (let sub of pattern.split('/')) {
    if (sub) {
      if (sub.indexOf('*') !== -1) {
        break;
      }

      newpath += _path2.default.sep + sub;
    }
  }

  return newpath.substr(1);
};

exports.default = glob;

//# sourceMappingURL=glob.js.map