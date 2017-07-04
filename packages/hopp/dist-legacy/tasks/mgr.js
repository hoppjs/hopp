'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

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

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _getPath = require('../fs/get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _utils = require('../utils');

var _streams = require('../streams');

var _fs3 = require('../fs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _createLogger = (0, _utils.createLogger)('hopp'),
    debug = _createLogger.debug;

var watchlog = (0, _utils.createLogger)('hopp:watch').log;

/**
 * Plugins storage.
 */
var plugins = Object.create(null);
var pluginConfig = Object.create(null);

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
    this.pluginCtx = Object.create(null);

    // persistent info
    this.d = {
      src,
      stack: [],
      rename: []

      // bind all plugin extras
    };for (var plugin in this) {
      if (typeof this[plugin] === 'function') {
        for (var method in this[plugin]) {
          if (this[plugin].hasOwnProperty(method)) {
            this[plugin][method] = this[plugin][method].bind(this);
          }
        }
      }
    }
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
     * @param {Object|Function} mapper renaming options or renaming function
     * @returns {Hopp} current object for chaining
     */

  }, {
    key: 'rename',
    value: function rename(mapper) {
      if (typeof mapper !== 'function' && typeof mapper !== 'object') {
        throw new Error('Rename must be given a function or object.');
      }

      this.d.rename.push(mapper);
      return this;
    }

    /**
     * Actually do the renaming.
     * @param {String} filename the original name
     * @param {String} dirname the destination directory
     * @param {String} source the absolute source filename
     * @returns {String} renamed filename
     */

  }, {
    key: 'doRename',
    value: function doRename(filename, dirname, source) {
      var dest = dirname + '/' + filename;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.d.rename[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var mapper = _step.value;

          dest = this.applyRename(mapper, _path2.default.basename(dest), _path2.default.dirname(dest), source);
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

      return dest;
    }

    /**
     * Apply a single rename.
     * @param {Object|Function} mapper renaming object or function
     * @param {String} filename the original name
     * @param {String} dirname the destination directory
     * @param {String} source the absolute source filename
     * @returns {String} renamed filename
     */

  }, {
    key: 'applyRename',
    value: function applyRename(mapper, filename, dirname, source) {
      // if no rename is defined, just use current filename
      if (!mapper) return dirname + '/' + filename;

      // functions are easy, but they break caching
      if (typeof mapper === 'function') {
        return mapper(filename, dirname, source);
      }

      // remove extension
      var ext = filename.substr(1 + filename.lastIndexOf('.'));
      filename = filename.substr(0, filename.lastIndexOf('.'));

      // add prefix
      if (mapper.prefix) {
        filename = mapper.prefix + filename;
      }

      // add suffix, before extension
      if (mapper.suffix) {
        filename += mapper.suffix;
      }

      // change extension
      if (mapper.ext) {
        ext = mapper.ext;
      }

      // output final filename into same dest directory
      return dirname + '/' + filename + '.' + ext;
    }

    /**
     * Run task in continuous mode.
     */

  }, {
    key: 'watch',
    value: function watch(name, directory) {
      var _this = this;

      var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      name = `watch:${name}`;

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

      return new _bluebird2.default(function (resolve) {
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
      var _ref = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee(name, directory, modified, dest) {
        var useDoubleCache = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

        var _createLogger2, log, debug, sourcemap, files, freshBuild, unmodified, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, originalFd, _ref2, _ref3, tmpBundle, tmpBundlePath, bundle, start, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _file, stream;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger2 = (0, _utils.createLogger)(`hopp:${name}`), log = _createLogger2.log, debug = _createLogger2.debug;

                debug('Switched to bundling mode');

                /**
                 * Fetch sourcemap from cache.
                 */
                sourcemap = cache.sourcemap(name);

                /**
                 * Get full list of current files.
                 */

                _context.next = 5;
                return (0, _bluebird.resolve)((0, _glob2.default)(name, this.d.src, directory, useDoubleCache, true));

              case 5:
                files = _context.sent;


                /**
                 * Create list of unmodified.
                 */
                freshBuild = true;
                unmodified = Object.create(null);
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
                return (0, _bluebird.resolve)((0, _fs3.openFile)(dest, 'r'));

              case 33:
                _context.t1 = _context.sent;

              case 34:
                originalFd = _context.t1;
                _context.next = 37;
                return (0, _bluebird.resolve)((0, _fs3.tmpFile)());

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
                return (0, _bluebird.resolve)(bundle.end(tmpBundlePath));

              case 65:

                /**
                 * Move the bundle to the new location.
                 */
                if (originalFd) originalFd.close();
                _context.next = 68;
                return (0, _bluebird.resolve)((0, _fs3.mkdirp)(_path2.default.dirname(dest).replace(directory, ''), directory));

              case 68:
                _context.next = 70;
                return (0, _bluebird.resolve)(new _bluebird2.default(function (resolve, reject) {
                  var stream = _fs2.default.createReadStream(tmpBundlePath).pipe(_fs2.default.createWriteStream(dest));

                  stream.on('close', resolve);
                  stream.on('error', reject);
                }));

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

      function startBundling(_x2, _x3, _x4, _x5, _x6) {
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
      var that = this;

      var mode = 'stream';

      return this.d.stack.map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 3),
            plugin = _ref5[0],
            _ = _ref5[1],
            method = _ref5[2];

        var pluginStream = _through2.default.obj(function () {
          var _ref6 = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee2(data, _, done) {
            var handler, retval;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.prev = 0;

                    /**
                     * Try and get proper method - assume
                     * default by default.
                     */
                    handler = plugins[plugin][method || 'default'](that.pluginCtx[plugin], data);

                    // for async functions/promises

                    if (!('then' in handler)) {
                      _context2.next = 17;
                      break;
                    }

                    _context2.prev = 3;
                    _context2.t0 = this;
                    _context2.next = 7;
                    return (0, _bluebird.resolve)(handler);

                  case 7:
                    _context2.t1 = _context2.sent;

                    _context2.t0.push.call(_context2.t0, _context2.t1);

                    done();
                    _context2.next = 15;
                    break;

                  case 12:
                    _context2.prev = 12;
                    _context2.t2 = _context2['catch'](3);

                    done(_context2.t2);

                  case 15:
                    _context2.next = 28;
                    break;

                  case 17:
                    if (!('next' in handler)) {
                      _context2.next = 27;
                      break;
                    }

                    retval = void 0;

                    // for async generators

                  case 19:
                    _context2.next = 21;
                    return (0, _bluebird.resolve)(handler.next());

                  case 21:
                    retval = _context2.sent;

                    this.push(retval.value);

                  case 23:
                    if (!retval.done) {
                      _context2.next = 19;
                      break;
                    }

                  case 24:

                    done();
                    _context2.next = 28;
                    break;

                  case 27:
                    // otherwise, fail
                    done(new Error('Unknown return value received from ' + plugin));

                  case 28:
                    _context2.next = 33;
                    break;

                  case 30:
                    _context2.prev = 30;
                    _context2.t3 = _context2['catch'](0);

                    done(_context2.t3);

                  case 33:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this, [[0, 30], [3, 12]]);
          }));

          return function (_x8, _x9, _x10) {
            return _ref6.apply(this, arguments);
          };
        }());

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
    value: function loadPlugin(taskName, plugin, args, directory) {
      var mod = plugins[plugin];

      if (!mod) {
        // convert plugin path from relative back to absolute
        try {
          var pathToPlugin = plugin;

          if (plugin[0] !== '/') {
            pathToPlugin = _path2.default.join(directory, 'node_modules', plugin);
          }

          mod = require(pathToPlugin);
        } catch (err) {
          debug('failed to load plugin: %s', err && err.stack ? err.stack : err);
          throw new Error('Failed to load plugin: ' + plugin);
        }

        // expose module config
        pluginConfig[plugin] = mod.config || Object.create(null);

        // add plugins to loaded plugins
        plugins[plugin] = mod;
      }

      // create plugin logger
      var logger = (0, _utils.createLogger)(`hopp:${taskName}:${_path2.default.basename(plugin).substr(5)}`);

      // load/create cache for plugin
      var pluginCache = cache.plugin(plugin);

      // create a new context for this plugin
      this.pluginCtx[plugin] = {
        args,
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
      var _ref7 = (0, _bluebird.coroutine)(regeneratorRuntime.mark(function _callee3(name, directory) {
        var _this2 = this;

        var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var _createLogger3, log, debug, error, safeTimeout, files, dest, _start;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _createLogger3 = (0, _utils.createLogger)(`hopp:${name}`), log = _createLogger3.log, debug = _createLogger3.debug, error = _createLogger3.error;

                /**
                 * Add timeout for safety.
                 */

                safeTimeout = setTimeout(function () {
                  error('Timeout exceeded! Task was hung.');
                  process.exit(-1);
                }, 6e4);

                /**
                 * Figure out if bundling is needed & load plugins.
                 */

                if (isUndefined(this.needsBundling) || isUndefined(this.needsRecaching) || isUndefined(this.readonly) || this.d.stack.length > 0 && !this.loadedPlugins) {
                  this.loadedPlugins = true;

                  this.d.stack.forEach(function (_ref8) {
                    var _ref9 = _slicedToArray(_ref8, 2),
                        plugin = _ref9[0],
                        args = _ref9[1];

                    if (!_this2.pluginCtx[plugin]) {
                      _this2.loadPlugin(name, plugin, args, directory);
                    }

                    _this2.needsBundling = !!(_this2.needsBundling || pluginConfig[plugin].bundle);
                    _this2.needsRecaching = !!(_this2.needsRecaching || pluginConfig[plugin].recache);
                    _this2.readonly = !!(_this2.readonly || pluginConfig[plugin].readonly);

                    if (_this2.needsBundling && _this2.readonly) {
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
                _context3.next = 7;
                return (0, _bluebird.resolve)((0, _glob2.default)(name, this.d.src, directory, useDoubleCache, recache));

              case 7:
                files = _context3.sent;

                if (!(process.env.SKIP_BUILD === 'true')) {
                  _context3.next = 11;
                  break;
                }

                log('Updated cache');
                return _context3.abrupt('return');

              case 11:
                if (!(files.length > 0)) {
                  _context3.next = 32;
                  break;
                }

                dest = this.d.dest ? _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest)) : '';

                /**
                 * Switch to bundling mode if need be.
                 */

                if (!this.needsBundling) {
                  _context3.next = 18;
                  break;
                }

                _context3.next = 16;
                return (0, _bluebird.resolve)(this.startBundling(name, directory, files, dest, useDoubleCache));

              case 16:
                clearTimeout(safeTimeout);
                return _context3.abrupt('return');

              case 18:
                if (!(!this.readonly || !this.d.dest)) {
                  _context3.next = 21;
                  break;
                }

                _context3.next = 21;
                return (0, _bluebird.resolve)((0, _fs3.mkdirp)(dest.replace(directory, ''), directory));

              case 21:

                /**
                 * Create streams.
                 */
                files = (0, _utils._)(files).map(function (file) {
                  var outfile = _this2.doRename(_path2.default.basename(file), dest, file);

                  return {
                    file,
                    outfile,
                    stream: [(0, _streams.createReadStream)(file, outfile)]
                  };
                });

                /**
                 * Connect plugin streams with pipelines.
                 */
                if (this.d.stack.length > 0) {
                  files.map(function (file) {
                    file.stream = file.stream.concat(_this2.buildStack(name));
                    return file;
                  });
                }

                /**
                 * Connect with destination.
                 */
                files.map(function (file) {
                  if (!_this2.readonly) {
                    // strip out the actual body and write it
                    file.stream.push((0, _streams.map)(function (data, next) {
                      if (typeof data !== 'object' || !data.hasOwnProperty('body')) {
                        return next(new Error('A plugin has destroyed the stream by returning a non-object.'));
                      }

                      next(null, data.body);
                    }));

                    // add the writestream at the end
                    var output = void 0;

                    if (!_this2.d.dest) {
                      var _tmpFileSync = (0, _fs3.tmpFileSync)(),
                          tmp = _tmpFileSync.fd,
                          tmppath = _tmpFileSync.name;

                      output = _fs2.default.createWriteStream(null, {
                        fd: tmp
                      });

                      file.promise = new _bluebird2.default(function (resolve, reject) {
                        output.on('close', function () {
                          var newStream = _fs2.default.createReadStream(tmppath).pipe(_fs2.default.createWriteStream(file.file));

                          newStream.on('error', reject);
                          newStream.on('close', resolve);
                        });
                      });
                    } else {
                      debug('Set output: %s', file.outfile);
                      (0, _fs3.mkdirpSync)(_path2.default.dirname(file.outfile).replace(directory, ''), directory);
                      output = _fs2.default.createWriteStream(file.outfile);
                    }

                    file.stream.push(output);
                  }

                  // promisify the current pipeline
                  return new _bluebird2.default(function (resolve, reject) {
                    var resolved = false;

                    // connect all streams together to form pipeline
                    file.stream = (0, _pump2.default)(file.stream, function (err) {
                      if (err) reject(err);else if (!resolved && !file.promise) resolve();
                    });

                    if (file.promise) {
                      file.promise.then(function () {
                        resolved = true;
                        resolve();
                      }, reject);
                    }
                  });
                });

                // start & wait for all pipelines to end
                _start = Date.now();

                log('Starting task for %s files', files.length);
                _context3.next = 28;
                return (0, _bluebird.resolve)((0, _bluebird.all)(files.val()));

              case 28:
                log('Task ended (took %s ms)', Date.now() - _start);

                // clear the timeout
                clearTimeout(safeTimeout);
                _context3.next = 33;
                break;

              case 32:
                log('Skipping task');

              case 33:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function start(_x11, _x12, _x13, _x14) {
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