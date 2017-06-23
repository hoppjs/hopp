'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @file src/tasks/mgr.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @copyright 2017 10244872 Canada Inc.
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
var pluginConfig = {};

/**
 * Test for undefined or null.
 */
function isUndefined(value) {
  return value === undefined || value === null;
}

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

    // store context local to each task
    this.pluginCtx = {};

    // persistent info
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
                    stream = (0, _pump2.default)([(0, _streams.createReadStream)(_file, dest + '/' + _path2.default.basename(_file))].concat(this.buildStack()));
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
      var _this2 = this;

      var mode = 'stream';

      return this.d.stack.map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 1),
            plugin = _ref5[0];

        var pluginStream = (0, _mapStream2.default)(function (data, next) {
          try {
            plugins[plugin](_this2.pluginCtx[plugin], data).then(function (newData) {
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
     * Loads a plugin, manages its env.
     */

  }, {
    key: 'loadPlugin',
    value: function loadPlugin(taskName, plugin, args) {
      var mod = plugins[plugin];

      if (!mod) {
        mod = require(plugin);

        // expose module config
        pluginConfig[plugin] = mod.config || {};

        // if defined as an ES2015 module, assume that the
        // export is at 'default'
        if (mod.__esModule === true) {
          mod = mod.default;
        }

        // add plugins to loaded plugins
        plugins[plugin] = mod;
      }

      // create plugin logger
      var logger = (0, _utils.createLogger)('hopp:' + taskName + ':' + _path2.default.basename(plugin).substr(5));

      // load/create cache for plugin
      var pluginCache = cache.plugin(plugin);

      // create a new context for this plugin
      this.pluginCtx[plugin] = {
        args: args,
        cache: pluginCache,
        log: logger.log,
        debug: logger.debug,
        error: logger.error
      };
    }

    /**
     * Starts the pipeline.
     * @return {Promise} resolves when task is complete
     */

  }, {
    key: 'start',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name, directory) {
        var _this3 = this;

        var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var _createLogger2, log, debug, files, dest, stack, _start;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _createLogger2 = (0, _utils.createLogger)('hopp:' + name), log = _createLogger2.log, debug = _createLogger2.debug;

                /**
                 * Figure out if bundling is needed & load plugins.
                 */

                if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || this.d.stack.length > 0 && !this.loadedPlugins) {
                  this.loadedPlugins = true;

                  this.d.stack.forEach(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 2),
                        plugin = _ref8[0],
                        args = _ref8[1];

                    if (!_this3.pluginCtx.hasOwnProperty(plugin)) {
                      _this3.loadPlugin(name, plugin, args);
                    }

                    _this3.needsBundling = !!(_this3.needsBundling || pluginConfig[plugin].bundle);
                    _this3.needsRecaching = !!(_this3.needsRecaching || pluginConfig[plugin].recache);
                  });
                }

                /**
                 * Override recaching.
                 */
                if (this.needsRecaching) {
                  recache = true;
                }

                /**
                 * Get the modified files.
                 */
                debug('task recache = %s', recache);
                _context2.next = 6;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

              case 6:
                files = _context2.sent;

                if (!(files.length > 0)) {
                  _context2.next = 25;
                  break;
                }

                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));

                /**
                 * Switch to bundling mode if need be.
                 */

                if (!this.needsBundling) {
                  _context2.next = 13;
                  break;
                }

                _context2.next = 12;
                return this.startBundling(name, directory, files, dest, useDoubleCache);

              case 12:
                return _context2.abrupt('return', _context2.sent);

              case 13:
                _context2.next = 15;
                return (0, _fs3.mkdirp)(dest.replace(directory, ''), directory);

              case 15:

                /**
                 * Create streams.
                 */
                files = (0, _utils._)(files).map(function (file) {
                  return {
                    file: file,
                    stream: [(0, _streams.createReadStream)(file, dest + '/' + _path2.default.basename(file))]
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
                    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || !data.hasOwnProperty('body')) {
                      return next(new Error('A plugin has destroyed the stream by returning a non-object.'));
                    }

                    next(null, data.body);
                  }));
                  file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));

                  // promisify the current pipeline
                  return new Promise(function (resolve, reject) {
                    // connect all streams together to form pipeline
                    file.stream = (0, _pump2.default)(file.stream, function (err) {
                      if (err) reject(err);
                    });
                    file.stream.on('close', resolve);
                  });
                });

                // start & wait for all pipelines to end
                _start = Date.now();

                log('Starting task');
                _context2.next = 22;
                return Promise.all(files.val());

              case 22:
                log('Task ended (took %s ms)', Date.now() - _start);
                _context2.next = 26;
                break;

              case 25:
                log('Skipping task');

              case 26:
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
        stack: this.d.stack,
        needsBundling: this.needsBundling,
        needsRecaching: this.needsRecaching
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
      this.needsBundling = json.needsBundling;
      this.needsRecaching = json.needsRecaching;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsInNyYyIsIkFycmF5IiwicGx1Z2luQ3R4IiwiZCIsInN0YWNrIiwib3V0IiwiZGVzdCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJzdWJzdHIiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpbiIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInRhc2tOYW1lIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsInBsdWdpbkNhY2hlIiwiZXJyb3IiLCJuZWVkc0J1bmRsaW5nIiwibmVlZHNSZWNhY2hpbmciLCJsZW5ndGgiLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJsb2FkUGx1Z2luIiwic3RhcnRCdW5kbGluZyIsIkVycm9yIiwiYm9keSIsImFsbCIsInZhbCIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cWpCQUFBOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLElBQU1DLFdBQVcseUJBQWEsWUFBYixFQUEyQkMsR0FBNUM7O0FBRUE7OztBQUdBLElBQU1DLFVBQVUsRUFBaEI7QUFDQSxJQUFNQyxlQUFlLEVBQXJCOztBQUVBOzs7QUFHQSxTQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUMxQixTQUFPQSxVQUFVQyxTQUFWLElBQXVCRCxVQUFVLElBQXhDO0FBQ0Q7O0FBRUQ7Ozs7SUFHcUJFLEk7QUFDbkI7Ozs7Ozs7QUFPQSxnQkFBYUMsR0FBYixFQUFrQjtBQUFBOztBQUNoQixRQUFJLEVBQUVBLGVBQWVDLEtBQWpCLENBQUosRUFBNkI7QUFDM0JELFlBQU0sQ0FBQ0EsR0FBRCxDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLRSxTQUFMLEdBQWlCLEVBQWpCOztBQUVBO0FBQ0EsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BILGNBRE87QUFFUEksYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7Ozs7O3lCQUtNQyxHLEVBQUs7QUFDVCxXQUFLRixDQUFMLENBQU9HLElBQVAsR0FBY0QsR0FBZDtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7MEJBR09FLEksRUFBTUMsUyxFQUE0QjtBQUFBOztBQUFBLFVBQWpCQyxPQUFpQix1RUFBUCxLQUFPOztBQUN2Q0Ysd0JBQWdCQSxJQUFoQjs7QUFFQSxVQUFNRyxXQUFXLEVBQWpCOztBQUVBLFdBQUtQLENBQUwsQ0FBT0gsR0FBUCxDQUFXVyxPQUFYLENBQW1CLGVBQU87QUFDeEI7QUFDQSxZ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T0FBT1ksR0FBUDtBQUNWLHFCQUZhLENBQWQ7QUFHQTlCLHlCQUFLTyxNQUFMLENBQVlqQixFQUFaLENBQWUsT0FBZixFQUF3QlAsT0FBeEI7QUFDRCxtQkFOTSxDQUFQO0FBT0QsaUJBbkJEOztBQXFCQTtBQUNNSSxzQixHQUFRa0IsS0FBS0MsR0FBTCxFOztBQUNkaEQsb0JBQUksZUFBSjs7dUJBQ004QixRQUFROEQsR0FBUixDQUFZckQsTUFBTXNELEdBQU4sRUFBWixDOzs7QUFDTjdGLG9CQUFJLHlCQUFKLEVBQStCK0MsS0FBS0MsR0FBTCxLQUFhbkIsTUFBNUM7Ozs7O0FBRUE3QixvQkFBSSxlQUFKOzs7Ozs7Ozs7Ozs7Ozs7OztBQUlKOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMYSxjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMTixhQUFLLEtBQUtHLENBQUwsQ0FBT0gsR0FGUDtBQUdMSSxlQUFPLEtBQUtELENBQUwsQ0FBT0MsS0FIVDtBQUlMd0UsdUJBQWUsS0FBS0EsYUFKZjtBQUtMQyx3QkFBZ0IsS0FBS0E7QUFMaEIsT0FBUDtBQU9EOztBQUVEOzs7Ozs7Ozs2QkFLVVUsSSxFQUFNO0FBQ2QsV0FBS3BGLENBQUwsQ0FBT0csSUFBUCxHQUFjaUYsS0FBS2pGLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPSCxHQUFQLEdBQWF1RixLQUFLdkYsR0FBbEI7QUFDQSxXQUFLRyxDQUFMLENBQU9DLEtBQVAsR0FBZW1GLEtBQUtuRixLQUFwQjtBQUNBLFdBQUt3RSxhQUFMLEdBQXFCVyxLQUFLWCxhQUExQjtBQUNBLFdBQUtDLGNBQUwsR0FBc0JVLEtBQUtWLGNBQTNCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBL1hrQjlFLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkNvbmZpZyA9IHt9XG5cbi8qKlxuICogVGVzdCBmb3IgdW5kZWZpbmVkIG9yIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsXG59XG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIC8vIHN0b3JlIGNvbnRleHQgbG9jYWwgdG8gZWFjaCB0YXNrXG4gICAgdGhpcy5wbHVnaW5DdHggPSB7fVxuXG4gICAgLy8gcGVyc2lzdGVudCBpbmZvXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlKSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGJ1bmRsaW5nLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIG1vZGlmaWVkLCBkZXN0LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBkZWJ1ZygnU3dpdGNoZWQgdG8gYnVuZGxpbmcgbW9kZScpXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaCBzb3VyY2VtYXAgZnJvbSBjYWNoZS5cbiAgICAgKi9cbiAgICBjb25zdCBzb3VyY2VtYXAgPSBjYWNoZS5zb3VyY2VtYXAobmFtZSlcblxuICAgIC8qKlxuICAgICAqIEdldCBmdWxsIGxpc3Qgb2YgY3VycmVudCBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgdHJ1ZSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBsaXN0IG9mIHVubW9kaWZpZWQuXG4gICAgICovXG4gICAgbGV0IGZyZXNoQnVpbGQgPSB0cnVlXG4gICAgY29uc3QgdW5tb2RpZmllZCA9IHt9XG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAobW9kaWZpZWQuaW5kZXhPZihmaWxlKSA9PT0gLTEpIHtcbiAgICAgICAgdW5tb2RpZmllZFtmaWxlXSA9IHRydWVcbiAgICAgICAgZnJlc2hCdWlsZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9sZCBidW5kbGUgJiBjcmVhdGUgbmV3IG9uZS5cbiAgICAgKi9cbiAgICBjb25zdCBvcmlnaW5hbEZkID0gZnJlc2hCdWlsZCA/IG51bGwgOiBhd2FpdCBvcGVuRmlsZShkZXN0LCAncicpXG4gICAgICAgICwgW3RtcEJ1bmRsZSwgdG1wQnVuZGxlUGF0aF0gPSBhd2FpdCB0bXBGaWxlKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IGJ1bmRsZSB0byBmb3J3YXJkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0IGJ1bmRsZSA9IGNyZWF0ZUJ1bmRsZSh0bXBCdW5kbGUpXG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBidW5kbGluZyBzdGFydHMgc3RyZWFtaW5nIHJpZ2h0IGF3YXksIHdlIGNhbiBjb3VudCB0aGlzXG4gICAgICogYXMgdGhlIHN0YXJ0IG9mIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFsbCBmaWxlcy5cbiAgICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBsZXQgc3RyZWFtXG5cbiAgICAgIGlmICh1bm1vZGlmaWVkW2ZpbGVdKSB7XG4gICAgICAgIGRlYnVnKCdmb3J3YXJkOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0obnVsbCwge1xuICAgICAgICAgIGZkOiBvcmlnaW5hbEZkLFxuICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG4gICAgICAgICAgc3RhcnQ6IHNvdXJjZW1hcFtmaWxlXS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHNvdXJjZW1hcFtmaWxlXS5lbmRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0cmFuc2Zvcm06ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gcHVtcChbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXS5jb25jYXQodGhpcy5idWlsZFN0YWNrKCkpKVxuICAgICAgfVxuXG4gICAgICBidW5kbGUuYWRkKGZpbGUsIHN0cmVhbSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYWl0IGZvciBidW5kbGluZyB0byBlbmQuXG4gICAgICovXG4gICAgYXdhaXQgYnVuZGxlLmVuZCh0bXBCdW5kbGVQYXRoKVxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgYnVuZGxlIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgICovXG4gICAgaWYgKG9yaWdpbmFsRmQpIG9yaWdpbmFsRmQuY2xvc2UoKVxuICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZGVzdCkucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wQnVuZGxlUGF0aCkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSlcblxuICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc291cmNlbWFwLlxuICAgICAqL1xuICAgIGNhY2hlLnNvdXJjZW1hcChuYW1lLCBidW5kbGUubWFwKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbGwgcGx1Z2lucyBpbiB0aGUgc3RhY2sgaW50byBzdHJlYW1zLlxuICAgKi9cbiAgYnVpbGRTdGFjayAoKSB7XG4gICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuXG4gICAgcmV0dXJuIHRoaXMuZC5zdGFjay5tYXAoKFtwbHVnaW5dKSA9PiB7XG4gICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICB0aGlzLnBsdWdpbkN0eFtwbHVnaW5dLFxuICAgICAgICAgICAgZGF0YVxuICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gbmV4dChudWxsLCBuZXdEYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBuZXh0KGVycilcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLyoqXG4gICAgICAgKiBFbmFibGUgYnVmZmVyIG1vZGUgaWYgcmVxdWlyZWQuXG4gICAgICAgKi9cbiAgICAgIGlmIChtb2RlID09PSAnc3RyZWFtJyAmJiBwbHVnaW5Db25maWdbcGx1Z2luXS5tb2RlID09PSAnYnVmZmVyJykge1xuICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHB1bXAoYnVmZmVyKCksIHBsdWdpblN0cmVhbSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBPdGhlcndpc2Uga2VlcCBwdW1waW5nLlxuICAgICAgICovXG4gICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhIHBsdWdpbiwgbWFuYWdlcyBpdHMgZW52LlxuICAgKi9cbiAgbG9hZFBsdWdpbiAodGFza05hbWUsIHBsdWdpbiwgYXJncykge1xuICAgIGxldCBtb2QgPSBwbHVnaW5zW3BsdWdpbl1cbiAgICBcbiAgICBpZiAoIW1vZCkge1xuICAgICAgbW9kID0gcmVxdWlyZShwbHVnaW4pXG4gICAgICBcbiAgICAgIC8vIGV4cG9zZSBtb2R1bGUgY29uZmlnXG4gICAgICBwbHVnaW5Db25maWdbcGx1Z2luXSA9IG1vZC5jb25maWcgfHwge31cblxuICAgICAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgICAgIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgICAgIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgICAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgcGx1Z2lucyB0byBsb2FkZWQgcGx1Z2luc1xuICAgICAgcGx1Z2luc1twbHVnaW5dID0gbW9kXG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHt0YXNrTmFtZX06JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgICAvLyBsb2FkL2NyZWF0ZSBjYWNoZSBmb3IgcGx1Z2luXG4gICAgY29uc3QgcGx1Z2luQ2FjaGUgPSBjYWNoZS5wbHVnaW4ocGx1Z2luKVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBjYWNoZTogcGx1Z2luQ2FjaGUsXG4gICAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBGaWd1cmUgb3V0IGlmIGJ1bmRsaW5nIGlzIG5lZWRlZCAmIGxvYWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5uZWVkc0J1bmRsaW5nKSB8fCBpc1VuZGVmaW5lZCh0aGlzLm5lZWRzUmVjYWNoaW5nKSB8fCAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMubG9hZGVkUGx1Z2lucykpIHtcbiAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5DdHguaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIHRoaXMubG9hZFBsdWdpbihuYW1lLCBwbHVnaW4sIGFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSAhISh0aGlzLm5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlKVxuICAgICAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gISEodGhpcy5uZWVkc1JlY2FjaGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5yZWNhY2hlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSByZWNhY2hpbmcuXG4gICAgICovXG4gICAgaWYgKHRoaXMubmVlZHNSZWNhY2hpbmcpIHtcbiAgICAgIHJlY2FjaGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMubmVlZHNCdW5kbGluZykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdBIHBsdWdpbiBoYXMgZGVzdHJveWVkIHRoZSBzdHJlYW0gYnkgcmV0dXJuaW5nIGEgbm9uLW9iamVjdC4nKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGRhdGEuYm9keSlcbiAgICAgICAgfSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtLCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrLFxuICAgICAgbmVlZHNCdW5kbGluZzogdGhpcy5uZWVkc0J1bmRsaW5nLFxuICAgICAgbmVlZHNSZWNhY2hpbmc6IHRoaXMubmVlZHNSZWNhY2hpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBqc29uLm5lZWRzQnVuZGxpbmdcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0ganNvbi5uZWVkc1JlY2FjaGluZ1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19