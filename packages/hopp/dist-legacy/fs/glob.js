'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var glob = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(task, pattern, cwd) {
    var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    /**
     * Recursive walk.
     */
    var walk = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(relative, pttn, directory) {
        var recursive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var curr, localResults, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filepath, relativepath, fstat;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                debug('walk(relative = %s, pttn = %s, directory = %s, recursive = %s) in %s [recache:%s, curr:%s]', relative, pttn, directory, recursive, cwd, recache, pttn[0]);

                if (!(pttn.length === 0)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return', []);

              case 3:

                pttn = pttn.slice();

                curr = pttn.shift();
                localResults = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 9;
                _context.next = 12;
                return (0, _.readdir)(directory);

              case 12:
                _context.t0 = Symbol.iterator;
                _iterator = _context.sent[_context.t0]();

              case 14:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 55;
                  break;
                }

                file = _step.value;

                // fix file path
                filepath = directory + _path2.default.sep + file;
                relativepath = relative + _path2.default.sep + file;

                // get stat from temp cache (for non-watch tasks) or stat()

                fstat = void 0;

                if (!useDoubleCache) {
                  _context.next = 28;
                  break;
                }

                _context.t1 = tempCache[filepath];

                if (_context.t1) {
                  _context.next = 25;
                  break;
                }

                _context.next = 24;
                return (0, _.stat)(filepath);

              case 24:
                _context.t1 = _context.sent;

              case 25:
                fstat = tempCache[filepath] = _context.t1;
                _context.next = 31;
                break;

              case 28:
                _context.next = 30;
                return (0, _.stat)(filepath);

              case 30:
                fstat = _context.sent;

              case 31:

                // pull from old cache, if it still exists
                if (retrievedCache.hasOwnProperty(relativepath)) {
                  statCache[relativepath] = retrievedCache[relativepath];
                }

                debug('match(%s,%s) => %s [%s]', filepath, curr, (0, _minimatch2.default)(file, curr), fstat.isFile() ? 'file' : 'dir');

                // has been modified
                debug('stat(%s) :: %s', +fstat.mtime, statCache[relativepath]);

                if (!(0, _minimatch2.default)(file, curr)) {
                  _context.next = 46;
                  break;
                }

                if (!fstat.isFile()) {
                  _context.next = 39;
                  break;
                }

                if (recache || !statCache.hasOwnProperty(relativepath) || statCache[relativepath] !== +fstat.mtime) {
                  statCache[relativepath] = +fstat.mtime;
                  localResults.push(filepath);

                  debug('add: %s', filepath);
                }
                _context.next = 44;
                break;

              case 39:
                _context.t2 = localResults;
                _context.next = 42;
                return walk(relativepath, pttn, filepath, recursive || curr === '**');

              case 42:
                _context.t3 = _context.sent;
                localResults = _context.t2.concat.call(_context.t2, _context.t3);

              case 44:
                _context.next = 52;
                break;

              case 46:
                if (!(fstat.isDirectory() && recursive)) {
                  _context.next = 52;
                  break;
                }

                _context.t4 = localResults;
                _context.next = 50;
                return walk(relativepath, [curr].concat(pttn), filepath, recursive);

              case 50:
                _context.t5 = _context.sent;
                localResults = _context.t4.concat.call(_context.t4, _context.t5);

              case 52:
                _iteratorNormalCompletion = true;
                _context.next = 14;
                break;

              case 55:
                _context.next = 61;
                break;

              case 57:
                _context.prev = 57;
                _context.t6 = _context['catch'](9);
                _didIteratorError = true;
                _iteratorError = _context.t6;

              case 61:
                _context.prev = 61;
                _context.prev = 62;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 64:
                _context.prev = 64;

                if (!_didIteratorError) {
                  _context.next = 67;
                  break;
                }

                throw _iteratorError;

              case 67:
                return _context.finish(64);

              case 68:
                return _context.finish(61);

              case 69:
                return _context.abrupt('return', localResults);

              case 70:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 57, 61, 69], [62,, 64, 68]]);
      }));

      return function walk(_x7, _x8, _x9) {
        return _ref2.apply(this, arguments);
      };
    }();

    /**
     * Run all patterns against directory.
     */


    var recache = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    var retrievedCache, statCache, results, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, pttn, nm;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
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
            retrievedCache = gstatCache[task];
            statCache = {};

            // replace the retreived with new cache to get rid of stale
            // entries

            gstatCache[task] = statCache;

            // allow overrides from the env
            recache = recache || process.env.RECACHE === 'true';results = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 11;
            _iterator2 = pattern[Symbol.iterator]();

          case 13:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 35;
              break;
            }

            pttn = _step2.value;

            if (!(pttn[0] === '/')) {
              _context2.next = 17;
              break;
            }

            throw new Error('Not sure what to do with the / in your glob.');

          case 17:
            nm = glob.nonMagic(pttn);

            debug('nm = %j', nm);

            if (nm) {
              _context2.next = 27;
              break;
            }

            _context2.t0 = results;
            _context2.next = 23;
            return walk('.', pttn.split('/'), cwd);

          case 23:
            _context2.t1 = _context2.sent;
            results = _context2.t0.concat.call(_context2.t0, _context2.t1);
            _context2.next = 32;
            break;

          case 27:
            _context2.t2 = results;
            _context2.next = 30;
            return walk(nm, pttn.replace(nm, '').substr(1).split('/'), _path2.default.resolve(cwd, nm));

          case 30:
            _context2.t3 = _context2.sent;
            results = _context2.t2.concat.call(_context2.t2, _context2.t3);

          case 32:
            _iteratorNormalCompletion2 = true;
            _context2.next = 13;
            break;

          case 35:
            _context2.next = 41;
            break;

          case 37:
            _context2.prev = 37;
            _context2.t4 = _context2['catch'](11);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t4;

          case 41:
            _context2.prev = 41;
            _context2.prev = 42;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 44:
            _context2.prev = 44;

            if (!_didIteratorError2) {
              _context2.next = 47;
              break;
            }

            throw _iteratorError2;

          case 47:
            return _context2.finish(44);

          case 48:
            return _context2.finish(41);

          case 49:
            return _context2.abrupt('return', results);

          case 50:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[11, 37, 41, 49], [42,, 44, 48]]);
  }));

  return function glob(_x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/glob.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var _require = require('../utils/log')('hopp:glob'),
    debug = _require.debug;

var gstatCache = void 0;
var tempCache = {};

glob.nonMagic = function (pattern) {
  var newpath = '';

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = pattern.split('/')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var sub = _step3.value;

      if (sub) {
        if (sub.indexOf('*') !== -1) {
          break;
        }

        newpath += _path2.default.sep + sub;
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return newpath.substr(1);
};

exports.default = glob;
//# sourceMappingURL=glob.js.map