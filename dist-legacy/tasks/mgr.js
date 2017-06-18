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
                  _context.next = 14;
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
                }

                // launch
                );files.val();

              case 14:

                log('Task ended (took %s ms)', Date.now() - start);

              case 15:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5Iiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJ1c2VEb3VibGVDYWNoZSIsIkRhdGUiLCJub3ciLCJmaWxlcyIsImxlbmd0aCIsIm1hcCIsImZpbGUiLCJzdHJlYW0iLCJjcmVhdGVSZWFkU3RyZWFtIiwiaGFzT3duUHJvcGVydHkiLCJkYXRhIiwibmV4dCIsInRoZW4iLCJuZXdEYXRhIiwiY2F0Y2giLCJlcnIiLCJ2YWwiLCJjb25jYXQiLCJyZXBsYWNlIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUMsV0FBVyxtQkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7O0FBR0EsSUFBTUMsVUFBVSxFQUFoQjtBQUNBLElBQU1DLFlBQVksRUFBbEI7O0FBRUE7OztBQUdBLElBQU1DLGFBQWEsU0FBYkEsVUFBYSxDQUFD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QUFNO0FBQ2QsV0FBSzNDLENBQUwsQ0FBT0csSUFBUCxHQUFjd0MsS0FBS3hDLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPRixHQUFQLEdBQWE2QyxLQUFLN0MsR0FBbEI7QUFDQSxXQUFLRSxDQUFMLENBQU9DLEtBQVAsR0FBZTBDLEtBQUsxQyxLQUFwQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQW5Ma0JKLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJy4uL18nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2dsb2InXG5pbXBvcnQgbWtkaXJwIGZyb20gJy4uL21rZGlycCdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2dldC1wYXRoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbmNvbnN0IHdhdGNobG9nID0gY3JlYXRlTG9nZ2VyKCdob3BwOndhdGNoJykubG9nXG5cbi8qKlxuICogUGx1Z2lucyBzdG9yYWdlLlxuICovXG5jb25zdCBwbHVnaW5zID0ge31cbmNvbnN0IHBsdWdpbkN0eCA9IHt9XG5cbi8qKlxuICogTG9hZHMgYSBwbHVnaW4sIG1hbmFnZXMgaXRzIGVudi5cbiAqL1xuY29uc3QgbG9hZFBsdWdpbiA9IChwbHVnaW4sIGFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHJlcXVpcmUocGx1Z2luKVxuXG4gIC8vIGlmIGRlZmluZWQgYXMgYW4gRVMyMDE1IG1vZHVsZSwgYXNzdW1lIHRoYXQgdGhlXG4gIC8vIGV4cG9ydCBpcyBhdCAnZGVmYXVsdCdcbiAgaWYgKG1vZC5fX2VzTW9kdWxlID09PSB0cnVlKSB7XG4gICAgbW9kID0gbW9kLmRlZmF1bHRcbiAgfVxuXG4gIC8vIGNyZWF0ZSBwbHVnaW4gbG9nZ2VyXG4gIGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihgaG9wcDoke3BhdGguYmFzZW5hbWUocGx1Z2luKS5zdWJzdHIoNSl9YClcblxuICAvLyBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgdGhpcyBwbHVnaW5cbiAgcGx1Z2luQ3R4W3BsdWdpbl0gPSB7XG4gICAgYXJncyxcbiAgICBsb2c6IGxvZ2dlci5kZWJ1ZyxcbiAgICBlcnJvcjogbG9nZ2VyLmVycm9yXG4gIH1cblxuICAvLyByZXR1cm4gbG9hZGVkIHBsdWdpblxuICByZXR1cm4gbW9kXG59XG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgaWYgKCEoc3JjIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBzcmMgPSBbc3JjXVxuICAgIH1cblxuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0YXNrIGluIGNvbnRpbnVvdXMgbW9kZS5cbiAgICovXG4gIHdhdGNoIChuYW1lLCBkaXJlY3RvcnkpIHtcbiAgICBuYW1lID0gYHdhdGNoOiR7bmFtZX1gXG5cbiAgICBjb25zdCB3YXRjaGVycyA9IFtdXG5cbiAgICB0aGlzLmQuc3JjLmZvckVhY2goc3JjID0+IHtcbiAgICAgIC8vIGZpZ3VyZSBvdXQgaWYgd2F0Y2ggc2hvdWxkIGJlIHJlY3Vyc2l2ZVxuICAgICAgY29uc3QgcmVjdXJzaXZlID0gc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcblxuICAgICAgLy8gZ2V0IG1vc3QgZGVmaW5pdGl2ZSBwYXRoIHBvc3NpYmxlXG4gICAgICBsZXQgbmV3cGF0aCA9ICcnXG4gICAgICBmb3IgKGxldCBzdWIgb2Ygc3JjLnNwbGl0KCcvJykpIHtcbiAgICAgICAgaWYgKHN1Yikge1xuICAgICAgICAgIGlmIChzdWIuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXdwYXRoICs9IHBhdGguc2VwICsgc3ViXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld3BhdGggPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBuZXdwYXRoLnN1YnN0cigxKSlcblxuICAgICAgLy8gZGlzYWJsZSBmcyBjYWNoaW5nIGZvciB3YXRjaFxuICAgICAgZGlzYWJsZUZTQ2FjaGUoKVxuXG4gICAgICAvLyBzdGFydCB3YXRjaFxuICAgICAgd2F0Y2hsb2coJ1dhdGNoaW5nIGZvciAlcyAuLi4nLCBuYW1lKVxuICAgICAgd2F0Y2hlcnMucHVzaChmcy53YXRjaChuZXdwYXRoLCB7XG4gICAgICAgIHJlY3Vyc2l2ZTogc3JjLmluZGV4T2YoJy8qKi8nKSAhPT0gLTFcbiAgICAgIH0sICgpID0+IHRoaXMuc3RhcnQobmFtZSwgZGlyZWN0b3J5LCBmYWxzZSkpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB3YXRjaGVyLmNsb3NlKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUgPSB0cnVlKSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbW9kaWZpZWQgZmlsZXMuXG4gICAgICovXG4gICAgbGV0IGZpbGVzID0gYXdhaXQgZ2xvYih0aGlzLmQuc3JjLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlKVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBbXG4gICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKVxuICAgICAgICBdXG4gICAgICB9KSlcblxuICAgICAgaWYgKHRoaXMuZC5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcnkgdG8gbG9hZCBwbHVnaW5zLlxuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHN0YWNrID0gXyh0aGlzLmQuc3RhY2spXG5cbiAgICAgICAgaWYgKCF0aGlzLnBsdWdpbnMpIHtcbiAgICAgICAgICB0aGlzLnBsdWdpbnMgPSB7fVxuXG4gICAgICAgICAgc3RhY2subWFwKChbcGx1Z2luLCBhcmdzXSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwbHVnaW5zLmhhc093blByb3BlcnR5KHBsdWdpbikpIHtcbiAgICAgICAgICAgICAgcGx1Z2luc1twbHVnaW5dID0gbG9hZFBsdWdpbihwbHVnaW4sIGFyZ3MpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBbcGx1Z2luLCBhcmdzXVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgICAqL1xuICAgICAgICBzdGFjayA9IHN0YWNrLm1hcCgoW3BsdWdpbl0pID0+XG4gICAgICAgICAgbWFwU3RyZWFtKChkYXRhLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBwbHVnaW5zW3BsdWdpbl0oXG4gICAgICAgICAgICAgIHBsdWdpbkN0eFtwbHVnaW5dLFxuICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgIC50aGVuKG5ld0RhdGEgPT4gbmV4dChudWxsLCBuZXdEYXRhKSlcbiAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBuZXh0KGVycikpXG4gICAgICAgICAgfSlcbiAgICAgICAgKS52YWwoKVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb25uZWN0IHBsdWdpbiBzdHJlYW1zIHdpdGggcGlwZWxpbmVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtID0gZmlsZS5zdHJlYW0uY29uY2F0KHN0YWNrKVxuICAgICAgICAgIHJldHVybiBmaWxlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG4gICAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcbiAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtKVxuICAgICAgfSlcblxuICAgICAgLy8gbGF1bmNoXG4gICAgICBmaWxlcy52YWwoKVxuICAgIH1cblxuICAgIGxvZygnVGFzayBlbmRlZCAodG9vayAlcyBtcyknLCBEYXRlLm5vdygpIC0gc3RhcnQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGFzayBtYW5hZ2VyIHRvIEpTT04gZm9yIHN0b3JhZ2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gcHJvcGVyIEpTT04gb2JqZWN0XG4gICAqL1xuICB0b0pTT04gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0OiB0aGlzLmQuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5kLnNyYyxcbiAgICAgIHN0YWNrOiB0aGlzLmQuc3RhY2tcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGEgSlNPTiBvYmplY3QgaW50byBhIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBqc29uXG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZnJvbUpTT04gKGpzb24pIHtcbiAgICB0aGlzLmQuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuZC5zcmMgPSBqc29uLnNyY1xuICAgIHRoaXMuZC5zdGFjayA9IGpzb24uc3RhY2tcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn0iXX0=