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

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

var _mkdirp = require('../mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _getPath = require('../get-path');

var _getPath2 = _interopRequireDefault(_getPath);

var _cache = require('../cache');

var cache = _interopRequireWildcard(_cache);

var _log = require('../utils/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
     * Starts the pipeline.
     * @return {Promise} resolves when task is complete
     */

  }, {
    key: 'start',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, directory) {
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
                return (0, _glob2.default)(this.d.src, directory);

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
                  file.stream.pipe(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
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

      function start(_x, _x2) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwic3JjIiwiZCIsInN0YWNrIiwib3V0IiwiZGVzdCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJsb2ciLCJkZWJ1ZyIsInN0YXJ0IiwiRGF0ZSIsIm5vdyIsImZpbGVzIiwibGVuZ3RoIiwibWFwIiwiZmlsZSIsInN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJlbmNvZGluZyIsInJlc29sdmUiLCJyZXBsYWNlIiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYmFzZW5hbWUiLCJ2YWwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7cWpCQUFBOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7Ozs7Ozs7Ozs7O0FBRUE7OztJQUdxQkMsSTtBQUNuQjs7Ozs7OztBQU9BLGdCQUFhQyxHQUFiLEVBQWtCO0FBQUE7O0FBQ2hCLFNBQUtDLENBQUwsR0FBUztBQUNQRCxjQURPO0FBRVBFLGFBQU87QUFGQSxLQUFUO0FBSUQ7O0FBRUQ7Ozs7Ozs7Ozt5QkFLTUMsRyxFQUFLO0FBQ1QsV0FBS0YsQ0FBTCxDQUFPRyxJQUFQLEdBQWNELEdBQWQ7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7NEVBSWFFLEksRUFBTUMsUzs7Ozs7OztnQ0FDTSw2QkFBcUJELElBQXJCLEMsRUFBZkUsRyxpQkFBQUEsRyxFQUFLQyxLLGlCQUFBQSxLO0FBQ1BDLHFCLEdBQVFDLEtBQUtDLEdBQUwsRTs7QUFDZEosb0JBQUk7O0FBRUo7OztBQUZBLGtCO3VCQUtrQixvQkFBSyxLQUFLTixDQUFMLENBQU9ELEdBQVosRUFBaUJNLFNBQWpCLEM7OztBQUFkTSxxQjs7c0JBRUFBLE1BQU1DLE1BQU4sR0FBZSxDOzs7OztBQUNqQjs7O0FBR0FELHdCQUFRLGdCQUFFQSxLQUFGLEVBQVNFLEdBQVQsQ0FBYTtBQUFBLHlCQUFTO0FBQzVCQyw4QkFENEI7QUFFNUJDLDRCQUFRLGFBQUdDLGdCQUFILENBQW9CRixJQUFwQixFQUEwQixFQUFFRyxVQUFVLE1BQVosRUFBMUI7QUFGb0IsbUJBQVQ7QUFBQTs7QUFLckI7O0FBRUE7OztBQVBRLGlCQUFSLENBVU1kLEksR0FBTyxlQUFLZSxPQUFMLENBQWFiLFNBQWIsRUFBd0IsdUJBQVEsS0FBS0wsQ0FBTCxDQUFPRyxJQUFmLENBQXhCLEM7O3VCQUNQLHNCQUFPQSxLQUFLZ0IsT0FBTCxDQUFhZCxTQUFiLEVBQXdCLEVBQXhCLENBQVAsRUFBb0NBLFNBQXBDLEM7Ozs7QUFFTk0sc0JBQU1FLEdBQU4sQ0FBVSxnQkFBUTtBQUNoQkMsdUJBQUtDLE1BQUwsQ0FBWUssSUFBWixDQUNFLGFBQUdDLGlCQUFILENBQXFCbEIsT0FBTyxHQUFQLEdBQWEsZUFBS21CLFFBQUwsQ0FBY1IsS0FBS0EsSUFBbkIsQ0FBbEMsQ0FERjtBQUdEOztBQUVEO0FBTkEsa0JBT0FILE1BQU1ZLEdBQU47Ozs7QUFHRmpCLG9CQUFJLHlCQUFKLEVBQStCRyxLQUFLQyxHQUFMLEtBQWFGLEtBQTVDOzs7Ozs7Ozs7Ozs7Ozs7OztBQUdGOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMTCxjQUFNLEtBQUtILENBQUwsQ0FBT0csSUFEUjtBQUVMSixhQUFLLEtBQUtDLENBQUwsQ0FBT0QsR0FGUDtBQUdMRSxlQUFPLEtBQUtELENBQUwsQ0FBT0M7QUFIVCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVdUIsSSxFQUFNO0FBQ2QsV0FBS3hCLENBQUwsQ0FBT0csSUFBUCxHQUFjcUIsS0FBS3JCLElBQW5CO0FBQ0EsV0FBS0gsQ0FBTCxDQUFPRCxHQUFQLEdBQWF5QixLQUFLekIsR0FBbEI7QUFDQSxXQUFLQyxDQUFMLENBQU9DLEtBQVAsR0FBZXVCLEtBQUt2QixLQUFwQjs7QUFFQSxhQUFPLElBQVA7QUFDRDs7Ozs7O2tCQTVGa0JILEkiLCJmaWxlIjoibWdyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvdGFza3MvbWdyLmpzXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBjb3B5cmlnaHQgMjAxNyBLYXJpbSBBbGliaGFpLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJy4uL18nXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGdsb2IgZnJvbSAnLi4vZ2xvYidcbmltcG9ydCBta2RpcnAgZnJvbSAnLi4vbWtkaXJwJ1xuaW1wb3J0IGdldFBhdGggZnJvbSAnLi4vZ2V0LXBhdGgnXG5pbXBvcnQgKiBhcyBjYWNoZSBmcm9tICcuLi9jYWNoZSdcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAnLi4vdXRpbHMvbG9nJ1xuXG4vKipcbiAqIEhvcHAgY2xhc3MgdG8gbWFuYWdlIHRhc2tzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb3BwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgdGFzayB3aXRoIHRoZSBnbG9iLlxuICAgKiBET0VTIE5PVCBTVEFSVCBUSEUgVEFTSy5cbiAgICogXG4gICAqIEBwYXJhbSB7R2xvYn0gc3JjXG4gICAqIEByZXR1cm4ge0hvcHB9IG5ldyBob3BwIG9iamVjdFxuICAgKi9cbiAgY29uc3RydWN0b3IgKHNyYykge1xuICAgIHRoaXMuZCA9IHtcbiAgICAgIHNyYyxcbiAgICAgIHN0YWNrOiBbXVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGlzIHBpcGVsaW5lLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3V0XG4gICAqIEByZXR1cm4ge0hvcHB9IHRhc2sgbWFuYWdlclxuICAgKi9cbiAgZGVzdCAob3V0KSB7XG4gICAgdGhpcy5kLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG1vZGlmaWVkIGZpbGVzLlxuICAgICAqL1xuICAgIGxldCBmaWxlcyA9IGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5KVxuXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlIHN0cmVhbXMuXG4gICAgICAgKi9cbiAgICAgIGZpbGVzID0gXyhmaWxlcykubWFwKGZpbGUgPT4gKHtcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RyZWFtOiBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KVxuICAgICAgfSkpXG5cbiAgICAgIC8vIFRPRE86IHBpcGUgdG8gcGx1Z2luIHN0cmVhbXNcblxuICAgICAgLyoqXG4gICAgICAgKiBDb25uZWN0IHdpdGggZGVzdGluYXRpb24uXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICAgIGF3YWl0IG1rZGlycChkZXN0LnJlcGxhY2UoZGlyZWN0b3J5LCAnJyksIGRpcmVjdG9yeSlcblxuICAgICAgZmlsZXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBmaWxlLnN0cmVhbS5waXBlKFxuICAgICAgICAgIGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QgKyAnLycgKyBwYXRoLmJhc2VuYW1lKGZpbGUuZmlsZSkpXG4gICAgICAgIClcbiAgICAgIH0pXG5cbiAgICAgIC8vIGxhdW5jaFxuICAgICAgZmlsZXMudmFsKClcbiAgICB9XG5cbiAgICBsb2coJ1Rhc2sgZW5kZWQgKHRvb2sgJXMgbXMpJywgRGF0ZS5ub3coKSAtIHN0YXJ0KVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRhc2sgbWFuYWdlciB0byBKU09OIGZvciBzdG9yYWdlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHByb3BlciBKU09OIG9iamVjdFxuICAgKi9cbiAgdG9KU09OICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzdDogdGhpcy5kLmRlc3QsXG4gICAgICBzcmM6IHRoaXMuZC5zcmMsXG4gICAgICBzdGFjazogdGhpcy5kLnN0YWNrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBhIEpTT04gb2JqZWN0IGludG8gYSBtYW5hZ2VyLlxuICAgKiBAcGFyYW0ge09iamVjdH0ganNvblxuICAgKiBAcmV0dXJuIHtIb3BwfSB0YXNrIG1hbmFnZXJcbiAgICovXG4gIGZyb21KU09OIChqc29uKSB7XG4gICAgdGhpcy5kLmRlc3QgPSBqc29uLmRlc3RcbiAgICB0aGlzLmQuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLmQuc3RhY2sgPSBqc29uLnN0YWNrXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59Il19