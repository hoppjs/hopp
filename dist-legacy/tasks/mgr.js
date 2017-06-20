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
          plugins[plugin](pluginCtx[plugin], data).then(function (newData) {
            return next(null, newData);
          }).catch(function (err) {
            return next(err);
          });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJwbHVnaW5Db25maWciLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJjb25maWciLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5IiwicmVjYWNoZSIsIndhdGNoZXJzIiwiZm9yRWFjaCIsInJlY3Vyc2l2ZSIsImluZGV4T2YiLCJuZXdwYXRoIiwic3BsaXQiLCJzdWIiLCJzZXAiLCJyZXNvbHZlIiwicHVzaCIsIndhdGNoIiwic3RhcnQiLCJQcm9taXNlIiwicHJvY2VzcyIsIm9uIiwid2F0Y2hlciIsImNsb3NlIiwibW9kaWZpZWQiLCJ1c2VEb3VibGVDYWNoZSIsInNvdXJjZW1hcCIsImZpbGVzIiwiZnJlc2hCdWlsZCIsInVubW9kaWZpZWQiLCJmaWxlIiwib3JpZ2luYWxGZCIsInRtcEJ1bmRsZSIsInRtcEJ1bmRsZVBhdGgiLCJidW5kbGUiLCJEYXRlIiwibm93Iiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImZkIiwiYXV0b0Nsb3NlIiwiZW5kIiwiY29uY2F0IiwiYnVpbGRTdGFjayIsImFkZCIsImRpcm5hbWUiLCJyZXBsYWNlIiwicmVqZWN0IiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwibWFwIiwibW9kZSIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsImxlbmd0aCIsIm5lZWRzQnVuZGxpbmciLCJsb2FkZWRQbHVnaW5zIiwiaGFzT3duUHJvcGVydHkiLCJzdGFydEJ1bmRsaW5nIiwiYm9keSIs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ZSxPQUFmLEVBQXdCMEIsTUFBeEI7QUFDQWpCLHlCQUFLTyxNQUFMLENBQVloQixFQUFaLENBQWUsT0FBZixFQUF3Qk4sT0FBeEI7QUFDRCxtQkFITSxDQUFQO0FBSUQsaUJBYkQ7O0FBZUE7QUFDTUcsc0IsR0FBUWlCLEtBQUtDLEdBQUwsRTs7QUFDZHhELG9CQUFJLGVBQUo7O3VCQUNNdUMsUUFBUThDLEdBQVIsQ0FBWXRDLE1BQU11QyxHQUFOLEVBQVosQzs7O0FBQ050RixvQkFBSSx5QkFBSixFQUErQnVELEtBQUtDLEdBQUwsS0FBYWxCLE1BQTVDOzs7OztBQUVBdEMsb0JBQUksZUFBSjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSjs7Ozs7Ozs2QkFJVTtBQUNSLGFBQU87QUFDTHVCLGNBQU0sS0FBS0gsQ0FBTCxDQUFPRyxJQURSO0FBRUxMLGFBQUssS0FBS0UsQ0FBTCxDQUFPRixHQUZQO0FBR0xHLGVBQU8sS0FBS0QsQ0FBTCxDQUFPQztBQUhULE9BQVA7QUFLRDs7QUFFRDs7Ozs7Ozs7NkJBS1VrRSxJLEVBQU07QUFDZCxXQUFLbkUsQ0FBTCxDQUFPRyxJQUFQLEdBQWNnRSxLQUFLaEUsSUFBbkI7QUFDQSxXQUFLSCxDQUFMLENBQU9GLEdBQVAsR0FBYXFFLEtBQUtyRSxHQUFsQjtBQUNBLFdBQUtFLENBQUwsQ0FBT0MsS0FBUCxHQUFla0UsS0FBS2xFLEtBQXBCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBblVrQkosSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9mcy9nbG9iJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9mcy9nZXQtcGF0aCdcbmltcG9ydCB7IF8sIGNyZWF0ZUxvZ2dlciB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUsIG1rZGlycCwgb3BlbkZpbGUsIHRtcEZpbGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCB7IGJ1ZmZlciwgY3JlYXRlQnVuZGxlLCBjcmVhdGVSZWFkU3RyZWFtIH0gZnJvbSAnLi4vc3RyZWFtcydcblxuY29uc3Qgd2F0Y2hsb2cgPSBjcmVhdGVMb2dnZXIoJ2hvcHA6d2F0Y2gnKS5sb2dcblxuLyoqXG4gKiBQbHVnaW5zIHN0b3JhZ2UuXG4gKi9cbmNvbnN0IHBsdWdpbnMgPSB7fVxuY29uc3QgcGx1Z2luQ3R4ID0ge31cbmNvbnN0IHBsdWdpbkNvbmZpZyA9IHt9XG5cbi8qKlxuICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAqL1xuY29uc3QgbG9hZFBsdWdpbiA9IChwbHVnaW4sIGFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuICBcbiAgLy8gZXhwb3NlIG1vZHVsZSBjb25maWdcbiAgcGx1Z2luQ29uZmlnW3BsdWdpbl0gPSBtb2QuY29uZmlnIHx8IHt9XG5cbiAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgLy8gZXhwb3J0IGlzIGF0ICdkZWZhdWx0J1xuICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICB9XG5cbiAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICBwbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICBhcmdzLFxuICAgIGxvZzogbG9nZ2VyLmxvZyxcbiAgICBkZWJ1ZzogbG9nZ2VyLmRlYnVnLFxuICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgfVxuXG4gIC8vIHJldHVybiBsb2FkZWQgcGx1Z2luXG4gIHJldHVybiBtb2Rcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlKSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGJ1bmRsaW5nLlxuICAgKi9cbiAgYXN5bmMgc3RhcnRCdW5kbGluZyhuYW1lLCBkaXJlY3RvcnksIG1vZGlmaWVkLCBkZXN0LCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcbiAgICBkZWJ1ZygnU3dpdGNoZWQgdG8gYnVuZGxpbmcgbW9kZScpXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaCBzb3VyY2VtYXAgZnJvbSBjYWNoZS5cbiAgICAgKi9cbiAgICBjb25zdCBzb3VyY2VtYXAgPSBjYWNoZS5zb3VyY2VtYXAobmFtZSlcblxuICAgIC8qKlxuICAgICAqIEdldCBmdWxsIGxpc3Qgb2YgY3VycmVudCBmaWxlcy5cbiAgICAgKi9cbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSwgdHJ1ZSlcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBsaXN0IG9mIHVubW9kaWZpZWQuXG4gICAgICovXG4gICAgbGV0IGZyZXNoQnVpbGQgPSB0cnVlXG4gICAgY29uc3QgdW5tb2RpZmllZCA9IHt9XG5cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBpZiAobW9kaWZpZWQuaW5kZXhPZihmaWxlKSA9PT0gLTEpIHtcbiAgICAgICAgdW5tb2RpZmllZFtmaWxlXSA9IHRydWVcbiAgICAgICAgZnJlc2hCdWlsZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9sZCBidW5kbGUgJiBjcmVhdGUgbmV3IG9uZS5cbiAgICAgKi9cbiAgICBjb25zdCBvcmlnaW5hbEZkID0gZnJlc2hCdWlsZCA/IG51bGwgOiBhd2FpdCBvcGVuRmlsZShkZXN0LCAncicpXG4gICAgICAgICwgW3RtcEJ1bmRsZSwgdG1wQnVuZGxlUGF0aF0gPSBhd2FpdCB0bXBGaWxlKClcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgbmV3IGJ1bmRsZSB0byBmb3J3YXJkIHRvLlxuICAgICAqL1xuICAgIGNvbnN0IGJ1bmRsZSA9IGNyZWF0ZUJ1bmRsZSh0bXBCdW5kbGUpXG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBidW5kbGluZyBzdGFydHMgc3RyZWFtaW5nIHJpZ2h0IGF3YXksIHdlIGNhbiBjb3VudCB0aGlzXG4gICAgICogYXMgdGhlIHN0YXJ0IG9mIHRoZSBidWlsZC5cbiAgICAgKi9cbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuXG4gICAgLyoqXG4gICAgICogQWRkIGFsbCBmaWxlcy5cbiAgICAgKi9cbiAgICBmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBsZXQgc3RyZWFtXG5cbiAgICAgIGlmICh1bm1vZGlmaWVkW2ZpbGVdKSB7XG4gICAgICAgIGRlYnVnKCdmb3J3YXJkOiAlcycsIGZpbGUpXG4gICAgICAgIHN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0obnVsbCwge1xuICAgICAgICAgIGZkOiBvcmlnaW5hbEZkLFxuICAgICAgICAgIGF1dG9DbG9zZTogZmFsc2UsXG4gICAgICAgICAgc3RhcnQ6IHNvdXJjZW1hcFtmaWxlXS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHNvdXJjZW1hcFtmaWxlXS5lbmRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0cmFuc2Zvcm06ICVzJywgZmlsZSlcbiAgICAgICAgc3RyZWFtID0gcHVtcChbY3JlYXRlUmVhZFN0cmVhbShmaWxlKV0uY29uY2F0KHRoaXMuYnVpbGRTdGFjaygpKSlcbiAgICAgIH1cblxuICAgICAgYnVuZGxlLmFkZChmaWxlLCBzdHJlYW0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2FpdCBmb3IgYnVuZGxpbmcgdG8gZW5kLlxuICAgICAqL1xuICAgIGF3YWl0IGJ1bmRsZS5lbmQodG1wQnVuZGxlUGF0aClcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGJ1bmRsZSB0byB0aGUgbmV3IGxvY2F0aW9uLlxuICAgICAqL1xuICAgIGlmIChvcmlnaW5hbEZkKSBvcmlnaW5hbEZkLmNsb3NlKClcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGRlc3QpLnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHRtcEJ1bmRsZVBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpXG5cbiAgICAgIHN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICB9KVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNvdXJjZW1hcC5cbiAgICAgKi9cbiAgICBjYWNoZS5zb3VyY2VtYXAobmFtZSwgYnVuZGxlLm1hcClcblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYWxsIHBsdWdpbnMgaW4gdGhlIHN0YWNrIGludG8gc3RyZWFtcy5cbiAgICovXG4gIGJ1aWxkU3RhY2sgKCkge1xuICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcblxuICAgIHJldHVybiB0aGlzLmQuc3RhY2subWFwKChbcGx1Z2luXSkgPT4ge1xuICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgIHBsdWdpbnNbcGx1Z2luXShcbiAgICAgICAgICBwbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICBkYXRhXG4gICAgICAgIClcbiAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiBuZXh0KGVycikpXG4gICAgICB9KVxuXG4gICAgICAvKipcbiAgICAgICAqIEVuYWJsZSBidWZmZXIgbW9kZSBpZiByZXF1aXJlZC5cbiAgICAgICAqL1xuICAgICAgaWYgKG1vZGUgPT09ICdzdHJlYW0nICYmIHBsdWdpbkNvbmZpZ1twbHVnaW5dLm1vZGUgPT09ICdidWZmZXInKSB7XG4gICAgICAgIG1vZGUgPSAnYnVmZmVyJ1xuICAgICAgICByZXR1cm4gcHVtcChidWZmZXIoKSwgcGx1Z2luU3RyZWFtKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIE90aGVyd2lzZSBrZWVwIHB1bXBpbmcuXG4gICAgICAgKi9cbiAgICAgIHJldHVybiBwbHVnaW5TdHJlYW1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlLCB1c2VEb3VibGVDYWNoZSA9IHRydWUpIHtcbiAgICBjb25zdCB7IGxvZywgZGVidWcgfSA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke25hbWV9YClcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgZGVidWcoJ3Rhc2sgcmVjYWNoZSA9ICVzJywgcmVjYWNoZSlcbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUsIHJlY2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuXG4gICAgICAvKipcbiAgICAgICAqIEJ1bmRsaW5nIHRhbmdlYW50LlxuICAgICAgICovXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IG5lZWRzQnVuZGxpbmcgPSBmYWxzZVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcnkgdG8gbG9hZCBwbHVnaW5zLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKCF0aGlzLmxvYWRlZFBsdWdpbnMpIHtcbiAgICAgICAgICB0aGlzLmxvYWRlZFBsdWdpbnMgPSB0cnVlXG5cbiAgICAgICAgICB0aGlzLmQuc3RhY2suZm9yRWFjaCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgICBuZWVkc0J1bmRsaW5nID0gbmVlZHNCdW5kbGluZyB8fCBwbHVnaW5Db25maWdbcGx1Z2luXS5idW5kbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN3aXRjaCB0byBidW5kbGluZyBtb2RlIGlmIG5lZWQgYmUuXG4gICAgICAgICAqL1xuICAgICAgICBpZiAobmVlZHNCdW5kbGluZykge1xuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YXJ0QnVuZGxpbmcobmFtZSwgZGlyZWN0b3J5LCBmaWxlcywgZGVzdCwgdXNlRG91YmxlQ2FjaGUpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBFbnN1cmUgZGlzdCBkaXJlY3RvcnkgZXhpc3RzLlxuICAgICAgICovXG4gICAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBbXG4gICAgICAgICAgY3JlYXRlUmVhZFN0cmVhbShmaWxlLCBkZXN0KVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5idWlsZFN0YWNrKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4gbmV4dChudWxsLCBkYXRhLmJvZHkpKSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==