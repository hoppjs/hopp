'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

    // add plugins to loaded plugins
  };plugins[plugin] = mod;
};

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

    this.needsBundling = false;
    this.needsRecaching = false;

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
        var _this2 = this;

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

                    if (!plugins.hasOwnProperty(plugin)) {
                      loadPlugin(plugin, args);
                    }

                    _this2.needsBundling = !!(_this2.needsBundling || pluginConfig[plugin].bundle);
                    _this2.needsRecaching = !!(_this2.needsRecaching || pluginConfig[plugin].recache);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsImlzVW5kZWZpbmVkIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJIb3BwIiwic3JjIiwiQXJyYXkiLCJuZWVkc0J1bmRsaW5nIiwibmVlZHNSZWNhY2hpbmciLCJkIiwic3RhY2siLCJvdXQiLCJkZXN0IiwibmFtZSIsImRpcmVjdG9yeSIsInJlY2FjaGUiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInNwbGl0Iiwic3ViIiwic2VwIiwicmVzb2x2ZSIsInB1c2giLCJ3YXRjaCIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsIm1vZGlmaWVkIiwidXNlRG91YmxlQ2FjaGUiLCJzb3VyY2VtYXAiLCJmaWxlcyIsImZyZXNoQnVpbGQiLCJ1bm1vZGlmaWVkIiwiZmlsZSIsIm9yaWdpbmFsRmQiLCJ0bXBCdW5kbGUiLCJ0bXBCdW5kbGVQYXRoIiwiYnVuZGxlIiwiRGF0ZSIsIm5vdyIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmZCIsImF1dG9DbG9zZSIsImVuZCIsImNvbmNhdCIsImJ1aWxkU3RhY2siLCJhZGQiLCJkaXJuYW1lIiwicmVwbGFjZSIsInJlamVjdCIsInBpcGUiLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm1hcCIsIm1vZGUiLCJwbHVnaW5TdHJlYW0iLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJsZW5ndGgiLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJzdGFydEJ1bmRsaW5nIiwiRXJyb3IiLCJib2R5IiwiYWxsIiwidmFsIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUMsV0FBVyx5QkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsSUFBTUMsVUFBVSxFQUFoQjtBQUNBLElBQU1DLFlBQVksRUFBbEI7QUFDQSxJQUFNQyxlQUFlLEVBQXJCOztBQUVBOzs7QUFHQSxJQUFNQyxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsTUFBRCxFQUFTQyxJQUFULEVBQWtCO0FBQ25DLE1BQUlDLE1BQU1DLFFBQVFILE1BQVIsQ0FBVjs7QUFFQTtBQUNBRixlQUFhRSxNQUFiLElBQXVCRSxJQUFJRSxNQUFKLElBQWMsRUFBckM7O0FBRUE7QUFDQTtBQUNBLE1BQUlGLElBQUlHLFVBQUosS0FBbUIsSUFBdkIsRUFBNkI7QUFDM0JILFVBQU1BLElBQUlJLE9BQVY7QUFDRDs7QUFFRDtBQUNBLE1BQU1DLFNBQVMsbUNBQXFCLGVBQUtDLFFBQUwsQ0FBY1IsTUFBZCxFQUFzQlMsTUFBdEIsQ0FBNkIsQ0FBN0IsQ0FBckIsQ0FBZjs7QUFFQTtBQUNBWixZQUFVRyxNQUFWLElBQW9CO0FBQ2xCQyxjQURrQjtBQUVsQk4sU0FBS1ksT0FBT1osR0FGTTtBQUdsQmUsV0FBT0gsT0FBT0csS0FISTtBQUlsQkMsV0FBT0osT0FBT0k7O0FBR2hCO0FBUG9CLEdBQXBCLENBUUFmLFFBQVFJLE1BQVIsSUFBa0JFLEdBQWxCO0FBQ0QsQ0F6QkQ7O0FBMkJBOzs7QUFHQSxTQUFTVSxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUMxQixTQUFPQSxVQUFVQyxTQUFWLElBQXVCRCxVQUFVLElBQXhDO0FBQ0Q7O0FBRUQ7Ozs7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dUMsR0FBTixFQUFaLEM7OztBQUNOM0Ysb0JBQUkseUJBQUosRUFBK0I0RCxLQUFLQyxHQUFMLEtBQWFsQixNQUE1Qzs7Ozs7QUFFQTNDLG9CQUFJLGVBQUo7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUo7Ozs7Ozs7NkJBSVU7QUFDUixhQUFPO0FBQ0w0QixjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMUCxhQUFLLEtBQUtJLENBQUwsQ0FBT0osR0FGUDtBQUdMSyxlQUFPLEtBQUtELENBQUwsQ0FBT0MsS0FIVDtBQUlMSCx1QkFBZSxLQUFLQSxhQUpmO0FBS0xDLHdCQUFnQixLQUFLQTtBQUxoQixPQUFQO0FBT0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVb0UsSSxFQUFNO0FBQ2QsV0FBS25FLENBQUwsQ0FBT0csSUFBUCxHQUFjZ0UsS0FBS2hFLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPSixHQUFQLEdBQWF1RSxLQUFLdkUsR0FBbEI7QUFDQSxXQUFLSSxDQUFMLENBQU9DLEtBQVAsR0FBZWtFLEtBQUtsRSxLQUFwQjtBQUNBLFdBQUtILGFBQUwsR0FBcUJxRSxLQUFLckUsYUFBMUI7QUFDQSxXQUFLQyxjQUFMLEdBQXNCb0UsS0FBS3BFLGNBQTNCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBeFZrQkosSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9mcy9nbG9iJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9mcy9nZXQtcGF0aCdcbmltcG9ydCB7IF8sIGNyZWF0ZUxvZ2dlciB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUsIG1rZGlycCwgb3BlbkZpbGUsIHRtcEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCB7IGJ1ZmZlciwgY3JlYXRlQnVuZGxlLCBjcmVhdGVSZWFkU3RyZWFtIH0gZnJvbSAnLi4vc3RyZWFtcydcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ3R4ID0ge31cbmNvbnN0IHBsdWdpbkNvbmZpZyA9IHt9XG5cbi8qKlxuICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAqL1xuY29uc3QgbG9hZFBsdWdpbiA9IChwbHVnaW4sIGFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuICBcbiAgLy8gZXhwb3NlIG1vZHVsZSBjb25maWdcbiAgcGx1Z2luQ29uZmlnW3BsdWdpbl0gPSBtb2QuY29uZmlnIHx8IHt9XG5cbiAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgLy8gZXhwb3J0IGlzIGF0ICdkZWZhdWx0J1xuICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICB9XG5cbiAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICBwbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICBhcmdzLFxuICAgIGxvZzogbG9nZ2VyLmxvZyxcbiAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgfVxuXG4gIC8vIGFkZCBwbHVnaW5zIHRvIGxvYWRlZCBwbHVnaW5zXG4gIHBsdWdpbnNbcGx1Z2luXSA9IG1vZFxufVxuXG4vKipcbiAqIFRlc3QgZm9yIHVuZGVmaW5lZCBvciBudWxsLlxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLm5lZWRzQnVuZGxpbmcgPSBmYWxzZVxuICAgIHRoaXMubmVlZHNSZWNhY2hpbmcgPSBmYWxzZVxuXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlKSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGJ1bmRsaW5nLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIG1vZGlmaWVkLCBkZXN0LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBkZWJ1ZygnU3dpdGNoZWQgdG8gYnVuZGxpbmcgbW9kZScpXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaCBzb3VyY2VtYXAgZnJvbSBjYWNoZS5cbiAgICAgKi9cbiAgICBjb25zdCBzb3VyY2VtYXAgPSBjYWNoZS5zb3VyY2VtYXAobmFtZSlcblxuICAgIC8qKlxuICAgICAqIEdldCBmdWxsIGxpc3Qgb2YgY3VycmVudCBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgdHJ1ZSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBsaXN0IG9mIHVubW9kaWZpZWQuXG4gICAgICovXG4gICAgbGV0IGZyZXNoQnVpbGQgPSB0cnVlXG4gICAgY29uc3QgdW5tb2RpZmllZCA9IHt9XG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAobW9kaWZpZWQuaW5kZXhPZihmaWxlKSA9PT0gLTEpIHtcbiAgICAgICAgdW5tb2RpZmllZFtmaWxlXSA9IHRydWVcbiAgICAgICAgZnJlc2hCdWlsZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9sZCBidW5kbGUgJiBjcmVhdGUgbmV3IG9uZS5cbiAgICAgKi9cbiAgICBjb25zdCBvcmlnaW5hbEZkID0gZnJlc2hCdWlsZCA/IG51bGwgOiBhd2FpdCBvcGVuRmlsZShkZXN0LCAncicpXG4gICAgICAgICwgW3RtcEJ1bmRsZSwgdG1wQnVuZGxlUGF0aF0gPSBhd2FpdCB0bXBGaWxlKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IGJ1bmRsZSB0byBmb3J3YXJkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0IGJ1bmRsZSA9IGNyZWF0ZUJ1bmRsZSh0bXBCdW5kbGUpXG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBidW5kbGluZyBzdGFydHMgc3RyZWFtaW5nIHJpZ2h0IGF3YXksIHdlIGNhbiBjb3VudCB0aGlzXG4gICAgICogYXMgdGhlIHN0YXJ0IG9mIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFsbCBmaWxlcy5cbiAgICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBsZXQgc3RyZWFtXG5cbiAgICAgIGlmICh1bm1vZGlmaWVkW2ZpbGVdKSB7XG4gICAgICAgIGRlYnVnKCdmb3J3YXJkOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0obnVsbCwge1xuICAgICAgICAgIGZkOiBvcmlnaW5hbEZkLFxuICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG4gICAgICAgICAgc3RhcnQ6IHNvdXJjZW1hcFtmaWxlXS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHNvdXJjZW1hcFtmaWxlXS5lbmRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0cmFuc2Zvcm06ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gcHVtcChbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXS5jb25jYXQodGhpcy5idWlsZFN0YWNrKCkpKVxuICAgICAgfVxuXG4gICAgICBidW5kbGUuYWRkKGZpbGUsIHN0cmVhbSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYWl0IGZvciBidW5kbGluZyB0byBlbmQuXG4gICAgICovXG4gICAgYXdhaXQgYnVuZGxlLmVuZCh0bXBCdW5kbGVQYXRoKVxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgYnVuZGxlIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgICovXG4gICAgaWYgKG9yaWdpbmFsRmQpIG9yaWdpbmFsRmQuY2xvc2UoKVxuICAgIGF3YWl0IG1rZGlycChwYXRoLmRpcm5hbWUoZGVzdCkucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wQnVuZGxlUGF0aCkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSlcblxuICAgICAgc3RyZWFtLm9uKCdjbG9zZScsIHJlc29sdmUpXG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgIH0pXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc291cmNlbWFwLlxuICAgICAqL1xuICAgIGNhY2hlLnNvdXJjZW1hcChuYW1lLCBidW5kbGUubWFwKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbGwgcGx1Z2lucyBpbiB0aGUgc3RhY2sgaW50byBzdHJlYW1zLlxuICAgKi9cbiAgYnVpbGRTdGFjayAoKSB7XG4gICAgbGV0IG1vZGUgPSAnc3RyZWFtJ1xuXG4gICAgcmV0dXJuIHRoaXMuZC5zdGFjay5tYXAoKFtwbHVnaW5dKSA9PiB7XG4gICAgICBjb25zdCBwbHVnaW5TdHJlYW0gPSBtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICBwbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICApXG4gICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IG5leHQoZXJyKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8qKlxuICAgICAgICogRW5hYmxlIGJ1ZmZlciBtb2RlIGlmIHJlcXVpcmVkLlxuICAgICAgICovXG4gICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgcGx1Z2luQ29uZmlnW3BsdWdpbl0ubW9kZSA9PT0gJ2J1ZmZlcicpIHtcbiAgICAgICAgbW9kZSA9ICdidWZmZXInXG4gICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHBsdWdpblN0cmVhbVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5LCByZWNhY2hlID0gZmFsc2UsIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuXG4gICAgLyoqXG4gICAgICogRmlndXJlIG91dCBpZiBidW5kbGluZyBpcyBuZWVkZWQgJiBsb2FkIHBsdWdpbnMuXG4gICAgICovXG4gICAgaWYgKGlzVW5kZWZpbmVkKHRoaXMubmVlZHNCdW5kbGluZykgfHwgaXNVbmRlZmluZWQodGhpcy5uZWVkc1JlY2FjaGluZykgfHwgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLmxvYWRlZFBsdWdpbnMpKSB7XG4gICAgICB0aGlzLmxvYWRlZFBsdWdpbnMgPSB0cnVlXG5cbiAgICAgIHRoaXMuZC5zdGFjay5mb3JFYWNoKChbcGx1Z2luLCBhcmdzXSkgPT4ge1xuICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgIGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5uZWVkc0J1bmRsaW5nID0gISEodGhpcy5uZWVkc0J1bmRsaW5nIHx8IHBsdWdpbkNvbmZpZ1twbHVnaW5dLmJ1bmRsZSlcbiAgICAgICAgdGhpcy5uZWVkc1JlY2FjaGluZyA9ICEhKHRoaXMubmVlZHNSZWNhY2hpbmcgfHwgcGx1Z2luQ29uZmlnW3BsdWdpbl0ucmVjYWNoZSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgcmVjYWNoaW5nLlxuICAgICAqL1xuICAgIGlmICh0aGlzLm5lZWRzUmVjYWNoaW5nKSB7XG4gICAgICByZWNhY2hlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuXG4gICAgICAvKipcbiAgICAgICAqIFN3aXRjaCB0byBidW5kbGluZyBtb2RlIGlmIG5lZWQgYmUuXG4gICAgICAgKi9cbiAgICAgIGlmICh0aGlzLm5lZWRzQnVuZGxpbmcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIGZpbGVzLCBkZXN0LCB1c2VEb3VibGVDYWNoZSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBFbnN1cmUgZGlzdCBkaXJlY3RvcnkgZXhpc3RzLlxuICAgICAgICovXG4gICAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlKSlcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdGFjayA9IHRoaXMuYnVpbGRTdGFjaygpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdvYmplY3QnIHx8ICFkYXRhLmhhc093blByb3BlcnR5KCdib2R5JykpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0KG5ldyBFcnJvcignQSBwbHVnaW4gaGFzIGRlc3Ryb3llZCB0aGUgc3RyZWFtIGJ5IHJldHVybmluZyBhIG5vbi1vYmplY3QuJykpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dChudWxsLCBkYXRhLmJvZHkpXG4gICAgICAgIH0pKVxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIC8vIGNvbm5lY3QgYWxsIHN0cmVhbXMgdG9nZXRoZXIgdG8gZm9ybSBwaXBlbGluZVxuICAgICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSwgZXJyID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFjayxcbiAgICAgIG5lZWRzQnVuZGxpbmc6IHRoaXMubmVlZHNCdW5kbGluZyxcbiAgICAgIG5lZWRzUmVjYWNoaW5nOiB0aGlzLm5lZWRzUmVjYWNoaW5nXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG4gICAgdGhpcy5uZWVkc0J1bmRsaW5nID0ganNvbi5uZWVkc0J1bmRsaW5nXG4gICAgdGhpcy5uZWVkc1JlY2FjaGluZyA9IGpzb24ubmVlZHNSZWNhY2hpbmdcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=