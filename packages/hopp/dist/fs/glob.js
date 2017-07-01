'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
const tempCache = {};

async function glob(task, pattern, cwd, useDoubleCache = false, recache = false) {
  // prefer arrays
  if (!(pattern instanceof Array)) {
    pattern = [pattern];
  }

  // ensure global cache is present
  if (gstatCache === undefined) {
    gstatCache = cache.val('sc') || {};
    cache.val('sc', gstatCache);
  }

  // create local cache
  if (gstatCache[task] === undefined) {
    gstatCache[task] = {};
  }

  // create new local cache and load the retreived cache
  let retrievedCache = gstatCache[task];
  let statCache = {};

  // replace the retreived with new cache to get rid of stale
  // entries
  gstatCache[task] = statCache;

  // allow overrides from the env
  recache = recache || process.env.RECACHE === 'true';

  /**
   * Recursive walk.
   */
  async function walk(relative, pttn, directory, recursive = false) {
    debug('walk(relative = %s, pttn = %s, directory = %s, recursive = %s) in %s [recache:%s, curr:%s]', relative, pttn, directory, recursive, cwd, recache, pttn[0]);

    if (pttn.length === 0) {
      return [];
    }

    pttn = pttn.slice();

    const curr = pttn.shift();
    let localResults = [];

    for (let file of await (0, _.readdir)(directory)) {
      // fix file path
      const filepath = directory + _path2.default.sep + file;
      const relativepath = relative + _path2.default.sep + file;

      // get stat from temp cache (for non-watch tasks) or stat()
      let fstat;

      if (useDoubleCache) {
        fstat = tempCache[filepath] = tempCache[filepath] || (await (0, _.stat)(filepath));
      } else {
        fstat = await (0, _.stat)(filepath);
      }

      // pull from old cache, if it still exists
      if (retrievedCache.hasOwnProperty(relativepath)) {
        statCache[relativepath] = retrievedCache[relativepath];
      }

      debug('match(%s,%s) => %s [%s]', filepath, curr, (0, _minimatch2.default)(file, curr), fstat.isFile() ? 'file' : 'dir');

      // has been modified
      debug('stat(%s) :: %s', +fstat.mtime, statCache[relativepath]);

      if ((0, _minimatch2.default)(file, curr)) {
        if (fstat.isFile()) {
          if (recache || !statCache.hasOwnProperty(relativepath) || statCache[relativepath] !== +fstat.mtime) {
            statCache[relativepath] = +fstat.mtime;
            localResults.push(filepath);

            debug('add: %s', filepath);
          }
        } else {
          localResults = localResults.concat((await walk(relativepath, pttn, filepath, recursive || curr === '**')));
        }
      } else if (fstat.isDirectory() && recursive) {
        localResults = localResults.concat((await walk(relativepath, [curr].concat(pttn), filepath, recursive)));
      }
    }

    return localResults;
  }

  /**
   * Run all patterns against directory.
   */
  let results = [];
  for (let pttn of pattern) {
    if (pttn[0] === '/') {
      throw new Error('Not sure what to do with the / in your glob.');
    }

    const nm = glob.nonMagic(pttn);
    debug('nm = %j', nm);

    if (!nm) {
      results = results.concat((await walk('.', pttn.split('/'), cwd)));
    } else {
      results = results.concat((await walk(nm, pttn.replace(nm, '').substr(1).split('/'), _path2.default.resolve(cwd, nm))));
    }
  }

  /**
   * Return final results object.
   */
  return results;
}

/**
 * Get non-magical start of glob.
 * @param {String} pattern glob pattern
 * @returns {String} definitive path
 */
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