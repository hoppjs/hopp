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

      // create a new context for this plugin
      this.pluginCtx[plugin] = {
        args: args,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5Db25maWciLCJpc1VuZGVmaW5lZCIsInZhbHVlIiwidW5kZWZpbmVkIiwiSG9wcCIsInNyYyIsIkFycmF5IiwicGx1Z2luQ3R4IiwiZCIsInN0YWNrIiwib3V0IiwiZGVzdCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJyZWNhY2hlIiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJzdWJzdHIiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJtb2RpZmllZCIsInVzZURvdWJsZUNhY2hlIiwiZGVidWciLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImJhc2VuYW1lIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpbiIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInRhc2tOYW1lIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImVycm9yIiwibmVlZHNCdW5kbGluZyIsIm5lZWRzUmVjYWNoaW5nIiwibGVuZ3RoIiwibG9hZGVkUGx1Z2lucyIsImhhc093blByb3BlcnR5IiwibG9hZFBsdWdpbiIsInN0YXJ0QnVuZGxpbmciLCJFcnJvciIsImJvZHkiLCJhbGwiLCJ2YWwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FqQkFBQTs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQyxXQUFXLHlCQUFhLFlBQWIsRUFBMkJDLEdBQTVDOztBQUVBOzs7QUFHQSxJQUFNQyxVQUFVLEVBQWhCO0FBQ0EsSUFBTUMsZUFBZSxFQUFyQjs7QUFFQTs7O0FBR0EsU0FBU0MsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEI7QUFDMUIsU0FBT0EsVUFBVUMsU0FBVixJQUF1QkQsVUFBVSxJQUF4QztBQUNEOztBQUVEOzs7O0lBR3FCRSxJO0FBQ25COzs7Ozs7O0FBT0EsZ0JBQWFDLEdBQWIsRUFBa0I7QUFBQTs7QUFDaEIsUUFBSSxFQUFFQSxlQUFlQyxLQUFqQixDQUFKLEVBQTZCO0FBQzNCRCxZQUFNLENBQUNBLEdBQUQsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBS0UsU0FBTCxHQUFpQixFQUFqQjs7QUFFQTtBQUNBLFNBQUtDLENBQUwsR0FBUztBQUNQSCxjQURPO0FBRVBJLGFBQU87QUFGQSxLQUFUO0FBSUQ7O0FBRUQ7Ozs7Ozs7Ozt5QkFLTUMsRyxFQUFLO0FBQ1QsV0FBS0YsQ0FBTCxDQUFPRyxJQUFQLEdBQWNELEdBQWQ7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7OzBCQUdPRSxJLEVBQU1DLFMsRUFBNEI7QUFBQTs7QUFBQSxVQUFqQkMsT0FBaUIsdUVBQVAsS0FBTzs7QUFDdkNGLHdCQUFnQkEsSUFBaEI7O0FBRUEsVUFBTUcsV0FBVyxFQUFqQjs7QUFFQSxXQUFLUCxDQUFMLENBQU9ILEdBQVAsQ0FBV1csT0FBWCxDQUFtQixlQUFPO0FBQ3hCO0FBQ0EsWUFBTUMsWUFBWVosSUFBSWEsT0FBSixDQUFZLE1BQVosTUFBd0IsQ0FBQyxDQUEzQzs7QUFFQTtBQUNBLFlBQUlDLFVBQVUsRUFBZDtBQUx3QjtBQUFBO0FBQUE7O0FBQUE7QUFNeEIsK0JBQWdCZCxJQUFJZSxLQUFKLENBQVUsR0FBVixDQUFoQiw4SEFBZ0M7QUFBQSxnQkFBdkJDLEdBQXVCOztBQUM5QixnQkFBSUEsR0FBSixFQUFTO0FBQ1Asa0JBQUlBLElBQUlILE9BQUosQ0FBWSxHQUFaLE1BQXFCLENBQUMsQ0FBMUIsRUFBNkI7QUFDM0I7QUFDRDs7QUFFREMseUJBQVcsZUFBS0csR0FBTCxHQUFXRCxHQUF0QjtBQUNEO0FBQ0Y7QUFkdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFleEJGLGtCQUFVLGVBQUtJLE9BQUwsQ0FBYVYsU0FBYixFQUF3Qk0sUUFBUUssTUFBUixDQUFlLENBQWYsQ0FBeEIsQ0FBVjs7QUFFQTtBQUNBOztBQUVBO0FBQ0EzQixpQkFBUyxxQkFBVCxFQUFnQ2UsSUFBaEM7QUFDQUcsaUJBQVNVLElBQVQsQ0FBYyxhQUFHQyxLQUFILENBQVNQLE9BQVQsRUFBa0I7QUFDOUJGLHFCQUFXWixJQUFJYSxPQUFKLENBQVksTUFBWixNQUF3QixDQUFDO0FBRE4sU0FBbEIsRUFFWDtBQUFBLGlCQUFNLE1BQUtTLEtBQUwsQ0FBV2YsSUFBWCxFQUFpQkMsU0FBakIsRUFBNEJDLE9BQTVCLEVBQXFDLEtBQXJDLENBQU47QUFBQSxTQUZXLENBQWQ7QUFHRCxPQXpCRDs7QUEyQkEsYUFBTyxJQUFJYyxPQUFKLENBQVksbUJBQVc7QUFDNUJDLGdCQUFRQyxFQUFSLENBQVcsUUFBWCxFQUFxQixZQUFNO0FBQ3pCZixtQkFBU0MsT0FBVCxDQUFpQjtBQUFBLG1CQUFXZSxRQUFRQyxLQUFSLEVBQVg7QUFBQSxXQUFqQjtBQUNBVDtBQUNELFNBSEQ7QUFJRCxPQUxNLENBQVA7QUFNRDs7QUFFRDs7Ozs7Ozs0RUFHb0JYLEksRUFBTUMsUyxFQUFXb0IsUSxFQUFVdEIsSTtZQUFNdUIsYyx1RUFBaUIsSTs7Ozs7Ozs7Z0NBQzdDLG1DQUFxQnRCLElBQXJCLEMsRUFBZmQsRyxpQkFBQUEsRyxFQUFLcUMsSyxpQkFBQUEsSzs7QUFDYkEsc0JBQU0sMkJBQU47O0FBRUE7OztBQUdNQyx5QixHQUFZeEMsTUFBTXdDLFNBQU4sQ0FBZ0J4QixJQUFoQixDOztBQUVsQjs7Ozs7dUJBR29CLG9CQUFLLEtBQUtKLENBQUwsQ0FBT0gsR0FBWixFQUFpQlEsU0FBakIsRUFBNEJxQixjQUE1QixFQUE0QyxJQUE1QyxDOzs7QUFBZEcscUI7OztBQUVOOzs7QUFHSUMsMEIsR0FBYSxJO0FBQ1hDLDBCLEdBQWEsRTs7Ozs7OztBQUVuQixrQ0FBaUJGLEtBQWpCLDJIQUF3QjtBQUFmRyxzQkFBZTs7QUFDdEIsc0JBQUlQLFNBQVNmLE9BQVQsQ0FBaUJzQixJQUFqQixNQUEyQixDQUFDLENBQWhDLEVBQW1DO0FBQ2pDRCwrQkFBV0MsSUFBWCxJQUFtQixJQUFuQjtBQUNBRixpQ0FBYSxLQUFiO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQkFHbUJBLFU7Ozs7OzhCQUFhLEk7Ozs7Ozt1QkFBYSxtQkFBUzNCLElBQVQsRUFBZSxHQUFmLEM7Ozs7OztBQUF2QzhCLDBCOzt1QkFDbUMsbUI7Ozs7O0FBQWxDQyx5QjtBQUFXQyw2Qjs7O0FBRWxCOzs7QUFHTUMsc0IsR0FBUywyQkFBYUYsU0FBYixDOztBQUVmOzs7OztBQUlNZixxQixHQUFRa0IsS0FBS0MsR0FBTCxFOztBQUNkaEQsb0JBQUksZUFBSjs7QUFFQTs7Ozs7OztBQUdBLGtDQUFpQnVDLEtBQWpCLDJIQUF3QjtBQUFmRyx1QkFBZTtBQUNsQk8sd0JBRGtCOzs7QUFHdEIsc0JBQUlSLFdBQVdDLEtBQVgsQ0FBSixFQUFzQjtBQUNwQkwsMEJBQU0sYUFBTixFQUFxQkssS0FBckI7QUFDQU8sNkJBQVMsYUFBR0MsZ0JBQUgsQ0FBb0IsSUFBcEIsRUFBMEI7QUFDakNDLDBCQUFJUixVQUQ2QjtBQUVqQ1MsaUNBQVcsS0FGc0I7QUFHakN2Qiw2QkFBT1MsVUFBVUksS0FBVixFQUFnQmIsS0FIVTtBQUlqQ3dCLDJCQUFLZixVQUFVSSxLQUFWLEVBQWdCVztBQUpZLHFCQUExQixDQUFUO0FBTUQsbUJBUkQsTUFRTztBQUNMaEIsMEJBQU0sZUFBTixFQUF1QkssS0FBdkI7QUFDQU8sNkJBQVMsb0JBQUssQ0FDWiwrQkFBaUJQLEtBQWpCLEVBQXVCN0IsT0FBTyxHQUFQLEdBQWEsZUFBS3lDLFFBQUwsQ0FBY1osS0FBZCxDQUFwQyxDQURZLEVBRVphLE1BRlksQ0FFTCxLQUFLQyxVQUFMLEVBRkssQ0FBTCxDQUFUO0FBR0Q7O0FBRURWLHlCQUFPVyxHQUFQLENBQVdmLEtBQVgsRUFBaUJPLE1BQWpCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQUdNSCxPQUFPTyxHQUFQLENBQVdSLGFBQVgsQzs7OztBQUVOOzs7QUFHQSxvQkFBSUYsVUFBSixFQUFnQkEsV0FBV1QsS0FBWDs7dUJBQ1YsaUJBQU8sZUFBS3dCLE9BQUwsQ0FBYTdDLElBQWIsRUFBbUI4QyxPQUFuQixDQUEyQjVDLFNBQTNCLEVBQXNDLEVBQXRDLENBQVAsRUFBa0RBLFNBQWxELEM7Ozs7dUJBQ0EsSUFBSWUsT0FBSixDQUFZLFVBQUNMLE9BQUQsRUFBVW1DLE1BQVYsRUFBcUI7QUFDckMsc0JBQU1YLFNBQVMsYUFBR0MsZ0JBQUgsQ0FBb0JMLGFBQXBCLEVBQW1DZ0IsSUFBbkMsQ0FBd0MsYUFBR0MsaUJBQUgsQ0FBcUJqRCxJQUFyQixDQUF4QyxDQUFmOztBQUVBb0MseUJBQU9qQixFQUFQLENBQVUsT0FBVixFQUFtQlAsT0FBbkI7QUFDQXdCLHlCQUFPakIsRUFBUCxDQUFVLE9BQVYsRUFBbUI0QixNQUFuQjtBQUNELGlCQUxLLEM7Ozs7QUFPTjs7O0FBR0E5RCxzQkFBTXdDLFNBQU4sQ0FBZ0J4QixJQUFoQixFQUFzQmdDLE9BQU9pQixHQUE3Qjs7QUFFQS9ELG9CQUFJLHlCQUFKLEVBQStCK0MsS0FBS0MsR0FBTCxLQUFhbkIsS0FBNUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0Y7Ozs7OztpQ0FHYztBQUFBOztBQUNaLFVBQUltQyxPQUFPLFFBQVg7O0FBRUEsYUFBTyxLQUFLdEQsQ0FBTCxDQUFPQyxLQUFQLENBQWFvRCxHQUFiLENBQWlCLGlCQUFjO0FBQUE7QUFBQSxZQUFaRSxNQUFZOztBQUNwQyxZQUFNQyxlQUFlLHlCQUFVLFVBQUNDLElBQUQsRUFBT0MsSUFBUCxFQUFnQjtBQUM3QyxjQUFJO0FBQ0ZuRSxvQkFBUWdFLE1BQVIsRUFDRSxPQUFLeEQsU0FBTCxDQUFld0QsTUFBZixDQURGLEVBRUVFLElBRkYsRUFJR0UsSUFKSCxDQUlRO0FBQUEscUJBQVdELEtBQUssSUFBTCxFQUFXRSxPQUFYLENBQVg7QUFBQSxhQUpSLEVBS0dDLEtBTEgsQ0FLUztBQUFBLHFCQUFPSCxLQUFLSSxHQUFMLENBQVA7QUFBQSxhQUxUO0FBTUQsV0FQRCxDQU9FLE9BQU9BLEdBQVAsRUFBWTtBQUNaSixpQkFBS0ksR0FBTDtBQUNEO0FBQ0YsU0FYb0IsQ0FBckI7O0FBYUE7OztBQUdBLFlBQUlSLFNBQVMsUUFBVCxJQUFxQjlELGFBQWErRCxNQUFiLEVBQXFCRCxJQUFyQixLQUE4QixRQUF2RCxFQUFpRTtBQUMvREEsaUJBQU8sUUFBUDtBQUNBLGlCQUFPLG9CQUFLLHNCQUFMLEVBQWVFLFlBQWYsQ0FBUDtBQUNEOztBQUVEOzs7QUFHQSxlQUFPQSxZQUFQO0FBQ0QsT0ExQk0sQ0FBUDtBQTJCRDs7QUFFRDs7Ozs7OytCQUdZTyxRLEVBQVVSLE0sRUFBUVMsSSxFQUFNO0FBQ2xDLFVBQUlDLE1BQU0xRSxRQUFRZ0UsTUFBUixDQUFWOztBQUVBLFVBQUksQ0FBQ1UsR0FBTCxFQUFVO0FBQ1JBLGNBQU1DLFFBQVFYLE1BQVIsQ0FBTjs7QUFFQTtBQUNBL0QscUJBQWErRCxNQUFiLElBQXVCVSxJQUFJRSxNQUFKLElBQWMsRUFBckM7O0FBRUE7QUFDQTtBQUNBLFlBQUlGLElBQUlHLFVBQUosS0FBbUIsSUFBdkIsRUFBNkI7QUFDM0JILGdCQUFNQSxJQUFJSSxPQUFWO0FBQ0Q7O0FBRUQ7QUFDQTlFLGdCQUFRZ0UsTUFBUixJQUFrQlUsR0FBbEI7QUFDRDs7QUFFRDtBQUNBLFVBQU1LLFNBQVMsbUNBQXFCUCxRQUFyQixTQUFpQyxlQUFLbkIsUUFBTCxDQUFjVyxNQUFkLEVBQXNCdkMsTUFBdEIsQ0FBNkIsQ0FBN0IsQ0FBakMsQ0FBZjs7QUFFQTtBQUNBLFdBQUtqQixTQUFMLENBQWV3RCxNQUFmLElBQXlCO0FBQ3ZCUyxrQkFEdUI7QUFFdkIxRSxhQUFLZ0YsT0FBT2hGLEdBRlc7QUFHdkJxQyxlQUFPMkMsT0FBTzNDLEtBSFM7QUFJdkI0QyxlQUFPRCxPQUFPQztBQUpTLE9BQXpCO0FBTUQ7O0FBRUQ7Ozs7Ozs7OzhFQUlhbkUsSSxFQUFNQyxTOzs7WUFBV0MsTyx1RUFBVSxLO1lBQU9vQixjLHVFQUFpQixJOzs7Ozs7OztpQ0FDdkMsbUNBQXFCdEIsSUFBckIsQyxFQUFmZCxHLGtCQUFBQSxHLEVBQUtxQyxLLGtCQUFBQSxLOztBQUViOzs7O0FBR0Esb0JBQUlsQyxZQUFZLEtBQUsrRSxhQUFqQixLQUFtQy9FLFlBQVksS0FBS2dGLGNBQWpCLENBQW5DLElBQXdFLEtBQUt6RSxDQUFMLENBQU9DLEtBQVAsQ0FBYXlFLE1BQWIsR0FBc0IsQ0FBdEIsSUFBMkIsQ0FBQyxLQUFLQyxhQUE3RyxFQUE2SDtBQUMzSCx1QkFBS0EsYUFBTCxHQUFxQixJQUFyQjs7QUFFQSx1QkFBSzNFLENBQUwsQ0FBT0MsS0FBUCxDQUFhTyxPQUFiLENBQXFCLGlCQUFvQjtBQUFBO0FBQUEsd0JBQWxCK0MsTUFBa0I7QUFBQSx3QkFBVlMsSUFBVTs7QUFDdkMsd0JBQUksQ0FBQyxPQUFLakUsU0FBTCxDQUFlNkUsY0FBZixDQUE4QnJCLE1BQTlCLENBQUwsRUFBNEM7QUFDMUMsNkJBQUtzQixVQUFMLENBQWdCekUsSUFBaEIsRUFBc0JtRCxNQUF0QixFQUE4QlMsSUFBOUI7QUFDRDs7QUFFRCwyQkFBS1EsYUFBTCxHQUFxQixDQUFDLEVBQUUsT0FBS0EsYUFBTCxJQUFzQmhGLGFBQWErRCxNQUFiLEVBQXFCbkIsTUFBN0MsQ0FBdEI7QUFDQSwyQkFBS3FDLGNBQUwsR0FBc0IsQ0FBQyxFQUFFLE9BQUtBLGNBQUwsSUFBdUJqRixhQUFhK0QsTUFBYixFQUFxQmpELE9BQTlDLENBQXZCO0FBQ0QsbUJBUEQ7QUFRRDs7QUFFRDs7O0FBR0Esb0JBQUksS0FBS21FLGNBQVQsRUFBeUI7QUFDdkJuRSw0QkFBVSxJQUFWO0FBQ0Q7O0FBRUQ7OztBQUdBcUIsc0JBQU0sbUJBQU4sRUFBMkJyQixPQUEzQjs7dUJBQ2tCLG9CQUFLLEtBQUtOLENBQUwsQ0FBT0gsR0FBWixFQUFpQlEsU0FBakIsRUFBNEJxQixjQUE1QixFQUE0Q3BCLE9BQTVDLEM7OztBQUFkdUIscUI7O3NCQUVBQSxNQUFNNkMsTUFBTixHQUFlLEM7Ozs7O0FBQ1h2RSxvQixHQUFPLGVBQUtZLE9BQUwsQ0FBYVYsU0FBYixFQUF3Qix1QkFBUSxLQUFLTCxDQUFMLENBQU9HLElBQWYsQ0FBeEIsQzs7QUFFYjs7OztxQkFHSSxLQUFLcUUsYTs7Ozs7O3VCQUNNLEtBQUtNLGFBQUwsQ0FBbUIxRSxJQUFuQixFQUF5QkMsU0FBekIsRUFBb0N3QixLQUFwQyxFQUEyQzFCLElBQTNDLEVBQWlEdUIsY0FBakQsQzs7Ozs7Ozt1QkFNVCxpQkFBT3ZCLEtBQUs4QyxPQUFMLENBQWE1QyxTQUFiLEVBQXdCLEVBQXhCLENBQVAsRUFBb0NBLFNBQXBDLEM7Ozs7QUFFTjs7O0FBR0F3Qix3QkFBUSxjQUFFQSxLQUFGLEVBQVN3QixHQUFULENBQWE7QUFBQSx5QkFBUztBQUM1QnJCLDhCQUQ0QjtBQUU1Qk8sNEJBQVEsQ0FDTiwrQkFBaUJQLElBQWpCLEVBQXVCN0IsT0FBTyxHQUFQLEdBQWEsZUFBS3lDLFFBQUwsQ0FBY1osSUFBZCxDQUFwQyxDQURNO0FBRm9CLG1CQUFUO0FBQUEsaUJBQWIsQ0FBUjs7QUFPQSxvQkFBSSxLQUFLaEMsQ0FBTCxDQUFPQyxLQUFQLENBQWF5RSxNQUFiLEdBQXNCLENBQTFCLEVBQTZCO0FBQzNCOzs7QUFHTXpFLHVCQUpxQixHQUliLEtBQUs2QyxVQUFMLEVBSmE7O0FBTTNCOzs7O0FBR0FqQix3QkFBTXdCLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQnJCLHlCQUFLTyxNQUFMLEdBQWNQLEtBQUtPLE1BQUwsQ0FBWU0sTUFBWixDQUFtQjVDLEtBQW5CLENBQWQ7QUFDQSwyQkFBTytCLElBQVA7QUFDRCxtQkFIRDtBQUlEOztBQUVEOzs7QUFHQUgsc0JBQU13QixHQUFOLENBQVUsZ0JBQVE7QUFDaEI7QUFDQXJCLHVCQUFLTyxNQUFMLENBQVl0QixJQUFaLENBQWlCLHlCQUFVLFVBQUN3QyxJQUFELEVBQU9DLElBQVAsRUFBZ0I7QUFDekMsd0JBQUksUUFBT0QsSUFBUCx5Q0FBT0EsSUFBUCxPQUFnQixRQUFoQixJQUE0QixDQUFDQSxLQUFLbUIsY0FBTCxDQUFvQixNQUFwQixDQUFqQyxFQUE4RDtBQUM1RCw2QkFBT2xCLEtBQUssSUFBSXFCLEtBQUosQ0FBVSw4REFBVixDQUFMLENBQVA7QUFDRDs7QUFFRHJCLHlCQUFLLElBQUwsRUFBV0QsS0FBS3VCLElBQWhCO0FBQ0QsbUJBTmdCLENBQWpCO0FBT0FoRCx1QkFBS08sTUFBTCxDQUFZdEIsSUFBWixDQUFpQixhQUFHbUMsaUJBQUgsQ0FBcUJqRCxPQUFPLEdBQVAsR0FBYSxlQUFLeUMsUUFBTCxDQUFjWixLQUFLQSxJQUFuQixDQUFsQyxDQUFqQjs7QUFFQTtBQUNBLHlCQUFPLElBQUlaLE9BQUosQ0FBWSxVQUFDTCxPQUFELEVBQVVtQyxNQUFWLEVBQXFCO0FBQ3RDO0FBQ0FsQix5QkFBS08sTUFBTCxHQUFjLG9CQUFLUCxLQUFLTyxNQUFWLEVBQWtCLGVBQU87QUFDckMsMEJBQUl1QixHQUFKLEVBQVNaLE9BQU9ZLEdBQVA7QUFDVixxQkFGYSxDQUFkO0FBR0E5Qix5QkFBS08sTUFBTCxDQUFZakIsRUFBWixDQUFlLE9BQWYsRUFBd0JQLE9BQXhCO0FBQ0QsbUJBTk0sQ0FBUDtBQU9ELGlCQW5CRDs7QUFxQkE7QUFDTUksc0IsR0FBUWtCLEtBQUtDLEdBQUwsRTs7QUFDZGhELG9CQUFJLGVBQUo7O3VCQUNNOEIsUUFBUTZELEdBQVIsQ0FBWXBELE1BQU1xRCxHQUFOLEVBQVosQzs7O0FBQ041RixvQkFBSSx5QkFBSixFQUErQitDLEtBQUtDLEdBQUwsS0FBYW5CLE1BQTVDOzs7OztBQUVBN0Isb0JBQUksZUFBSjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSjs7Ozs7Ozs2QkFJVTtBQUNSLGFBQU87QUFDTGEsY0FBTSxLQUFLSCxDQUFMLENBQU9HLElBRFI7QUFFTE4sYUFBSyxLQUFLRyxDQUFMLENBQU9ILEdBRlA7QUFHTEksZUFBTyxLQUFLRCxDQUFMLENBQU9DLEtBSFQ7QUFJTHVFLHVCQUFlLEtBQUtBLGFBSmY7QUFLTEMsd0JBQWdCLEtBQUtBO0FBTGhCLE9BQVA7QUFPRDs7QUFFRDs7Ozs7Ozs7NkJBS1VVLEksRUFBTTtBQUNkLFdBQUtuRixDQUFMLENBQU9HLElBQVAsR0FBY2dGLEtBQUtoRixJQUFuQjtBQUNBLFdBQUtILENBQUwsQ0FBT0gsR0FBUCxHQUFhc0YsS0FBS3RGLEdBQWxCO0FBQ0EsV0FBS0csQ0FBTCxDQUFPQyxLQUFQLEdBQWVrRixLQUFLbEYsS0FBcEI7QUFDQSxXQUFLdUUsYUFBTCxHQUFxQlcsS0FBS1gsYUFBMUI7QUFDQSxXQUFLQyxjQUFMLEdBQXNCVSxLQUFLVixjQUEzQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQTNYa0I3RSxJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2ZzL2dsb2InXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBtYXBTdHJlYW0gZnJvbSAnbWFwLXN0cmVhbSdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2ZzL2dldC1wYXRoJ1xuaW1wb3J0IHsgXywgY3JlYXRlTG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMnXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSwgbWtkaXJwLCBvcGVuRmlsZSwgdG1wRmlsZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IHsgYnVmZmVyLCBjcmVhdGVCdW5kbGUsIGNyZWF0ZVJlYWRTdHJlYW0gfSBmcm9tICcuLi9zdHJlYW1zJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5Db25maWcgPSB7fVxuXG4vKipcbiAqIFRlc3QgZm9yIHVuZGVmaW5lZCBvciBudWxsLlxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICAvLyBzdG9yZSBjb250ZXh0IGxvY2FsIHRvIGVhY2ggdGFza1xuICAgIHRoaXMucGx1Z2luQ3R4ID0ge31cblxuICAgIC8vIHBlcnNpc3RlbnQgaW5mb1xuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSkge1xuICAgIG5hbWUgPSBgd2F0Y2g6JHtuYW1lfWBcblxuICAgIGNvbnN0IHdhdGNoZXJzID0gW11cblxuICAgIHRoaXMuZC5zcmMuZm9yRWFjaChzcmMgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCBpZiB3YXRjaCBzaG91bGQgYmUgcmVjdXJzaXZlXG4gICAgICBjb25zdCByZWN1cnNpdmUgPSBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuXG4gICAgICAvLyBnZXQgbW9zdCBkZWZpbml0aXZlIHBhdGggcG9zc2libGVcbiAgICAgIGxldCBuZXdwYXRoID0gJydcbiAgICAgIGZvciAobGV0IHN1YiBvZiBzcmMuc3BsaXQoJy8nKSkge1xuICAgICAgICBpZiAoc3ViKSB7XG4gICAgICAgICAgaWYgKHN1Yi5pbmRleE9mKCcqJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5ld3BhdGggKz0gcGF0aC5zZXAgKyBzdWJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3cGF0aCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIG5ld3BhdGguc3Vic3RyKDEpKVxuXG4gICAgICAvLyBkaXNhYmxlIGZzIGNhY2hpbmcgZm9yIHdhdGNoXG4gICAgICBkaXNhYmxlRlNDYWNoZSgpXG5cbiAgICAgIC8vIHN0YXJ0IHdhdGNoXG4gICAgICB3YXRjaGxvZygnV2F0Y2hpbmcgZm9yICVzIC4uLicsIG5hbWUpXG4gICAgICB3YXRjaGVycy5wdXNoKGZzLndhdGNoKG5ld3BhdGgsIHtcbiAgICAgICAgcmVjdXJzaXZlOiBzcmMuaW5kZXhPZignLyoqLycpICE9PSAtMVxuICAgICAgfSwgKCkgPT4gdGhpcy5zdGFydChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUsIGZhbHNlKSkpXG4gICAgfSlcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBidW5kbGluZy5cbiAgICovXG4gIGFzeW5jIHN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBtb2RpZmllZCwgZGVzdCwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgZGVidWcoJ1N3aXRjaGVkIHRvIGJ1bmRsaW5nIG1vZGUnKVxuXG4gICAgLyoqXG4gICAgICogRmV0Y2ggc291cmNlbWFwIGZyb20gY2FjaGUuXG4gICAgICovXG4gICAgY29uc3Qgc291cmNlbWFwID0gY2FjaGUuc291cmNlbWFwKG5hbWUpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZnVsbCBsaXN0IG9mIGN1cnJlbnQgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHRydWUpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbGlzdCBvZiB1bm1vZGlmaWVkLlxuICAgICAqL1xuICAgIGxldCBmcmVzaEJ1aWxkID0gdHJ1ZVxuICAgIGNvbnN0IHVubW9kaWZpZWQgPSB7fVxuXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgaWYgKG1vZGlmaWVkLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgIHVubW9kaWZpZWRbZmlsZV0gPSB0cnVlXG4gICAgICAgIGZyZXNoQnVpbGQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvbGQgYnVuZGxlICYgY3JlYXRlIG5ldyBvbmUuXG4gICAgICovXG4gICAgY29uc3Qgb3JpZ2luYWxGZCA9IGZyZXNoQnVpbGQgPyBudWxsIDogYXdhaXQgb3BlbkZpbGUoZGVzdCwgJ3InKVxuICAgICAgICAsIFt0bXBCdW5kbGUsIHRtcEJ1bmRsZVBhdGhdID0gYXdhaXQgdG1wRmlsZSgpXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG5ldyBidW5kbGUgdG8gZm9yd2FyZCB0by5cbiAgICAgKi9cbiAgICBjb25zdCBidW5kbGUgPSBjcmVhdGVCdW5kbGUodG1wQnVuZGxlKVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgYnVuZGxpbmcgc3RhcnRzIHN0cmVhbWluZyByaWdodCBhd2F5LCB3ZSBjYW4gY291bnQgdGhpc1xuICAgICAqIGFzIHRoZSBzdGFydCBvZiB0aGUgYnVpbGQuXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgZmlsZXMuXG4gICAgICovXG4gICAgZm9yIChsZXQgZmlsZSBvZiBmaWxlcykge1xuICAgICAgbGV0IHN0cmVhbVxuXG4gICAgICBpZiAodW5tb2RpZmllZFtmaWxlXSkge1xuICAgICAgICBkZWJ1ZygnZm9yd2FyZDogJXMnLCBmaWxlKVxuICAgICAgICBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKG51bGwsIHtcbiAgICAgICAgICBmZDogb3JpZ2luYWxGZCxcbiAgICAgICAgICBhdXRvQ2xvc2U6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0OiBzb3VyY2VtYXBbZmlsZV0uc3RhcnQsXG4gICAgICAgICAgZW5kOiBzb3VyY2VtYXBbZmlsZV0uZW5kXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndHJhbnNmb3JtOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IHB1bXAoW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZSkpXG4gICAgICAgIF0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG4gICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICovXG4gICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgcGx1Z2luQ29uZmlnW3BsdWdpbl0ubW9kZSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAgICovXG4gIGxvYWRQbHVnaW4gKHRhc2tOYW1lLCBwbHVnaW4sIGFyZ3MpIHtcbiAgICBsZXQgbW9kID0gcGx1Z2luc1twbHVnaW5dXG4gICAgXG4gICAgaWYgKCFtb2QpIHtcbiAgICAgIG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuICAgICAgXG4gICAgICAvLyBleHBvc2UgbW9kdWxlIGNvbmZpZ1xuICAgICAgcGx1Z2luQ29uZmlnW3BsdWdpbl0gPSBtb2QuY29uZmlnIHx8IHt9XG5cbiAgICAgIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gICAgICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gICAgICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICAgICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHBsdWdpbnMgdG8gbG9hZGVkIHBsdWdpbnNcbiAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IG1vZFxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gICAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7dGFza05hbWV9OiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gICAgdGhpcy5wbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICAgIGFyZ3MsXG4gICAgICBsb2c6IGxvZ2dlci5sb2csXG4gICAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBGaWd1cmUgb3V0IGlmIGJ1bmRsaW5nIGlzIG5lZWRlZCAmIGxvYWQgcGx1Z2lucy5cbiAgICAgKi9cbiAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5uZWVkc0J1bmRsaW5nKSB8fCBpc1VuZGVmaW5lZCh0aGlzLm5lZWRzUmVjYWNoaW5nKSB8fCAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMubG9hZGVkUGx1Z2lucykpIHtcbiAgICAgIHRoaXMubG9hZGVkUGx1Z2lucyA9IHRydWVcblxuICAgICAgdGhpcy5kLnN0YWNrLmZvckVhY2goKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5DdHguaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIHRoaXMubG9hZFBsdWdpbihuYW1lLCBwbHVnaW4sIGFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSAhISh0aGlzLm5lZWRzQnVuZGxpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0uYnVuZGxlKVxuICAgICAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0gISEodGhpcy5uZWVkc1JlY2FjaGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5yZWNhY2hlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSByZWNhY2hpbmcuXG4gICAgICovXG4gICAgaWYgKHRoaXMubmVlZHNSZWNhY2hpbmcpIHtcbiAgICAgIHJlY2FjaGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBkZWJ1ZygndGFzayByZWNhY2hlID0gJXMnLCByZWNhY2hlKVxuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgcmVjYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG5cbiAgICAgIC8qKlxuICAgICAgICogU3dpdGNoIHRvIGJ1bmRsaW5nIG1vZGUgaWYgbmVlZCBiZS5cbiAgICAgICAqL1xuICAgICAgaWYgKHRoaXMubmVlZHNCdW5kbGluZykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFydEJ1bmRsaW5nKG5hbWUsIGRpcmVjdG9yeSwgZmlsZXMsIGRlc3QsIHVzZURvdWJsZUNhY2hlKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBkaXN0IGRpcmVjdG9yeSBleGlzdHMuXG4gICAgICAgKi9cbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKCdBIHBsdWdpbiBoYXMgZGVzdHJveWVkIHRoZSBzdHJlYW0gYnkgcmV0dXJuaW5nIGEgbm9uLW9iamVjdC4nKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0KG51bGwsIGRhdGEuYm9keSlcbiAgICAgICAgfSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gcHJvbWlzaWZ5IHRoZSBjdXJyZW50IHBpcGVsaW5lXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtLCBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICAvLyBzdGFydCAmIHdhaXQgZm9yIGFsbCBwaXBlbGluZXMgdG8gZW5kXG4gICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcy52YWwoKSlcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnU2tpcHBpbmcgdGFzaycpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrLFxuICAgICAgbmVlZHNCdW5kbGluZzogdGhpcy5uZWVkc0J1bmRsaW5nLFxuICAgICAgbmVlZHNSZWNhY2hpbmc6IHRoaXMubmVlZHNSZWNhY2hpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBqc29uLm5lZWRzQnVuZGxpbmdcbiAgICB0aGlzLm5lZWRzUmVjYWNoaW5nID0ganNvbi5uZWVkc1JlY2FjaGluZ1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19