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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsInNyYyIsIkFycmF5IiwicGx1Z2luQ3R4IiwiZCIsInN0YWNrIiwib3V0IiwiZGVzdCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwibmV3cGF0aCIsInNwbGl0Iiwic3ViIiwiaW5kZXhPZiIsInNlcCIsInJlc29sdmUiLCJzdWJzdHIiLCJwdXNoIiwid2F0Y2giLCJyZWN1cnNpdmUiLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpbiIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInRhc2tOYW1lIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsInBsdWdpbkNhY2hlIiwiZXJyb3IiLCJuZWVkc0J1bmRsaW5nIiwibmVlZHNSZWNhY2hpbmciLCJsZW5ndGgiLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJsb2FkUGx1Z2luIiwic3RhcnRCdW5kbGluZyIsIkVycm9yIiwiYm9keSIsImFsbCIsInZhbCIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cWpCQUFBOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztJQUFZQSxLOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLElBQU1DLFdBQVcseUJBQWEsWUFBYixFQUEyQkMsR0FBNUM7O0FBRUE7OztBQUdBLElBQU1DLFVBQVUsRUFBaEI7QUFDQSxJQUFNQyxlQUFlLEVBQXJCOztBQUVBOzs7QUFHQSxTQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUMxQixTQUFPQSxVQUFVQyxTQUFWLElBQXVCRCxVQUFVLElBQXhDO0FBQ0Q7O0FBRUQ7Ozs7SUFHcUJFLEk7QUFDbkI7Ozs7Ozs7QUFPQSxnQkFBYUMsR0FBYixFQUFrQjtBQUFBOztBQUNoQixRQUFJLEVBQUVBLGVBQWVDLEtBQWpCLENBQUosRUFBNkI7QUFDM0JELFlBQU0sQ0FBQ0EsR0FBRCxDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLRSxTQUFMLEdBQWlCLEVBQWpCOztBQUVBO0FBQ0EsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BILGNBRE87QUFFUEksYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7Ozs7O3lCQUtNQyxHLEVBQUs7QUFDVCxXQUFLRixDQUFMLENBQU9HLElBQVAsR0FBY0QsR0FBZDtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7MEJBR09FLEksRUFBTUMsUyxFQUE0QjtBQUFBOztBQUFBLFVBQWpCQyxPQUFpQix1RUFBUCxLQUFPOztBQUN2Q0Ysd0JBQWdCQSxJQUFoQjs7QUFFQSxVQUFNRyxXQUFXLEVBQWpCOztBQUVBLFdBQUtQLENBQUwsQ0FBT0gsR0FBUCxDQUFXVyxPQUFYLENBQW1CLGVBQU87QUFDeEI7QUFDQSxZ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QWUsT0FBZixFQUF3QlIsT0FBeEI7QUFDRCxtQkFOTSxDQUFQO0FBT0QsaUJBbkJEOztBQXFCQTtBQUNNSyxzQixHQUFRa0IsS0FBS0MsR0FBTCxFOztBQUNkaEQsb0JBQUksZUFBSjs7dUJBQ004QixRQUFROEQsR0FBUixDQUFZckQsTUFBTXNELEdBQU4sRUFBWixDOzs7QUFDTjdGLG9CQUFJLHlCQUFKLEVBQStCK0MsS0FBS0MsR0FBTCxLQUFhbkIsTUFBNUM7Ozs7O0FBRUE3QixvQkFBSSxlQUFKOzs7Ozs7Ozs7Ozs7Ozs7OztBQUlKOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMYSxjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMTixhQUFLLEtBQUtHLENBQUwsQ0FBT0gsR0FGUDtBQUdMSSxlQUFPLEtBQUtELENBQUwsQ0FBT0MsS0FIVDtBQUlMd0UsdUJBQWUsS0FBS0EsYUFKZjtBQUtMQyx3QkFBZ0IsS0FBS0E7QUFMaEIsT0FBUDtBQU9EOztBQUVEOzs7Ozs7Ozs2QkFLVVUsSSxFQUFNO0FBQ2QsV0FBS3BGLENBQUwsQ0FBT0csSUFBUCxHQUFjaUYsS0FBS2pGLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPSCxHQUFQLEdBQWF1RixLQUFLdkYsR0FBbEI7QUFDQSxXQUFLRyxDQUFMLENBQU9DLEtBQVAsR0FBZW1GLEtBQUtuRixLQUFwQjtBQUNBLFdBQUt3RSxhQUFMLEdBQXFCVyxLQUFLWCxhQUExQjtBQUNBLFdBQUtDLGNBQUwsR0FBc0JVLEtBQUtWLGNBQTNCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBNVhrQjlFLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyAxMDI0NDg3MiBDYW5hZGEgSW5jLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZnMvZ2xvYidcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZnMvZ2V0LXBhdGgnXG5pbXBvcnQgeyBfLCBjcmVhdGVMb2dnZXIgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGRpc2FibGVGU0NhY2hlLCBta2RpcnAsIG9wZW5GaWxlLCB0bXBGaWxlIH0gZnJvbSAnLi4vZnMnXG5pbXBvcnQgeyBidWZmZXIsIGNyZWF0ZUJ1bmRsZSwgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gJy4uL3N0cmVhbXMnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkNvbmZpZyA9IHt9XG5cbi8qKlxuICogVGVzdCBmb3IgdW5kZWZpbmVkIG9yIG51bGwuXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsXG59XG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIC8vIHN0b3JlIGNvbnRleHQgbG9jYWwgdG8gZWFjaCB0YXNrXG4gICAgdGhpcy5wbHVnaW5DdHggPSB7fVxuXG4gICAgLy8gcGVyc2lzdGVudCBpbmZvXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlKSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG4gICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICovXG4gICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgcGx1Z2luQ29uZmlnW3BsdWdpbl0ubW9kZSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAgICovXG4gIGxvYWRQbHVnaW4gKHRhc2tOYW1lLCBwbHVnaW4sIGFyZ3MpIHtcbiAgICBsZXQgbW9kID0gcGx1Z2luc1twbHVnaW5dXG4gICAgXG4gICAgaWYgKCFtb2QpIHtcbiAgICAgIG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuICAgICAgXG4gICAgICAvLyBleHBvc2UgbW9kdWxlIGNvbmZpZ1xuICAgICAgcGx1Z2luQ29uZmlnW3BsdWdpbl0gPSBtb2QuY29uZmlnIHx8IHt9XG5cbiAgICAgIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gICAgICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gICAgICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICAgICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHBsdWdpbnMgdG8gbG9hZGVkIHBsdWdpbnNcbiAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IG1vZFxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gICAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7dGFza05hbWV9OiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gICAgLy8gbG9hZC9jcmVhdGUgY2FjaGUgZm9yIHBsdWdpblxuICAgIGNvbnN0IHBsdWdpbkNhY2hlID0gY2FjaGUucGx1Z2luKHBsdWdpbilcblxuICAgIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICAgIHRoaXMucGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgICBhcmdzLFxuICAgICAgY2FjaGU6IHBsdWdpbkNhY2hlLFxuICAgICAgbG9nOiBsb2dnZXIubG9nLFxuICAgICAgZGVidWc6IGxvZ2dlci5kZWJ1ZyxcbiAgICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UsIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuXG4gICAgLyoqXG4gICAgICogRmlndXJlIG91dCBpZiBidW5kbGluZyBpcyBuZWVkZWQgJiBsb2FkIHBsdWdpbnMuXG4gICAgICovXG4gICAgaWYgKGlzVW5kZWZpbmVkKHRoaXMubmVlZHNCdW5kbGluZykgfHwgaXNVbmRlZmluZWQodGhpcy5uZWVkc1JlY2FjaGluZykgfHwgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLmxvYWRlZFBsdWdpbnMpKSB7XG4gICAgICB0aGlzLmxvYWRlZFBsdWdpbnMgPSB0cnVlXG5cbiAgICAgIHRoaXMuZC5zdGFjay5mb3JFYWNoKChbcGx1Z2luLCBhcmdzXSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucGx1Z2luQ3R4Lmhhc093blByb3BlcnR5KHBsdWdpbikpIHtcbiAgICAgICAgICB0aGlzLmxvYWRQbHVnaW4obmFtZSwgcGx1Z2luLCBhcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZWVkc0J1bmRsaW5nID0gISEodGhpcy5uZWVkc0J1bmRsaW5nIHx8IHBsdWdpbkNvbmZpZ1twbHVnaW5dLmJ1bmRsZSlcbiAgICAgICAgdGhpcy5uZWVkc1JlY2FjaGluZyA9ICEhKHRoaXMubmVlZHNSZWNhY2hpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0ucmVjYWNoZSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgcmVjYWNoaW5nLlxuICAgICAqL1xuICAgIGlmICh0aGlzLm5lZWRzUmVjYWNoaW5nKSB7XG4gICAgICByZWNhY2hlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuXG4gICAgICAvKipcbiAgICAgICAqIFN3aXRjaCB0byBidW5kbGluZyBtb2RlIGlmIG5lZWQgYmUuXG4gICAgICAgKi9cbiAgICAgIGlmICh0aGlzLm5lZWRzQnVuZGxpbmcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIGZpbGVzLCBkZXN0LCB1c2VEb3VibGVDYWNoZSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBFbnN1cmUgZGlzdCBkaXJlY3RvcnkgZXhpc3RzLlxuICAgICAgICovXG4gICAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdGFjayA9IHRoaXMuYnVpbGRTdGFjaygpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdvYmplY3QnIHx8ICFkYXRhLmhhc093blByb3BlcnR5KCdib2R5JykpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KG5ldyBFcnJvcignQSBwbHVnaW4gaGFzIGRlc3Ryb3llZCB0aGUgc3RyZWFtIGJ5IHJldHVybmluZyBhIG5vbi1vYmplY3QuJykpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dChudWxsLCBkYXRhLmJvZHkpXG4gICAgICAgIH0pKVxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIC8vIGNvbm5lY3QgYWxsIHN0cmVhbXMgdG9nZXRoZXIgdG8gZm9ybSBwaXBlbGluZVxuICAgICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSwgZXJyID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFjayxcbiAgICAgIG5lZWRzQnVuZGxpbmc6IHRoaXMubmVlZHNCdW5kbGluZyxcbiAgICAgIG5lZWRzUmVjYWNoaW5nOiB0aGlzLm5lZWRzUmVjYWNoaW5nXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG4gICAgdGhpcy5uZWVkc0J1bmRsaW5nID0ganNvbi5uZWVkc0J1bmRsaW5nXG4gICAgdGhpcy5uZWVkc1JlY2FjaGluZyA9IGpzb24ubmVlZHNSZWNhY2hpbmdcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiJdfQ==