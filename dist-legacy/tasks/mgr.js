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

/**
 * Loads a plugin, manages its env.
 */
var loadPlugin = function loadPlugin(plugin, args) {
  var mod = require(plugin

  // if defined as an ES2015 module, assume that the
  // export is at 'default'
  );if (mod.__esModule === true) {
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
          return _this.start(name, directory, false);
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
        var useDoubleCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        var _createLogger, log, debug, start, files, stack, dest;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger = (0, _log2.default)('hopp:' + name), log = _createLogger.log, debug = _createLogger.debug;
                start = Date.now();

                log('Starting task'

                /**
                 * Get the modified files.
                 */
                );_context.next = 5;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache);

              case 5:
                files = _context.sent;

                if (!(files.length > 0)) {
                  _context.next = 16;
                  break;
                }

                /**
                 * Create streams.
                 */
                files = (0, _3.default)(files).map(function (file) {
                  return {
                    file: file,
                    stream: [_fs2.default.createReadStream(file)]
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
                  stack = stack.map(function (_ref4) {
                    var _ref5 = _slicedToArray(_ref4, 1),
                        plugin = _ref5[0];

                    return (0, _mapStream2.default)(function (data, next) {
                      plugins[plugin](pluginCtx[plugin], data).then(function (newData) {
                        return next(null, newData);
                      }).catch(function (err) {
                        return next(err);
                      });
                    });
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
                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
                _context.next = 12;
                return (0, _mkdirp2.default)(dest.replace(directory, ''), directory);

              case 12:

                files.map(function (file) {
                  file.stream.push(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
                  file.stream = (0, _pump2.default)(file.stream);

                  return new Promise(function (resolve, reject) {
                    file.stream.on('error', reject);
                    file.stream.on('close', resolve);
                  });
                }

                // launch
                );files = files.val();
                _context.next = 18;
                break;

              case 16:
                log('Task ended (took %s ms)', Date.now() - start);
                return _context.abrupt('return');

              case 18:
                _context.next = 20;
                return Promise.all(files);

              case 20:
                log('Task ended (took %s ms)', Date.now() - start);

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function start(_x2, _x3) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5Iiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJ1c2VEb3VibGVDYWNoZSIsIkRhdGUiLCJub3ciLCJmaWxlcyIsImxlbmd0aCIsIm1hcCIsImZpbGUiLCJzdHJlYW0iLCJjcmVhdGVSZWFkU3RyZWFtIiwiaGFzT3duUHJvcGVydHkiLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJ2YWwiLCJjb25jYXQiLCJyZXBsYWNlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJyZWplY3QiLCJhbGwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUMsV0FBVyxtQkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsSUFBTUMsVUFBVSxFQUFoQjtBQUNBLElBQU1DLFlBQVksRUFBbEI7O0FBRUE7OztBQUdBLElBQU1DLGFBQWEs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QUErQjBDLEtBQUtDLEdBQUwsS0FBYVIsS0FBNUM7Ozs7O3VCQUlJQyxRQUFRMEIsR0FBUixDQUFZbEIsS0FBWixDOzs7QUFDTjVDLG9CQUFJLHlCQUFKLEVBQStCMEMsS0FBS0MsR0FBTCxLQUFhUixLQUE1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHRjs7Ozs7Ozs2QkFJVTtBQUNSLGFBQU87QUFDTGQsY0FBTSxLQUFLSCxDQUFMLENBQU9HLElBRFI7QUFFTEwsYUFBSyxLQUFLRSxDQUFMLENBQU9GLEdBRlA7QUFHTEcsZUFBTyxLQUFLRCxDQUFMLENBQU9DO0FBSFQsT0FBUDtBQUtEOztBQUVEOzs7Ozs7Ozs2QkFLVTRDLEksRUFBTTtBQUNkLFdBQUs3QyxDQUFMLENBQU9HLElBQVAsR0FBYzBDLEtBQUsxQyxJQUFuQjtBQUNBLFdBQUtILENBQUwsQ0FBT0YsR0FBUCxHQUFhK0MsS0FBSy9DLEdBQWxCO0FBQ0EsV0FBS0UsQ0FBTCxDQUFPQyxLQUFQLEdBQWU0QyxLQUFLNUMsS0FBcEI7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7Ozs7OztrQkE1TGtCSixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICcuLi9fJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1hcFN0cmVhbSBmcm9tICdtYXAtc3RyZWFtJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5DdHggPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSlcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdGFjayA9IF8odGhpcy5kLnN0YWNrKVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgICAgICAgIHN0YWNrLm1hcCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW3BsdWdpbiwgYXJnc11cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgc3RhY2sgPSBzdGFjay5tYXAoKFtwbHVnaW5dKSA9PlxuICAgICAgICAgIG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgICBwbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgICAgIH0pXG4gICAgICAgICkudmFsKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIGZpbGUuc3RyZWFtLnB1c2goZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG4gICAgICAgIGZpbGUuc3RyZWFtID0gcHVtcChmaWxlLnN0cmVhbSlcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gbGF1bmNoXG4gICAgICBmaWxlcyA9IGZpbGVzLnZhbCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChmaWxlcylcbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19