'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var glob = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(pattern, cwd) {
    var useDoubleCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    /**
     * Recursive walk.
     */
    var walk = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(relative, pttn, directory) {
        var recursive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        var curr, localResults, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filepath, fstat;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(pttn.length === 0)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', []);

              case 2:
                curr = pttn.shift();
                localResults = [];


                debug('cwd = %s, relative = %s, curr: %s, dir = %s, recur = %s, recache = %s', cwd, relative, curr, directory, recursive, recache);

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                _context.next = 11;
                return (0, _.readdir)(directory);

              case 11:
                _context.t0 = Symbol.iterator;
                _iterator = _context.sent[_context.t0]();

              case 13:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 50;
                  break;
                }

                file = _step.value;

                // fix file path
                filepath = directory + _path2.default.sep + file;

                // get stat from temp cache (for non-watch tasks) or stat()

                fstat = void 0;

                if (!useDoubleCache) {
                  _context.next = 26;
                  break;
                }

                _context.t1 = tempCache[filepath];

                if (_context.t1) {
                  _context.next = 23;
                  break;
                }

                _context.next = 22;
                return (0, _.stat)(filepath);

              case 22:
                _context.t1 = _context.sent;

              case 23:
                fstat = tempCache[filepath] = _context.t1;
                _context.next = 29;
                break;

              case 26:
                _context.next = 28;
                return (0, _.stat)(filepath);

              case 28:
                fstat = _context.sent;

              case 29:
                if (!(0, _minimatch2.default)(file, curr)) {
                  _context.next = 41;
                  break;
                }

                if (!fstat.isFile()) {
                  _context.next = 34;
                  break;
                }

                if (recache || !statCache.hasOwnProperty(relative) || statCache[relative] !== +fstat.mtime) {
                  statCache[relative] = +fstat.mtime;
                  localResults.push(filepath);
                }
                _context.next = 39;
                break;

              case 34:
                _context.t2 = localResults;
                _context.next = 37;
                return walk(relative + _path2.default.sep + file, pttn, filepath, recursive || curr === '**');

              case 37:
                _context.t3 = _context.sent;
                localResults = _context.t2.concat.call(_context.t2, _context.t3);

              case 39:
                _context.next = 47;
                break;

              case 41:
                if (!(fstat.isDirectory() && recursive)) {
                  _context.next = 47;
                  break;
                }

                _context.t4 = localResults;
                _context.next = 45;
                return walk(relative + _path2.default.sep + file, [curr].concat(pttn), filepath, recursive);

              case 45:
                _context.t5 = _context.sent;
                localResults = _context.t4.concat.call(_context.t4, _context.t5);

              case 47:
                _iteratorNormalCompletion = true;
                _context.next = 13;
                break;

              case 50:
                _context.next = 56;
                break;

              case 52:
                _context.prev = 52;
                _context.t6 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t6;

              case 56:
                _context.prev = 56;
                _context.prev = 57;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 59:
                _context.prev = 59;

                if (!_didIteratorError) {
                  _context.next = 62;
                  break;
                }

                throw _iteratorError;

              case 62:
                return _context.finish(59);

              case 63:
                return _context.finish(56);

              case 64:
                return _context.abrupt('return', localResults);

              case 65:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 52, 56, 64], [57,, 59, 63]]);
      }));

      return function walk(_x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
      };
    }();

    /**
     * Run all patterns against directory.
     */


    var recache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var results, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, pttn, nm;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // prefer arrays
            if (!(pattern instanceof Array)) {
              pattern = [pattern];
            }

            // get cache
            if (statCache === undefined) {
              statCache = cache.val('sc') || {};
            }

            // allow overrides from the env
            recache = recache || process.env.RECACHE === 'true';results = [];
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 7;
            _iterator2 = pattern[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 30;
              break;
            }

            pttn = _step2.value;

            if (!(pttn[0] === '/')) {
              _context2.next = 13;
              break;
            }

            throw new Error('Not sure what to do with the / in your glob.');

          case 13:
            nm = glob.nonMagic(pttn);

            if (!(nm === '.')) {
              _context2.next = 22;
              break;
            }

            _context2.t0 = results;
            _context2.next = 18;
            return walk('.', pttn.split('/'), cwd);

          case 18:
            _context2.t1 = _context2.sent;
            results = _context2.t0.concat.call(_context2.t0, _context2.t1);
            _context2.next = 27;
            break;

          case 22:
            _context2.t2 = results;
            _context2.next = 25;
            return walk(nm, pttn.replace(nm, '').substr(1).split('/'), _path2.default.resolve(cwd, nm));

          case 25:
            _context2.t3 = _context2.sent;
            results = _context2.t2.concat.call(_context2.t2, _context2.t3);

          case 27:
            _iteratorNormalCompletion2 = true;
            _context2.next = 9;
            break;

          case 30:
            _context2.next = 36;
            break;

          case 32:
            _context2.prev = 32;
            _context2.t4 = _context2['catch'](7);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t4;

          case 36:
            _context2.prev = 36;
            _context2.prev = 37;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 39:
            _context2.prev = 39;

            if (!_didIteratorError2) {
              _context2.next = 42;
              break;
            }

            throw _iteratorError2;

          case 42:
            return _context2.finish(39);

          case 43:
            return _context2.finish(36);

          case 44:

            /**
             * Update cache.
             */
            cache.val('sc', statCache);

            /**
             * Return final results object.
             */
            return _context2.abrupt('return', results);

          case 46:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[7, 32, 36, 44], [37,, 39, 43]]);
  }));

  return function glob(_x3, _x4) {
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

var statCache = void 0;
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