'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @file src/tasks/mgr.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _glob = require('../fs/glob');

var _glob2 = _interopRequireDefault(_glob);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _getPath = require('../fs/get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _utils = require('../utils');

var _fs3 = require('../fs');

var _streams = require('../streams');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var watchlog = (0, _utils.createLogger)('hopp:watch').log;

/**
 * Plugins storage.
 */
var plugins = {};
var pluginCtx = {};
var pluginConfig = {};

/**
 * Loads a plugin, manages its env.
 */
var loadPlugin = function loadPlugin(plugin, args) {
  var mod = require(plugin);

  // expose module config
  pluginConfig[plugin] = mod.config || {};

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  if (mod.__esModule === true) {
    mod = mod.default;
  }

  // create plugin logger
  var logger = (0, _utils.createLogger)('hopp:' + _path2.default.basename(plugin).substr(5));

  // create a new context for this plugin
  pluginCtx[plugin] = {
    args: args,
    log: logger.log,
    debug: logger.debug,
    error: logger.error

    // return loaded plugin
  };return mod;
};

/**
 * Hopp class to manage tasks.
 */

var Hopp = function () {
  /**
   * Creates a new task with the glob.
   * DOES NOT START THE TASK.
   * 
   * @param {Glob} src
   * @return {Hopp} new hopp object
   */
  function Hopp(src) {
    _classCallCheck(this, Hopp);

    if (!(src instanceof Array)) {
      src = [src];
    }

    this.d = {
      src: src,
      stack: []
    };
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */


  _createClass(Hopp, [{
    key: 'dest',
    value: function dest(out) {
      this.d.dest = out;
      return this;
    }

    /**
     * Run task in continuous mode.
     */

  }, {
    key: 'watch',
    value: function watch(name, directory) {
      var _this = this;

      var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      name = 'watch:' + name;

      var watchers = [];

      this.d.src.forEach(function (src) {
        // figure out if watch should be recursive
        var recursive = src.indexOf('/**/') !== -1;

        // get most definitive path possible
        var newpath = '';
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = src.split('/')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var sub = _step.value;

            if (sub) {
              if (sub.indexOf('*') !== -1) {
                break;
              }

              newpath += _path2.default.sep + sub;
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

        newpath = _path2.default.resolve(directory, newpath.substr(1));

        // disable fs caching for watch
        (0, _fs3.disableFSCache)();

        // start watch
        watchlog('Watching for %s ...', name);
        watchers.push(_fs2.default.watch(newpath, {
          recursive: src.indexOf('/**/') !== -1
        }, function () {
          return _this.start(name, directory, recache, false);
        }));
      });

      return new Promise(function (resolve) {
        process.on('SIGINT', function () {
          watchers.forEach(function (watcher) {
            return watcher.close();
          });
          resolve();
        });
      });
    }

    /**
     * Handles bundling.
     */

  }, {
    key: 'startBundling',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, directory, modified, dest) {
        var useDoubleCache = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

        var _createLogger, log, debug, sourcemap, files, freshBuild, unmodified, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, originalFd, _ref2, _ref3, tmpBundle, tmpBundlePath, bundle, start, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _file, stream;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger = (0, _utils.createLogger)('hopp:' + name), log = _createLogger.log, debug = _createLogger.debug;

                debug('Switched to bundling mode');

                /**
                 * Fetch sourcemap from cache.
                 */
                sourcemap = cache.sourcemap(name);

                /**
                 * Get full list of current files.
                 */

                _context.next = 5;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache, true);

              case 5:
                files = _context.sent;


                /**
                 * Create list of unmodified.
                 */
                freshBuild = true;
                unmodified = {};
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 11;


                for (_iterator2 = files[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  file = _step2.value;

                  if (modified.indexOf(file) === -1) {
                    unmodified[file] = true;
                    freshBuild = false;
                  }
                }

                /**
                 * Get old bundle & create new one.
                 */
                _context.next = 19;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context['catch'](11);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t0;

              case 19:
                _context.prev = 19;
                _context.prev = 20;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 22:
                _context.prev = 22;

                if (!_didIteratorError2) {
                  _context.next = 25;
                  break;
                }

                throw _iteratorError2;

              case 25:
                return _context.finish(22);

              case 26:
                return _context.finish(19);

              case 27:
                if (!freshBuild) {
                  _context.next = 31;
                  break;
                }

                _context.t1 = null;
                _context.next = 34;
                break;

              case 31:
                _context.next = 33;
                return (0, _fs3.openFile)(dest, 'r');

              case 33:
                _context.t1 = _context.sent;

              case 34:
                originalFd = _context.t1;
                _context.next = 37;
                return (0, _fs3.tmpFile)();

              case 37:
                _ref2 = _context.sent;
                _ref3 = _slicedToArray(_ref2, 2);
                tmpBundle = _ref3[0];
                tmpBundlePath = _ref3[1];


                /**
                 * Create new bundle to forward to.
                 */
                bundle = (0, _streams.createBundle)(tmpBundle);

                /**
                 * Since bundling starts streaming right away, we can count this
                 * as the start of the build.
                 */

                start = Date.now();

                log('Starting task');

                /**
                 * Add all files.
                 */
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context.prev = 47;
                for (_iterator3 = files[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  _file = _step3.value;
                  stream = void 0;


                  if (unmodified[_file]) {
                    debug('forward: %s', _file);
                    stream = _fs2.default.createReadStream(null, {
                      fd: originalFd,
                      autoClose: false,
                      start: sourcemap[_file].start,
                      end: sourcemap[_file].end
                    });
                  } else {
                    debug('transform: %s', _file);
                    stream = (0, _pump2.default)([(0, _streams.createReadStream)(_file)].concat(this.buildStack()));
                  }

                  bundle.add(_file, stream);
                }

                /**
                 * Wait for bundling to end.
                 */
                _context.next = 55;
                break;

              case 51:
                _context.prev = 51;
                _context.t2 = _context['catch'](47);
                _didIteratorError3 = true;
                _iteratorError3 = _context.t2;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError3) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError3;

              case 61:
                return _context.finish(58);

              case 62:
                return _context.finish(55);

              case 63:
                _context.next = 65;
                return bundle.end(tmpBundlePath);

              case 65:

                /**
                 * Move the bundle to the new location.
                 */
                if (originalFd) originalFd.close();
                _context.next = 68;
                return (0, _fs3.mkdirp)(_path2.default.dirname(dest).replace(directory, ''), directory);

              case 68:
                _context.next = 70;
                return new Promise(function (resolve, reject) {
                  var stream = _fs2.default.createReadStream(tmpBundlePath).pipe(_fs2.default.createWriteStream(dest));

                  stream.on('close', resolve);
                  stream.on('error', reject);
                });

              case 70:

                /**
                 * Update sourcemap.
                 */
                cache.sourcemap(name, bundle.map);

                log('Task ended (took %s ms)', Date.now() - start);

              case 72:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[11, 15, 19, 27], [20,, 22, 26], [47, 51, 55, 63], [56,, 58, 62]]);
      }));

      function startBundling(_x3, _x4, _x5, _x6) {
        return _ref.apply(this, arguments);
      }

      return startBundling;
    }()

    /**
     * Converts all plugins in the stack into streams.
     */

  }, {
    key: 'buildStack',
    value: function buildStack() {
      var mode = 'stream';

      return this.d.stack.map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 1),
            plugin = _ref5[0];

        var pluginStream = (0, _mapStream2.default)(function (data, next) {
          try {
            plugins[plugin](pluginCtx[plugin], data).then(function (newData) {
              return next(null, newData);
            }).catch(function (err) {
              return next(err);
            });
          } catch (err) {
            next(err);
          }
        });

        /**
         * Enable buffer mode if required.
         */
        if (mode === 'stream' && pluginConfig[plugin].mode === 'buffer') {
          mode = 'buffer';
          return (0, _pump2.default)((0, _streams.buffer)(), pluginStream);
        }

        /**
         * Otherwise keep pumping.
         */
        return pluginStream;
      });
    }

    /**
     * Starts the pipeline.
     * @return {Promise} resolves when task is complete
     */

  }, {
    key: 'start',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name, directory) {
        var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var _createLogger2, log, debug, files, dest, needsBundling, stack, _start;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _createLogger2 = (0, _utils.createLogger)('hopp:' + name), log = _createLogger2.log, debug = _createLogger2.debug;

                /**
                 * Get the modified files.
                 */

                debug('task recache = %s', recache);
                _context2.next = 4;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

              case 4:
                files = _context2.sent;

                if (!(files.length > 0)) {
                  _context2.next = 26;
                  break;
                }

                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));

                /**
                 * Bundling tangeant.
                 */

                if (!(this.d.stack.length > 0)) {
                  _context2.next = 14;
                  break;
                }

                needsBundling = false;

                /**
                 * Try to load plugins.
                 */

                if (!this.loadedPlugins) {
                  this.loadedPlugins = true;

                  this.d.stack.forEach(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 2),
                        plugin = _ref8[0],
                        args = _ref8[1];

                    if (!plugins.hasOwnProperty(plugin)) {
                      plugins[plugin] = loadPlugin(plugin, args);
                      needsBundling = needsBundling || pluginConfig[plugin].bundle;
                    }
                  });
                }

                /**
                 * Switch to bundling mode if need be.
                 */

                if (!needsBundling) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 13;
                return this.startBundling(name, directory, files, dest, useDoubleCache);

              case 13:
                return _context2.abrupt('return', _context2.sent);

              case 14:
                _context2.next = 16;
                return (0, _fs3.mkdirp)(dest.replace(directory, ''), directory);

              case 16:

                /**
                 * Create streams.
                 */
                files = (0, _utils._)(files).map(function (file) {
                  return {
                    file: file,
                    stream: [(0, _streams.createReadStream)(file, dest)]
                  };
                });

                if (this.d.stack.length > 0) {
                  /**
                   * Create streams.
                   */
                  stack = this.buildStack();

                  /**
                   * Connect plugin streams with pipelines.
                   */

                  files.map(function (file) {
                    file.stream = file.stream.concat(stack);
                    return file;
                  });
                }

                /**
                 * Connect with destination.
                 */
                files.map(function (file) {
                  // strip out the actual body and write it
                  file.stream.push((0, _mapStream2.default)(function (data, next) {
                    return next(null, data.body);
                  }));
                  file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));

                  // connect all streams together to form pipeline
                  file.stream = (0, _pump2.default)(file.stream);

                  // promisify the current pipeline
                  return new Promise(function (resolve, reject) {
                    file.stream.on('error', reject);
                    file.stream.on('close', resolve);
                  });
                });

                // start & wait for all pipelines to end
                _start = Date.now();

                log('Starting task');
                _context2.next = 23;
                return Promise.all(files.val());

              case 23:
                log('Task ended (took %s ms)', Date.now() - _start);
                _context2.next = 27;
                break;

              case 26:
                log('Skipping task');

              case 27:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function start(_x9, _x10) {
        return _ref6.apply(this, arguments);
      }

      return start;
    }()

    /**
     * Converts task manager to JSON for storage.
     * @return {Object} proper JSON object
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        dest: this.d.dest,
        src: this.d.src,
        stack: this.d.stack
      };
    }

    /**
     * Deserializes a JSON object into a manager.
     * @param {Object} json
     * @return {Hopp} task manager
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.d.dest = json.dest;
      this.d.src = json.src;
      this.d.stack = json.stack;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5IiwicmVjYWNoZSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsInJlY3Vyc2l2ZSIsImluZGV4T2YiLCJuZXdwYXRoIiwic3BsaXQiLCJzdWIiLCJzZXAiLCJyZXNvbHZlIiwicHVzaCIsIndhdGNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwibW9kaWZpZWQiLCJ1c2VEb3VibGVDYWNoZSIsInNvdXJjZW1hcCIsImZpbGVzIiwiZnJlc2hCdWlsZCIsInVubW9kaWZpZWQiLCJmaWxlIiwib3JpZ2luYWxGZCIsInRtcEJ1bmRsZSIsInRtcEJ1bmRsZVBhdGgiLCJidW5kbGUiLCJEYXRlIiwibm93Iiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImZkIiwiYXV0b0Nsb3NlIiwiZW5kIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxlbmd0aCIsIm5lZWRzQnVuZGxpbmciLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJzdGFydEJ1bmRsaW5nIiwiYm9keSIs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VUFBQ0osT0FBRCxFQUFVZ0MsTUFBVixFQUFxQjtBQUN0Q2pCLHlCQUFLTyxNQUFMLENBQVloQixFQUFaLENBQWUsT0FBZixFQUF3QjBCLE1BQXhCO0FBQ0FqQix5QkFBS08sTUFBTCxDQUFZaEIsRUFBWixDQUFlLE9BQWYsRUFBd0JOLE9BQXhCO0FBQ0QsbUJBSE0sQ0FBUDtBQUlELGlCQWJEOztBQWVBO0FBQ01HLHNCLEdBQVFpQixLQUFLQyxHQUFMLEU7O0FBQ2R4RCxvQkFBSSxlQUFKOzt1QkFDTXVDLFFBQVE4QyxHQUFSLENBQVl0QyxNQUFNdUMsR0FBTixFQUFaLEM7OztBQUNOdEYsb0JBQUkseUJBQUosRUFBK0J1RCxLQUFLQyxHQUFMLEtBQWFsQixNQUE1Qzs7Ozs7QUFFQXRDLG9CQUFJLGVBQUo7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUo7Ozs7Ozs7NkJBSVU7QUFDUixhQUFPO0FBQ0x1QixjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMTCxhQUFLLEtBQUtFLENBQUwsQ0FBT0YsR0FGUDtBQUdMRyxlQUFPLEtBQUtELENBQUwsQ0FBT0M7QUFIVCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVa0UsSSxFQUFNO0FBQ2QsV0FBS25FLENBQUwsQ0FBT0csSUFBUCxHQUFjZ0UsS0FBS2hFLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPRixHQUFQLEdBQWFxRSxLQUFLckUsR0FBbEI7QUFDQSxXQUFLRSxDQUFMLENBQU9DLEtBQVAsR0FBZWtFLEtBQUtsRSxLQUFwQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQXZVa0JKLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcbiAgXG4gIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gIHBsdWdpbkNvbmZpZ1twbHVnaW5dID0gbW9kLmNvbmZpZyB8fCB7fVxuXG4gIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgaWYgKG1vZC5fX2VzTW9kdWxlID09PSB0cnVlKSB7XG4gICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgfVxuXG4gIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gIGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke3BhdGguYmFzZW5hbWUocGx1Z2luKS5zdWJzdHIoNSl9YClcblxuICAvLyBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgdGhpcyBwbHVnaW5cbiAgcGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgYXJncyxcbiAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgZGVidWc6IGxvZ2dlci5kZWJ1ZyxcbiAgICBlcnJvcjogbG9nZ2VyLmVycm9yXG4gIH1cblxuICAvLyByZXR1cm4gbG9hZGVkIHBsdWdpblxuICByZXR1cm4gbW9kXG59XG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW2NyZWF0ZVJlYWRTdHJlYW0oZmlsZSldLmNvbmNhdCh0aGlzLmJ1aWxkU3RhY2soKSkpXG4gICAgICB9XG5cbiAgICAgIGJ1bmRsZS5hZGQoZmlsZSwgc3RyZWFtKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhaXQgZm9yIGJ1bmRsaW5nIHRvIGVuZC5cbiAgICAgKi9cbiAgICBhd2FpdCBidW5kbGUuZW5kKHRtcEJ1bmRsZVBhdGgpXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRoZSBidW5kbGUgdG8gdGhlIG5ldyBsb2NhdGlvbi5cbiAgICAgKi9cbiAgICBpZiAob3JpZ2luYWxGZCkgb3JpZ2luYWxGZC5jbG9zZSgpXG4gICAgYXdhaXQgbWtkaXJwKHBhdGguZGlybmFtZShkZXN0KS5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0bXBCdW5kbGVQYXRoKS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QpKVxuXG4gICAgICBzdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgfSlcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzb3VyY2VtYXAuXG4gICAgICovXG4gICAgY2FjaGUuc291cmNlbWFwKG5hbWUsIGJ1bmRsZS5tYXApXG5cbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFsbCBwbHVnaW5zIGluIHRoZSBzdGFjayBpbnRvIHN0cmVhbXMuXG4gICAqL1xuICBidWlsZFN0YWNrICgpIHtcbiAgICBsZXQgbW9kZSA9ICdzdHJlYW0nXG5cbiAgICByZXR1cm4gdGhpcy5kLnN0YWNrLm1hcCgoW3BsdWdpbl0pID0+IHtcbiAgICAgIGNvbnN0IHBsdWdpblN0cmVhbSA9IG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICAgIHBsdWdpbkN0eFtwbHVnaW5dLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gbmV4dChudWxsLCBuZXdEYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBuZXh0KGVycilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUgYnVmZmVyIG1vZGUgaWYgcmVxdWlyZWQuXG4gICAgICAgKi9cbiAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICovXG4gICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGRlYnVnKCd0YXNrIHJlY2FjaGUgPSAlcycsIHJlY2FjaGUpXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCByZWNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcblxuICAgICAgLyoqXG4gICAgICAgKiBCdW5kbGluZyB0YW5nZWFudC5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBuZWVkc0J1bmRsaW5nID0gZmFsc2VcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGlmICghdGhpcy5sb2FkZWRQbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5sb2FkZWRQbHVnaW5zID0gdHJ1ZVxuXG4gICAgICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgICAgICAgbmVlZHNCdW5kbGluZyA9IG5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTd2l0Y2ggdG8gYnVuZGxpbmcgbW9kZSBpZiBuZWVkIGJlLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5lZWRzQnVuZGxpbmcpIHtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGRpc3QgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAqL1xuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdGFjayA9IHRoaXMuYnVpbGRTdGFjaygpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IG5leHQobnVsbCwgZGF0YS5ib2R5KSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=