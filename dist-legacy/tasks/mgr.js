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

        var _createLogger, log, debug, files, dest, stack, _start;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger = (0, _log2.default)('hopp:' + name

                /**
                 * Get the modified files.
                 */
                ), log = _createLogger.log, debug = _createLogger.debug;
                _context.next = 3;
                return (0, _glob2.default)(this.d.src, directory, useDoubleCache);

              case 3:
                files = _context.sent;

                if (!(files.length > 0)) {
                  _context.next = 18;
                  break;
                }

                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
                _context.next = 8;
                return (0, _mkdirp2.default)(dest.replace(directory, ''), directory

                /**
                 * Create streams.
                 */
                );

              case 8:
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
                _context.next = 15;
                return Promise.all(files.val());

              case 15:
                log('Task ended (took %s ms)', Date.now() - _start);
                _context.next = 19;
                break;

              case 18:
                log('Skipping task');

              case 19:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsInBsdWdpbnMiLCJwbHVnaW5DdHgiLCJsb2FkUGx1Z2luIiwicGx1Z2luIiwiYXJncyIsIm1vZCIsInJlcXVpcmUiLCJfX2VzTW9kdWxlIiwiZGVmYXVsdCIsImxvZ2dlciIsImJhc2VuYW1lIiwic3Vic3RyIiwiZGVidWciLCJlcnJvciIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5Iiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJ1c2VEb3VibGVDYWNoZSIsImZpbGVzIiwibGVuZ3RoIiwicmVwbGFjZSIsIm1hcCIsImZpbGUiLCJzdHJlYW0iLCJoYXNPd25Qcm9wZXJ0eSIsImRhdGEiLCJuZXh0IiwidGhlbiIsIm5ld0RhdGEiLCJjYXRjaCIsImVyciIsInZhbCIsImNvbmNhdCIsImJvZHkiLCJjcmVhdGVXcml0ZVN0cmVhbSIsInJlamVjdCIsIkRhdGUiLCJub3ciLCJhbGwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQyxXQUFXLG1CQUFhLFlBQWIsRUFBMkJDLEdBQTVDOztBQUVBOzs7QUFHQSxJQUFNQyxVQUFVLEVBQWhCO0FBQ0EsSUFBTUMsWUFBWSxFQUFsQjs7QUFFQTs7O0FBR0EsSUFBTUMsYUFBYSxTQUFiQSxVQUFhLENBQUNDLE1BQUQsRUFBU0MsSUFBVCxFQUFrQjtBQUNuQyxNQUFJQyxNQUFNQyxRQUFRSDs7QUFFbEI7QUFDQTtBQUhVLEdBQVYsQ0FJQSxJQUFJRSxJQUFJRSxVQUFKLEtBQW1CLElBQXZCLEVBQTZCO0FBQzNCRixVQUFNQSxJQUFJRyxPQUFWO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFNQyxTQUFTLDZCQUFxQixlQUFLQyxRQUFMLENBQWNQLE1BQWQsRUFBc0JRLE1BQXRCLENBQTZCLENBQTdCOztBQUVwQztBQUZlLEdBQWYsQ0FHQVYsVUFBVUUsTUFBVixJQUFvQjtBQUNsQkMsY0FEa0I7QUFFbEJMLFNBQUtVLE9BQU9HLEtBRk07QUFHbEJDLFdBQU9KLE9BQU9JOztBQUdoQjtBQU5vQixHQUFwQixDQU9BLE9BQU9SLEdBQVA7QUFDRCxDQXJCRDs7QUF1QkE7Ozs7SUFHcUJTLEk7QUFDbkI7Ozs7Ozs7QUFPQSxnQkFBYUMsR0FBYixFQUFrQjtBQUFBOztBQUNoQixRQUFJLEVBQUVBLGVBQWVDLEtBQWpCLENBQUosRUFBNkI7QUFDM0JELFlBQU0sQ0FBQ0EsR0FBRCxDQUFOO0FBQ0Q7O0FBRUQsU0FBS0UsQ0FBTCxHQUFTO0FBQ1BGLGNBRE87QUFFUEcsYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7Ozs7O3lCQUtNQyxHLEVBQUs7QUFDVCxXQUFLRixDQUFMLENBQU9HLElBQVAsR0FBY0QsR0FBZDtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7MEJBR09FLEksRUFBTUMsUyxFQUFXO0FBQUE7O0FBQ3RCRCx3QkFBZ0JBLElBQWhCOztBQUVBLFVBQU1FLFdBQVcsRUFBakI7O0FBRUEsV0FBS04sQ0FBTCxDQUFPRixHQUFQLENBQVdTLE9BQVgsQ0FBbUIsZUFBTztBQUN4QjtBQUNBLFlBQU1DLFlBQVlWLElBQUlXLE9BQUosQ0FBWSxNQUFaLE1BQXdCLENBQUMsQ0FBM0M7O0FBRUE7QUFDQSxZQUFJQyxVQUFVLEVBQWQ7QUFMd0I7QUFBQTtBQUFBOztBQUFBO0FBTXhCLCtCQUFnQlosSUFBSWEsS0FBSixDQUFVLEdBQVYsQ0FBaEIsOEhBQWdDO0FBQUEsZ0JBQXZCQyxHQUF1Qjs7QUFDOUIsZ0JBQUlBLEdBQUosRUFBUztBQUNQLGtCQUFJQSxJQUFJSCxPQUFKLENBQVksR0FBWixNQUFxQixDQUFDLENBQTFCLEVBQTZCO0FBQzNCO0FBQ0Q7O0FBRURDLHlCQUFXLGVBQUtHLEdBQUwsR0FBV0QsR0FBdEI7QUFDRDtBQUNGO0FBZHVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZXhCRixrQkFBVSxlQUFLSSxPQUFMLENBQWFULFNBQWIsRUFBd0JLLFFBQVFoQixNQUFSLENBQWUsQ0FBZjs7QUFFbEM7QUFGVSxTQUFWLENBR0E7O0FBRUE7QUFGQSxZQUdBYixTQUFTLHFCQUFULEVBQWdDdUIsSUFBaEM7QUFDQUUsaUJBQVNTLElBQVQsQ0FBYyxhQUFHQyxLQUFILENBQVNOLE9BQVQsRUFBa0I7QUFDOUJGLHFCQUFXVixJQUFJVyxPQUFKLENBQVksTUFBWixNQUF3QixDQUFDO0FBRE4sU0FBbEIsRUFFWDtBQUFBLGlCQUFNLE1BQUtRLEtBQUwsQ0FBV2IsSUFBWCxFQUFpQkMsU0FBakIsRUFBNEIsS0FBNUIsQ0FBTjtBQUFBLFNBRlcsQ0FBZDtBQUdELE9BekJEOztBQTJCQSxhQUFPLElBQUlhLE9BQUosQ0FBWSxtQkFBVztBQUM1QkMsZ0JBQVFDLEVBQVIsQ0FBVyxRQUFYLEVBQXFCLFlBQU07QUFDekJkLG1CQUFTQyxPQUFULENBQWlCO0FBQUEsbUJBQVdjLFFBQVFDLEtBQVIsRUFBWDtBQUFBLFdBQWpCO0FBQ0FSO0FBQ0QsU0FIRDtBQUlELE9BTE0sQ0FBUDtBQU1EOztBQUVEOzs7Ozs7Ozs0RUFJYVYsSSxFQUFNQyxTO1lBQVdrQixjLHVFQUFpQixJOzs7Ozs7OztnQ0FDdEIsNkJBQXFCbkI7O0FBRTVDOzs7QUFGdUIsaUIsRUFBZnRCLEcsaUJBQUFBLEcsRUFBS2EsSyxpQkFBQUEsSzs7dUJBS0ssb0JBQUssS0FBS0ssQ0FBTCxDQUFPRixHQUFaLEVBQWlCTyxTQUFqQixFQUE0QmtCLGNBQTVCLEM7OztBQUFkQyxxQjs7c0JBRUFBLE1BQU1DLE1BQU4sR0FBZSxDOzs7OztBQUNYdEIsb0IsR0FBTyxlQUFLVyxPQUFMLENBQWFULFNBQWIsRUFBd0IsdUJBQVEsS0FBS0wsQ0FBTCxDQUFPRyxJQUFmLENBQXhCLEM7O3VCQUNQLHNCQUFPQSxLQUFLdUIsT0FBTCxDQUFhckIsU0FBYixFQUF3QixFQUF4QixDQUFQLEVBQW9DQTs7QUFFMUM7OztBQUZNLGlCOzs7QUFLTm1CLHdCQUFRLGdCQUFFQSxLQUFGLEVBQVNHLEdBQVQsQ0FBYTtBQUFBLHlCQUFTO0FBQzVCQyw4QkFENEI7QUFFNUJDLDRCQUFRLENBQ04sMEJBQWlCRCxJQUFqQixFQUF1QnpCLElBQXZCLENBRE07QUFGb0IsbUJBQVQ7QUFBQSxpQkFBYixDQUFSOztBQU9BLG9CQUFJLEtBQUtILENBQUwsQ0FBT0MsS0FBUCxDQUFhd0IsTUFBYixHQUFzQixDQUExQixFQUE2QjtBQUMzQjs7O0FBR0l4Qix1QkFKdUIsR0FJZixnQkFBRSxLQUFLRCxDQUFMLENBQU9DLEtBQVQsQ0FKZTs7O0FBTTNCLHNCQUFJLENBQUMsS0FBS2xCLE9BQVYsRUFBbUI7QUFDakIseUJBQUtBLE9BQUwsR0FBZSxFQUFmOztBQUVBa0IsMEJBQU0wQixHQUFOLENBQVUsaUJBQW9CO0FBQUE7QUFBQSwwQkFBbEJ6QyxNQUFrQjtBQUFBLDBCQUFWQyxJQUFVOztBQUM1QiwwQkFBSSxDQUFDSixRQUFRK0MsY0FBUixDQUF1QjVDLE1BQXZCLENBQUwsRUFBcUM7QUFDbkNILGdDQUFRRyxNQUFSLElBQWtCRCxXQUFXQyxNQUFYLEVBQW1CQyxJQUFuQixDQUFsQjtBQUNEOztBQUVELDZCQUFPLENBQUNELE1BQUQsRUFBU0MsSUFBVCxDQUFQO0FBQ0QscUJBTkQ7QUFPRDs7QUFFRDs7O0FBR0FjLDBCQUFRQSxNQUFNMEIsR0FBTixDQUFVO0FBQUE7QUFBQSx3QkFBRXpDLE1BQUY7O0FBQUEsMkJBQ2hCLHlCQUFVLFVBQUM2QyxJQUFELEVBQU9DLElBQVAsRUFBZ0I7QUFDeEJqRCw4QkFBUUcsTUFBUixFQUNFRixVQUFVRSxNQUFWLENBREYsRUFFRTZDLElBRkYsRUFJR0UsSUFKSCxDQUlRO0FBQUEsK0JBQVdELEtBQUssSUFBTCxFQUFXRSxPQUFYLENBQVg7QUFBQSx1QkFKUixFQUtHQyxLQUxILENBS1M7QUFBQSwrQkFBT0gsS0FBS0ksR0FBTCxDQUFQO0FBQUEsdUJBTFQ7QUFNRCxxQkFQRCxDQURnQjtBQUFBLG1CQUFWLEVBU05DOztBQUVGOzs7QUFYUSxvQkFBUixDQWNBYixNQUFNRyxHQUFOLENBQVUsZ0JBQVE7QUFDaEJDLHlCQUFLQyxNQUFMLEdBQWNELEtBQUtDLE1BQUwsQ0FBWVMsTUFBWixDQUFtQnJDLEtBQW5CLENBQWQ7QUFDQSwyQkFBTzJCLElBQVA7QUFDRCxtQkFIRDtBQUlEOztBQUVEOzs7QUFHQUosc0JBQU1HLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQjtBQUNBQyx1QkFBS0MsTUFBTCxDQUFZZCxJQUFaLENBQWlCLHlCQUFVLFVBQUNnQixJQUFELEVBQU9DLElBQVA7QUFBQSwyQkFBZ0JBLEtBQUssSUFBTCxFQUFXRCxLQUFLUSxJQUFoQixDQUFoQjtBQUFBLG1CQUFWLENBQWpCO0FBQ0FYLHVCQUFLQyxNQUFMLENBQVlkLElBQVosQ0FBaUIsYUFBR3lCLGlCQUFILENBQXFCckMsT0FBTyxHQUFQLEdBQWEsZUFBS1YsUUFBTCxDQUFjbUMsS0FBS0EsSUFBbkIsQ0FBbEM7O0FBRWpCO0FBRkEsb0JBR0FBLEtBQUtDLE1BQUwsR0FBYyxvQkFBS0QsS0FBS0M7O0FBRXhCO0FBRmMsbUJBQWQsQ0FHQSxPQUFPLElBQUlYLE9BQUosQ0FBWSxVQUFDSixPQUFELEVBQVUyQixNQUFWLEVBQXFCO0FBQ3RDYix5QkFBS0MsTUFBTCxDQUFZVCxFQUFaLENBQWUsT0FBZixFQUF3QnFCLE1BQXhCO0FBQ0FiLHlCQUFLQyxNQUFMLENBQVlULEVBQVosQ0FBZSxPQUFmLEVBQXdCTixPQUF4QjtBQUNELG1CQUhNLENBQVA7QUFJRDs7QUFFRDtBQWZBLGtCQWdCTUcsTSxHQUFReUIsS0FBS0MsR0FBTCxFOztBQUNkN0Qsb0JBQUksZUFBSjs7dUJBQ01vQyxRQUFRMEIsR0FBUixDQUFZcEIsTUFBTWEsR0FBTixFQUFaLEM7OztBQUNOdkQsb0JBQUkseUJBQUosRUFBK0I0RCxLQUFLQyxHQUFMLEtBQWExQixNQUE1Qzs7Ozs7QUFFQW5DLG9CQUFJLGVBQUo7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUo7Ozs7Ozs7NkJBSVU7QUFDUixhQUFPO0FBQ0xxQixjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMTCxhQUFLLEtBQUtFLENBQUwsQ0FBT0YsR0FGUDtBQUdMRyxlQUFPLEtBQUtELENBQUwsQ0FBT0M7QUFIVCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVNEMsSSxFQUFNO0FBQ2QsV0FBSzdDLENBQUwsQ0FBT0csSUFBUCxHQUFjMEMsS0FBSzFDLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPRixHQUFQLEdBQWErQyxLQUFLL0MsR0FBbEI7QUFDQSxXQUFLRSxDQUFMLENBQU9DLEtBQVAsR0FBZTRDLEtBQUs1QyxLQUFwQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQTlMa0JKLEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJy4uL18nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHB1bXAgZnJvbSAncHVtcCdcbmltcG9ydCBnbG9iIGZyb20gJy4uL2dsb2InXG5pbXBvcnQgbWtkaXJwIGZyb20gJy4uL21rZGlycCdcbmltcG9ydCBnZXRQYXRoIGZyb20gJy4uL2dldC1wYXRoJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgbWFwU3RyZWFtIGZyb20gJ21hcC1zdHJlYW0nXG5pbXBvcnQgeyBkaXNhYmxlRlNDYWNoZSB9IGZyb20gJy4uL2ZzJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5pbXBvcnQgY3JlYXRlUmVhZFN0cmVhbSBmcm9tICcuL3JlYWQtc3RyZWFtJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIFBsdWdpbnMgc3RvcmFnZS5cbiAqL1xuY29uc3QgcGx1Z2lucyA9IHt9XG5jb25zdCBwbHVnaW5DdHggPSB7fVxuXG4vKipcbiAqIExvYWRzIGEgcGx1Z2luLCBtYW5hZ2VzIGl0cyBlbnYuXG4gKi9cbmNvbnN0IGxvYWRQbHVnaW4gPSAocGx1Z2luLCBhcmdzKSA9PiB7XG4gIGxldCBtb2QgPSByZXF1aXJlKHBsdWdpbilcblxuICAvLyBpZiBkZWZpbmVkIGFzIGFuIEVTMjAxNSBtb2R1bGUsIGFzc3VtZSB0aGF0IHRoZVxuICAvLyBleHBvcnQgaXMgYXQgJ2RlZmF1bHQnXG4gIGlmIChtb2QuX19lc01vZHVsZSA9PT0gdHJ1ZSkge1xuICAgIG1vZCA9IG1vZC5kZWZhdWx0XG4gIH1cblxuICAvLyBjcmVhdGUgcGx1Z2luIGxvZ2dlclxuICBjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtwYXRoLmJhc2VuYW1lKHBsdWdpbikuc3Vic3RyKDUpfWApXG5cbiAgLy8gY3JlYXRlIGEgbmV3IGNvbnRleHQgZm9yIHRoaXMgcGx1Z2luXG4gIHBsdWdpbkN0eFtwbHVnaW5dID0ge1xuICAgIGFyZ3MsXG4gICAgbG9nOiBsb2dnZXIuZGVidWcsXG4gICAgZXJyb3I6IGxvZ2dlci5lcnJvclxuICB9XG5cbiAgLy8gcmV0dXJuIGxvYWRlZCBwbHVnaW5cbiAgcmV0dXJuIG1vZFxufVxuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtb2RpZmllZCBmaWxlcy5cbiAgICAgKi9cbiAgICBsZXQgZmlsZXMgPSBhd2FpdCBnbG9iKHRoaXMuZC5zcmMsIGRpcmVjdG9yeSwgdXNlRG91YmxlQ2FjaGUpXG5cbiAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZGVzdCA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnksIGdldFBhdGgodGhpcy5kLmRlc3QpKVxuICAgICAgYXdhaXQgbWtkaXJwKGRlc3QucmVwbGFjZShkaXJlY3RvcnksICcnKSwgZGlyZWN0b3J5KVxuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogW1xuICAgICAgICAgIGNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgZGVzdClcbiAgICAgICAgXVxuICAgICAgfSkpXG5cbiAgICAgIGlmICh0aGlzLmQuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVHJ5IHRvIGxvYWQgcGx1Z2lucy5cbiAgICAgICAgICovXG4gICAgICAgIGxldCBzdGFjayA9IF8odGhpcy5kLnN0YWNrKVxuXG4gICAgICAgIGlmICghdGhpcy5wbHVnaW5zKSB7XG4gICAgICAgICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgICAgICAgIHN0YWNrLm1hcCgoW3BsdWdpbiwgYXJnc10pID0+IHtcbiAgICAgICAgICAgIGlmICghcGx1Z2lucy5oYXNPd25Qcm9wZXJ0eShwbHVnaW4pKSB7XG4gICAgICAgICAgICAgIHBsdWdpbnNbcGx1Z2luXSA9IGxvYWRQbHVnaW4ocGx1Z2luLCBhcmdzKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gW3BsdWdpbiwgYXJnc11cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgc3RhY2sgPSBzdGFjay5tYXAoKFtwbHVnaW5dKSA9PlxuICAgICAgICAgIG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4ge1xuICAgICAgICAgICAgcGx1Z2luc1twbHVnaW5dKFxuICAgICAgICAgICAgICBwbHVnaW5DdHhbcGx1Z2luXSxcbiAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAudGhlbihuZXdEYXRhID0+IG5leHQobnVsbCwgbmV3RGF0YSkpXG4gICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gbmV4dChlcnIpKVxuICAgICAgICAgIH0pXG4gICAgICAgICkudmFsKClcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29ubmVjdCBwbHVnaW4gc3RyZWFtcyB3aXRoIHBpcGVsaW5lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICBmaWxlLnN0cmVhbSA9IGZpbGUuc3RyZWFtLmNvbmNhdChzdGFjaylcbiAgICAgICAgICByZXR1cm4gZmlsZVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbm5lY3Qgd2l0aCBkZXN0aW5hdGlvbi5cbiAgICAgICAqL1xuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICAvLyBzdHJpcCBvdXQgdGhlIGFjdHVhbCBib2R5IGFuZCB3cml0ZSBpdFxuICAgICAgICBmaWxlLnN0cmVhbS5wdXNoKG1hcFN0cmVhbSgoZGF0YSwgbmV4dCkgPT4gbmV4dChudWxsLCBkYXRhLmJvZHkpKSlcbiAgICAgICAgZmlsZS5zdHJlYW0ucHVzaChmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKSlcblxuICAgICAgICAvLyBjb25uZWN0IGFsbCBzdHJlYW1zIHRvZ2V0aGVyIHRvIGZvcm0gcGlwZWxpbmVcbiAgICAgICAgZmlsZS5zdHJlYW0gPSBwdW1wKGZpbGUuc3RyZWFtKVxuXG4gICAgICAgIC8vIHByb21pc2lmeSB0aGUgY3VycmVudCBwaXBlbGluZVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGZpbGUuc3RyZWFtLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICBmaWxlLnN0cmVhbS5vbignY2xvc2UnLCByZXNvbHZlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy8gc3RhcnQgJiB3YWl0IGZvciBhbGwgcGlwZWxpbmVzIHRvIGVuZFxuICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICBsb2coJ1N0YXJ0aW5nIHRhc2snKVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMudmFsKCkpXG4gICAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ1NraXBwaW5nIHRhc2snKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==