'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _fs3 = require('../fs');

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var watchlog = (0, _log2.default)('hopp:watch').log;

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

        var _createLogger, log, debug, start, files, dest;

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
                  _context.next = 13;
                  break;
                }

                /**
                 * Create streams.
                 */
                files = (0, _3.default)(files).map(function (file) {
                  return {
                    file: file,
                    stream: _fs2.default.createReadStream(file, { encoding: 'utf8' })
                  };
                }

                // TODO: pipe to plugin streams

                /**
                 * Connect with destination.
                 */
                );dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
                _context.next = 11;
                return (0, _mkdirp2.default)(dest.replace(directory, ''), directory);

              case 11:

                files.map(function (file) {
                  (0, _pump2.default)(file.stream, _fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
                }

                // launch
                );files.val();

              case 13:

                log('Task ended (took %s ms)', Date.now() - start);

              case 14:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJ3YXRjaGxvZyIsImxvZyIsIkhvcHAiLCJzcmMiLCJBcnJheSIsImQiLCJzdGFjayIsIm91dCIsImRlc3QiLCJuYW1lIiwiZGlyZWN0b3J5Iiwid2F0Y2hlcnMiLCJmb3JFYWNoIiwicmVjdXJzaXZlIiwiaW5kZXhPZiIsIm5ld3BhdGgiLCJzcGxpdCIsInN1YiIsInNlcCIsInJlc29sdmUiLCJzdWJzdHIiLCJwdXNoIiwid2F0Y2giLCJzdGFydCIsIlByb21pc2UiLCJwcm9jZXNzIiwib24iLCJ3YXRjaGVyIiwiY2xvc2UiLCJ1c2VEb3VibGVDYWNoZSIsImRlYnVnIiwiRGF0ZSIsIm5vdyIsImZpbGVzIiwibGVuZ3RoIiwibWFwIiwiZmlsZSIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJlbmNvZGluZyIsInJlcGxhY2UiLCJjcmVhdGVXcml0ZVN0cmVhbSIsImJhc2VuYW1lIiwidmFsIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O3FqQkFBQTs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUMsV0FBVyxtQkFBYSxZQUFiLEVBQTJCQyxHQUE1Qzs7QUFFQTs7OztJQUdxQkMsSTtBQUNuQjs7Ozs7OztBQU9BLGdCQUFhQyxHQUFiLEVBQWtCO0FBQUE7O0FBQ2hCLFFBQUksRUFBRUEsZUFBZUMsS0FBakIsQ0FBSixFQUE2QjtBQUMzQkQsWUFBTSxDQUFDQSxHQUFELENBQU47QUFDRDs7QUFFRCxTQUFLRSxDQUFMLEdBQVM7QUFDUEYsY0FETztBQUVQRyxhQUFPO0FBRkEsS0FBVDtBQUlEOztBQUVEOzs7Ozs7Ozs7eUJBS01DLEcsRUFBSztBQUNULFdBQUtGLENBQUwsQ0FBT0csSUFBUCxHQUFjRCxHQUFkO0FBQ0EsYUFBTyxJ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LE1BQU1VLEdBQU47Ozs7QUFHRjFDLG9CQUFJLHlCQUFKLEVBQStCOEIsS0FBS0MsR0FBTCxLQUFhVCxLQUE1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHRjs7Ozs7Ozs2QkFJVTtBQUNSLGFBQU87QUFDTGYsY0FBTSxLQUFLSCxDQUFMLENBQU9HLElBRFI7QUFFTEwsYUFBSyxLQUFLRSxDQUFMLENBQU9GLEdBRlA7QUFHTEcsZUFBTyxLQUFLRCxDQUFMLENBQU9DO0FBSFQsT0FBUDtBQUtEOztBQUVEOzs7Ozs7Ozs2QkFLVXNDLEksRUFBTTtBQUNkLFdBQUt2QyxDQUFMLENBQU9HLElBQVAsR0FBY29DLEtBQUtwQyxJQUFuQjtBQUNBLFdBQUtILENBQUwsQ0FBT0YsR0FBUCxHQUFheUMsS0FBS3pDLEdBQWxCO0FBQ0EsV0FBS0UsQ0FBTCxDQUFPQyxLQUFQLEdBQWVzQyxLQUFLdEMsS0FBcEI7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7Ozs7OztrQkF6SWtCSixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICcuLi9fJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwdW1wIGZyb20gJ3B1bXAnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IHsgZGlzYWJsZUZTQ2FjaGUgfSBmcm9tICcuLi9mcydcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuXG5jb25zdCB3YXRjaGxvZyA9IGNyZWF0ZUxvZ2dlcignaG9wcDp3YXRjaCcpLmxvZ1xuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIGlmICghKHNyYyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgc3JjID0gW3NyY11cbiAgICB9XG5cbiAgICB0aGlzLmQgPSB7XG4gICAgICBzcmMsXG4gICAgICBzdGFjazogW11cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gb2YgdGhpcyBwaXBlbGluZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG91dFxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGRlc3QgKG91dCkge1xuICAgIHRoaXMuZC5kZXN0ID0gb3V0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gdGFzayBpbiBjb250aW51b3VzIG1vZGUuXG4gICAqL1xuICB3YXRjaCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgbmFtZSA9IGB3YXRjaDoke25hbWV9YFxuXG4gICAgY29uc3Qgd2F0Y2hlcnMgPSBbXVxuXG4gICAgdGhpcy5kLnNyYy5mb3JFYWNoKHNyYyA9PiB7XG4gICAgICAvLyBmaWd1cmUgb3V0IGlmIHdhdGNoIHNob3VsZCBiZSByZWN1cnNpdmVcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG5cbiAgICAgIC8vIGdldCBtb3N0IGRlZmluaXRpdmUgcGF0aCBwb3NzaWJsZVxuICAgICAgbGV0IG5ld3BhdGggPSAnJ1xuICAgICAgZm9yIChsZXQgc3ViIG9mIHNyYy5zcGxpdCgnLycpKSB7XG4gICAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgICBpZiAoc3ViLmluZGV4T2YoJyonKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV3cGF0aCArPSBwYXRoLnNlcCArIHN1YlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXdwYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgbmV3cGF0aC5zdWJzdHIoMSkpXG5cbiAgICAgIC8vIGRpc2FibGUgZnMgY2FjaGluZyBmb3Igd2F0Y2hcbiAgICAgIGRpc2FibGVGU0NhY2hlKClcblxuICAgICAgLy8gc3RhcnQgd2F0Y2hcbiAgICAgIHdhdGNobG9nKCdXYXRjaGluZyBmb3IgJXMgLi4uJywgbmFtZSlcbiAgICAgIHdhdGNoZXJzLnB1c2goZnMud2F0Y2gobmV3cGF0aCwge1xuICAgICAgICByZWN1cnNpdmU6IHNyYy5pbmRleE9mKCcvKiovJykgIT09IC0xXG4gICAgICB9LCAoKSA9PiB0aGlzLnN0YXJ0KG5hbWUsIGRpcmVjdG9yeSwgZmFsc2UpKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBpcGVsaW5lLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfSByZXNvbHZlcyB3aGVuIHRhc2sgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIHN0YXJ0IChuYW1lLCBkaXJlY3RvcnksIHVzZURvdWJsZUNhY2hlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5LCB1c2VEb3VibGVDYWNoZSlcblxuICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICovXG4gICAgICBmaWxlcyA9IF8oZmlsZXMpLm1hcChmaWxlID0+ICh7XG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0cmVhbTogZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlLCB7IGVuY29kaW5nOiAndXRmOCcgfSlcbiAgICAgIH0pKVxuXG4gICAgICAvLyBUT0RPOiBwaXBlIHRvIHBsdWdpbiBzdHJlYW1zXG5cbiAgICAgIC8qKlxuICAgICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAgICovXG4gICAgICBjb25zdCBkZXN0ID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZ2V0UGF0aCh0aGlzLmQuZGVzdCkpXG4gICAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgcHVtcChmaWxlLnN0cmVhbSwgZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCArICcvJyArIHBhdGguYmFzZW5hbWUoZmlsZS5maWxlKSkpXG4gICAgICB9KVxuXG4gICAgICAvLyBsYXVuY2hcbiAgICAgIGZpbGVzLnZhbCgpXG4gICAgfVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==