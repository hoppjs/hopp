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

var _2 = require('../_');

var _3 = _interopRequireDefault(_2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

var _buffer = require('./buffer');

var _buffer2 = _interopRequireDefault(_buffer);

var _mkdirp = require('../mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _getPath = require('../get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _mapStream = require('map-stream');

var _mapStream2 = _interopRequireDefault(_mapStream);

var _fs3 = require('../fs');

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

var _readStream = require('./read-stream');

var _readStream2 = _interopRequireDefault(_readStream);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var watchlog = (0, _log2.default)('hopp:watch').log;

/**
 * Plugins storage.
 */
var plugins = {};
var pluginCtx = {};
var bufferPlugins = {};

/**
 * Loads a plugin, manages its env.
 */
var loadPlugin = function loadPlugin(plugin, args) {
  var mod = require(plugin

  // check for if plugin requires before
  );if (mod.FORCE_BUFFER === true) {
    bufferPlugins[plugin] = true;
  }

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  if (mod.__esModule === true) {
    mod = mod.default;
  }

  // create plugin logger
  var logger = (0, _log2.default)('hopp:' + _path2.default.basename(plugin).substr(5)

  // create a new context for this plugin
  );pluginCtx[plugin] = {
    args: args,
    log: logger.debug,
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

        newpath = _path2.default.resolve(directory, newpath.substr(1)

        // disable fs caching for watch
        );(0, _fs3.disableFSCache

        // start watch
        )();watchlog('Watching for %s ...', name);
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
     * Starts the pipeline.
     * @return {Promise} resolves when task is complete
     */

  }, {
    key: 'start',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, directory) {
        var recache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var useDoubleCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var _createLogger, log, debug, files, dest, stack, mode, _start;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger = (0, _log2.default)('hopp:' + name

                /**
                 * Get the modified files.
                 */
                ), log = _createLogger.log, debug = _createLogger.debug;
                debug('task recache = %s', recache);
                _context.next = 4;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache, recache);

              case 4:
                files = _context.sent;

                if (!(files.length > 0)) {
                  _context.next = 19;
                  break;
                }

                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
                _context.next = 9;
                return (0, _mkdirp2.default)(dest.replace(directory, ''), directory

                /**
                 * Create streams.
                 */
                );

              case 9:
                files = (0, _3.default)(files).map(function (file) {
                  return {
                    file: file,
                    stream: [(0, _readStream2.default)(file, dest)]
                  };
                });

                if (this.d.stack.length > 0) {
                  /**
                   * Try to load plugins.
                   */
                  stack = (0, _3.default)(this.d.stack);


                  if (!this.plugins) {
                    this.plugins = {};

                    stack.map(function (_ref2) {
                      var _ref3 = _slicedToArray(_ref2, 2),
                          plugin = _ref3[0],
                          args = _ref3[1];

                      if (!plugins.hasOwnProperty(plugin)) {
                        plugins[plugin] = loadPlugin(plugin, args);
                      }

                      return [plugin, args];
                    });
                  }

                  /**
                   * Create streams.
                   */
                  mode = 'stream';

                  stack = stack.map(function (_ref4) {
                    var _ref5 = _slicedToArray(_ref4, 1),
                        plugin = _ref5[0];

                    var pluginStream = (0, _mapStream2.default)(function (data, next) {
                      plugins[plugin](pluginCtx[plugin], data).then(function (newData) {
                        return next(null, newData);
                      }).catch(function (err) {
                        return next(err);
                      });
                    }

                    /**
                     * Enable buffer mode if required.
                     */
                    );if (mode === 'stream' && bufferPlugins[plugin]) {
                      mode = 'buffer';
                      return (0, _pump2.default)((0, _buffer2.default)(), pluginStream);
                    }

                    /**
                     * Otherwise keep pumping.
                     */
                    return pluginStream;
                  }).val

                  /**
                   * Connect plugin streams with pipelines.
                   */
                  ();files.map(function (file) {
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
                  file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file))

                  // connect all streams together to form pipeline
                  );file.stream = (0, _pump2.default)(file.stream

                  // promisify the current pipeline
                  );return new Promise(function (resolve, reject) {
                    file.stream.on('error', reject);
                    file.stream.on('close', resolve);
                  });
                }

                // start & wait for all pipelines to end
                );_start = Date.now();

                log('Starting task');
                _context.next = 16;
                return Promise.all(files.val());

              case 16:
                log('Task ended (took %s ms)', Date.now() - _start);
                _context.next = 20;
                break;

              case 19:
                log('Skipping task');

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start(_x4, _x5) {
        return _ref.apply(this, arguments);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJidWZmZXJQbHVnaW5zIiwibG9hZFBsdWdpbiIsInBsdWdpbiIsImFyZ3MiLCJtb2QiLCJyZXF1aXJlIiwiRk9SQ0VfQlVGRkVSIiwiX19lc01vZHVsZSIsImRlZmF1bHQiLCJsb2dnZXIiLCJiYXNlbmFtZSIsInN1YnN0ciIsImRlYnVnIiwiZXJyb3IiLCJIb3BwIiwic3JjIiwiQXJyYXkiLCJkIiwic3RhY2siLCJvdXQiLCJkZXN0IiwibmFtZSIsImRpcmVjdG9yeSIsInJlY2FjaGUiLCJ3YXRjaGVycyIsImZvckVhY2giLCJyZWN1cnNpdmUiLCJpbmRleE9mIiwibmV3cGF0aCIsInNwbGl0Iiwic3ViIiwic2VwIiwicmVzb2x2ZSIsInB1c2giLCJ3YXRjaCIsInN0YXJ0IiwiUHJvbWlzZSIsInByb2Nlc3MiLCJvbiIsIndhdGNoZXIiLCJjbG9zZSIsInVzZURvdWJsZUNhY2hlIiwiZmlsZXMiLCJsZW5ndGgiLCJyZXBsYWNlIiwibWFwIiwiZmlsZSIsInN0cmVhbSIsImhhc093blByb3BlcnR5IiwibW9kZSIsInBsdWdpblN0cmVhbSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInZhbCIsImNvbmNhdCIsImJvZHkiLCJjcmVhdGVXcml0ZVN0cmVhbSIsInJlamVjdCIsIkRhdGUiLCJub3ciLCJhbGwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU1DLFdBQVcsbUJBQWEsWUFBYixFQUEyQkMsR0FBNUM7O0FBRUE7OztB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LEdBQWM2QyxLQUFLN0MsSUFBbkI7QUFDQSxXQUFLSCxDQUFMLENBQU9GLEdBQVAsR0FBYWtELEtBQUtsRCxHQUFsQjtBQUNBLFdBQUtFLENBQUwsQ0FBT0MsS0FBUCxHQUFlK0MsS0FBSy9DLEtBQXBCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBN01rQkosSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAnLi4vXydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHVtcCBmcm9tICdwdW1wJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZ2xvYidcbmltcG9ydCBidWZmZXIgZnJvbSAnLi9idWZmZXInXG5pbXBvcnQgbWtkaXJwIGZyb20gJy4uL21rZGlycCdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2dldC1wYXRoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUmVhZFN0cmVhbSBmcm9tICcuL3JlYWQtc3RyZWFtJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5DdHggPSB7fVxuY29uc3QgYnVmZmVyUGx1Z2lucyA9IHt9XG5cbi8qKlxuICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAqL1xuY29uc3QgbG9hZFBsdWdpbiA9IChwbHVnaW4sIGFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuXG4gIC8vIGNoZWNrIGZvciBpZiBwbHVnaW4gcmVxdWlyZXMgYmVmb3JlXG4gIGlmIChtb2QuRk9SQ0VfQlVGRkVSID09PSB0cnVlKSB7XG4gICAgYnVmZmVyUGx1Z2luc1twbHVnaW5dID0gdHJ1ZVxuICB9XG5cbiAgLy8gaWYgZGVmaW5lZCBhcyBhbiBFUzIwMTUgbW9kdWxlLCBhc3N1bWUgdGhhdCB0aGVcbiAgLy8gZXhwb3J0IGlzIGF0ICdkZWZhdWx0J1xuICBpZiAobW9kLl9fZXNNb2R1bGUgPT09IHRydWUpIHtcbiAgICBtb2QgPSBtb2QuZGVmYXVsdFxuICB9XG5cbiAgLy8gY3JlYXRlIHBsdWdpbiBsb2dnZXJcbiAgY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7cGF0aC5iYXNlbmFtZShwbHVnaW4pLnN1YnN0cig1KX1gKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciB0aGlzIHBsdWdpblxuICBwbHVnaW5DdHhbcGx1Z2luXSA9IHtcbiAgICBhcmdzLFxuICAgIGxvZzogbG9nZ2VyLmRlYnVnLFxuICAgIGVycm9yOiBsb2dnZXIuZXJyb3JcbiAgfVxuXG4gIC8vIHJldHVybiBsb2FkZWQgcGx1Z2luXG4gIHJldHVybiBtb2Rcbn1cblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICBpZiAoIShzcmMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHNyYyA9IFtzcmNdXG4gICAgfVxuXG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUnVuIHRhc2sgaW4gY29udGludW91cyBtb2RlLlxuICAgKi9cbiAgd2F0Y2ggKG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSA9IGZhbHNlKSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgcmVjYWNoZSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHJlY2FjaGUgPSBmYWxzZSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGRlYnVnKCd0YXNrIHJlY2FjaGUgPSAlcycsIHJlY2FjaGUpXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlLCByZWNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAqL1xuICAgICAgZmlsZXMgPSBfKGZpbGVzKS5tYXAoZmlsZSA9PiAoe1xuICAgICAgICBmaWxlLFxuICAgICAgICBzdHJlYW06IFtcbiAgICAgICAgICBjcmVhdGVSZWFkU3RyZWFtKGZpbGUsIGRlc3QpXG4gICAgICAgIF1cbiAgICAgIH0pKVxuXG4gICAgICBpZiAodGhpcy5kLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyeSB0byBsb2FkIHBsdWdpbnMuXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgc3RhY2sgPSBfKHRoaXMuZC5zdGFjaylcblxuICAgICAgICBpZiAoIXRoaXMucGx1Z2lucykge1xuICAgICAgICAgIHRoaXMucGx1Z2lucyA9IHt9XG5cbiAgICAgICAgICBzdGFjay5tYXAoKFtwbHVnaW4sIGFyZ3NdKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBsdWdpbnMuaGFzT3duUHJvcGVydHkocGx1Z2luKSkge1xuICAgICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0gPSBsb2FkUGx1Z2luKHBsdWdpbiwgYXJncylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFtwbHVnaW4sIGFyZ3NdXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgc3RyZWFtcy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBtb2RlID0gJ3N0cmVhbSdcbiAgICAgICAgc3RhY2sgPSBzdGFjay5tYXAoKFtwbHVnaW5dKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGx1Z2luU3RyZWFtID0gbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICAgIHBsdWdpbkN0eFtwbHVnaW5dLFxuICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gbmV4dChudWxsLCBuZXdEYXRhKSlcbiAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBuZXh0KGVycikpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEVuYWJsZSBidWZmZXIgbW9kZSBpZiByZXF1aXJlZC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBpZiAobW9kZSA9PT0gJ3N0cmVhbScgJiYgYnVmZmVyUGx1Z2luc1twbHVnaW5dKSB7XG4gICAgICAgICAgICBtb2RlID0gJ2J1ZmZlcidcbiAgICAgICAgICAgIHJldHVybiBwdW1wKGJ1ZmZlcigpLCBwbHVnaW5TdHJlYW0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogT3RoZXJ3aXNlIGtlZXAgcHVtcGluZy5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICByZXR1cm4gcGx1Z2luU3RyZWFtXG4gICAgICAgIH0pLnZhbCgpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbm5lY3QgcGx1Z2luIHN0cmVhbXMgd2l0aCBwaXBlbGluZXMuXG4gICAgICAgICAqL1xuICAgICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgICAgZmlsZS5zdHJlYW0gPSBmaWxlLnN0cmVhbS5jb25jYXQoc3RhY2spXG4gICAgICAgICAgcmV0dXJuIGZpbGVcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSBhY3R1YWwgYm9keSBhbmQgd3JpdGUgaXRcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChtYXBTdHJlYW0oKGRhdGEsIG5leHQpID0+IG5leHQobnVsbCwgZGF0YS5ib2R5KSkpXG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG5cbiAgICAgICAgLy8gY29ubmVjdCBhbGwgc3RyZWFtcyB0b2dldGhlciB0byBmb3JtIHBpcGVsaW5lXG4gICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSlcblxuICAgICAgICAvLyBwcm9taXNpZnkgdGhlIGN1cnJlbnQgcGlwZWxpbmVcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgICAgZmlsZS5zdHJlYW0ub24oJ2Nsb3NlJywgcmVzb2x2ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIHN0YXJ0ICYgd2FpdCBmb3IgYWxsIHBpcGVsaW5lcyB0byBlbmRcbiAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgbG9nKCdTdGFydGluZyB0YXNrJylcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGVzLnZhbCgpKVxuICAgICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdTa2lwcGluZyB0YXNrJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=