'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

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

var _createLogger = (0, _utils.createLogger)('hopp'),
    debug = _createLogger.debug;

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
     * Allow renaming of destination files.
     * @param {Function} fn a renaming function
     * @returns {Hopp} current object for chaining
     */

  }, {
    key: 'rename',
    value: function rename(fn) {
      if (typeof fn !== 'function' && (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) !== 'object') {
        throw new Error('Rename must be given a function or object.');
      }

      this.d.rename = fn;
      return this;
    }

    /**
     * Actually do the renaming.
     * @param {String} filename the original name
     * @returns {String} renamed filename
     */

  }, {
    key: 'doRename',
    value: function doRename(filename, dirname, source) {
      // if no rename is defined, just use current filename
      if (!this.d.rename) return dirname + '/' + filename;

      // functions are easy, but they break caching
      if (typeof this.d.rename === 'function') {
        return this.d.rename(filename, dirname, source);
      }

      // remove extension
      var ext = filename.substr(0, filename.lastIndexOf('.'));
      filename = filename.substr(1 + filename.lastIndexOf('.'));

      // add prefix
      if (this.d.rename.prefix) {
        filename = this.d.rename.prefix + filename;
      }

      // add suffix, before extension
      if (this.d.rename.suffix) {
        filename += this.d.rename.suffix;
      }

      // change extension
      if (this.d.rename.ext) {
        ext = this.d.rename.ext;
      }

      // output final filename into same dest directory
      return dirname + '/' + filename + ext;
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
        var newpath = _path2.default.resolve(directory, _glob2.default.nonMagic(src));

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

        var _createLogger2, log, debug, sourcemap, files, freshBuild, unmodified, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, originalFd, _ref2, _ref3, tmpBundle, tmpBundlePath, bundle, start, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _file, stream;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger2 = (0, _utils.createLogger)('hopp:' + name), log = _createLogger2.log, debug = _createLogger2.debug;

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
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 11;


                for (_iterator = files[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  file = _step.value;

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
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 19:
                _context.prev = 19;
                _context.prev = 20;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 22:
                _context.prev = 22;

                if (!_didIteratorError) {
                  _context.next = 25;
                  break;
                }

                throw _iteratorError;

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
                bundle = new _streams.Bundle(directory, tmpBundle);

                /**
                 * Since bundling starts streaming right away, we can count this
                 * as the start of the build.
                 */

                start = Date.now();

                log('Starting task');

                /**
                 * Add all files.
                 */
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 47;
                for (_iterator2 = files[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  _file = _step2.value;
                  stream = void 0;


                  if (unmodified[_file]) {
                    debug('forward: %s', _file);
                    stream = _fs2.default.createReadStream(null, {
                      fd: originalFd,
                      autoClose: false,
                      start: sourcemap[_file.replace(directory, '.')].start,
                      end: sourcemap[_file.replace(directory, '.')].end
                    });
                  } else {
                    debug('transform: %s', _file);
                    stream = (0, _pump2.default)([(0, _streams.createReadStream)(_file, dest + '/' + _path2.default.basename(_file))].concat(this.buildStack(name)));
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
                _didIteratorError2 = true;
                _iteratorError2 = _context.t2;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError2) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError2;

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
    value: function buildStack(name) {
      var _createLogger3 = (0, _utils.createLogger)('hopp:' + name),
          error = _createLogger3.error;

      var that = this;

      var mode = 'stream';

      return this.d.stack.map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 1),
            plugin = _ref5[0];

        var pluginStream = (0, _through2.default)(function () {
          var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(data) {
            var _this2 = this;

            var handler, retval;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;
                    handler = plugins[plugin](that.pluginCtx[plugin], data);

                    // for async functions/promises

                    if (!(handler instanceof Promise)) {
                      _context2.next = 6;
                      break;
                    }

                    handler.then(function (newData) {
                      return _this2.emit('data', newData);
                    }).catch(function (err) {
                      return _this2.emit('error', err);
                    });
                    _context2.next = 16;
                    break;

                  case 6:
                    if (!('next' in handler)) {
                      _context2.next = 15;
                      break;
                    }

                    retval = void 0;

                    // for async generators

                  case 8:
                    _context2.next = 10;
                    return handler.next();

                  case 10:
                    retval = _context2.sent;

                    this.emit('data', retval.value);

                  case 12:
                    if (!retval.done) {
                      _context2.next = 8;
                      break;
                    }

                  case 13:
                    _context2.next = 16;
                    break;

                  case 15:
                    // otherwise, fail
                    this.emit('error', new Error('Unknown return value received from ' + plugin));

                  case 16:
                    _context2.next = 21;
                    break;

                  case 18:
                    _context2.prev = 18;
                    _context2.t0 = _context2['catch'](0);

                    this.emit('error', _context2.t0);

                  case 21:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this, [[0, 18]]);
          }));

          return function (_x7) {
            return _ref6.apply(this, arguments);
          };
        }());

        /**
         * Enable buffer mode if required.
         */
        if (mode === 'stream' && pluginConfig[plugin].mode === 'buffer') {
          mode = 'buffer';
          return (0, _pump2.default)((0, _streams.buffer)(), pluginStream, function (err) {
            if (err) error(err && err.stack ? err.stack : err);
          });
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
    value: function loadPlugin(taskName, plugin, args, directory) {
      var mod = plugins[plugin];

      if (!mod) {
        // convert plugin path from relative back to absolute
        try {
          mod = require(_path2.default.join(directory, 'node_modules', plugin));
        } catch (err) {
          debug('failed to load plugin: %s', err && err.stack ? err.stack : err);
          throw new Error('Failed to load plugin: ' + plugin);
        }

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
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name, directory) {
        var _this3 = this;

        var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var _createLogger4, log, debug, files, dest, _start;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _createLogger4 = (0, _utils.createLogger)('hopp:' + name), log = _createLogger4.log, debug = _createLogger4.debug;

                /**
                 * Figure out if bundling is needed & load plugins.
                 */

                if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || isUndefined(this.readonly) || this.d.stack.length > 0 && !this.loadedPlugins) {
                  this.loadedPlugins = true;

                  this.d.stack.forEach(function (_ref8) {
                    var _ref9 = _slicedToArray(_ref8, 2),
                        plugin = _ref9[0],
                        args = _ref9[1];

                    if (!_this3.pluginCtx.hasOwnProperty(plugin)) {
                      _this3.loadPlugin(name, plugin, args, directory);
                    }

                    _this3.needsBundling = !!(_this3.needsBundling || pluginConfig[plugin].bundle);
                    _this3.needsRecaching = !!(_this3.needsRecaching || pluginConfig[plugin].recache);
                    _this3.readonly = !!(_this3.readonly || pluginConfig[plugin].readonly);

                    if (_this3.needsBundling && _this3.readonly) {
                      throw new Error('Task chain enabled bundling and readonly mode at the same time. Not sure what to do.');
                    }
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
                _context3.next = 6;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

              case 6:
                files = _context3.sent;

                if (!(files.length > 0)) {
                  _context3.next = 24;
                  break;
                }

                dest = this.d.dest ? _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest)) : '';

                /**
                 * Switch to bundling mode if need be.
                 */

                if (!this.needsBundling) {
                  _context3.next = 11;
                  break;
                }

                return _context3.abrupt('return', this.startBundling(name, directory, files, dest, useDoubleCache));

              case 11:
                if (!(!this.readonly || !this.d.dest)) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 14;
                return (0, _fs3.mkdirp)(dest.replace(directory, ''), directory);

              case 14:

                /**
                 * Create streams.
                 */
                files = (0, _utils._)(files).map(function (file) {
                  return {
                    file: file,
                    stream: [(0, _streams.createReadStream)(file, dest + '/' + _path2.default.basename(file))]
                  };
                });

                /**
                 * Connect plugin streams with pipelines.
                 */
                if (this.d.stack.length > 0) {
                  files.map(function (file) {
                    file.stream = file.stream.concat(_this3.buildStack(name));
                    return file;
                  });
                }

                /**
                 * Connect with destination.
                 */
                files.map(function (file) {
                  if (!_this3.readonly) {
                    // strip out the actual body and write it
                    file.stream.push((0, _mapStream2.default)(function (data, next) {
                      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || !data.hasOwnProperty('body')) {
                        return next(new Error('A plugin has destroyed the stream by returning a non-object.'));
                      }

                      next(null, data.body);
                    }));

                    // add the writestream at the end
                    var output = void 0;

                    if (!_this3.d.dest) {
                      var _tmpFileSync = (0, _fs3.tmpFileSync)(),
                          tmp = _tmpFileSync.fd,
                          tmppath = _tmpFileSync.name;

                      output = _fs2.default.createWriteStream(null, {
                        fd: tmp
                      });

                      file.promise = new Promise(function (resolve, reject) {
                        output.on('close', function () {
                          var newStream = _fs2.default.createReadStream(tmppath).pipe(_fs2.default.createWriteStream(file.file));

                          newStream.on('error', reject);
                          newStream.on('close', resolve);
                        });
                      });
                    } else {
                      var fname = _path2.default.basename(file.file);
                      output = _fs2.default.createWriteStream(_this3.doRename(fname, dest, file.file));
                    }

                    file.stream.push(output);
                  }

                  // promisify the current pipeline
                  return new Promise(function (resolve, reject) {
                    // connect all streams together to form pipeline
                    file.stream = (0, _pump2.default)(file.stream, function (err) {
                      if (err) reject(err);
                    });

                    if (file.promise) {
                      file.promise.then(resolve, reject);
                    } else {
                      file.stream.on('close', resolve);
                    }
                  });
                });

                // start & wait for all pipelines to end
                _start = Date.now();

                log('Starting task');
                _context3.next = 21;
                return Promise.all(files.val());

              case 21:
                log('Task ended (took %s ms)', Date.now() - _start);
                _context3.next = 25;
                break;

              case 24:
                log('Skipping task');

              case 25:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function start(_x10, _x11) {
        return _ref7.apply(this, arguments);
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
        d: this.d,
        needsBundling: this.needsBundling,
        needsRecaching: this.needsRecaching,
        readonly: this.readonly
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
      this.d = json.d;
      this.needsBundling = json.needsBundling;
      this.needsRecaching = json.needsRecaching;
      this.readonly = json.readonly;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=mgr.js.map