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

var _modified = require('../modified');

var _modified2 = _interopRequireDefault(_modified);

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
                 * Get the files.
                 */
                );_context.t0 = _3.default;
                _context.t1 = _modified2.default;
                _context.next = 7;
                return (0, _glob2.default)(this.d.src, directory);

              case 7:
                _context.t2 = _context.sent;
                _context.next = 10;
                return (0, _context.t1)(_context.t2);

              case 10:
                _context.t3 = _context.sent;

                _context.t4 = function (file) {
                  return {
                    file: file,
                    stream: _fs2.default.createReadStream(file, { encoding: 'utf8' })
                  };
                }

                // TODO: pipe to plugin streams

                /**
                 * Connect with destination.
                 */
                ;

                files = (0, _context.t0)(_context.t3).map(_context.t4);
                dest = _path2.default.resolve(directory, (0, _getPath2.default)(this.d.dest));
                _context.next = 16;
                return (0, _mkdirp2.default)(dest.replace(directory, ''), directory);

              case 16:

                files.map(function (file) {
                  file.stream.pipe(_fs2.default.createWriteStream(dest + '/' + _path2.default.basename(file.file)));
                }

                // launch
                );files.val();

                log('Task ended (took %s ms)', Date.now() - start);

              case 19:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwic3JjIiwiZCIsInN0YWNrIiwib3V0IiwiZGVzdCIsIm5hbWUiLCJkaXJlY3RvcnkiLCJsb2ciLCJkZWJ1ZyIsInN0YXJ0IiwiRGF0ZSIsIm5vdyIsImZpbGUiLCJzdHJlYW0iLCJjcmVhdGVSZWFkU3RyZWFtIiwiZW5jb2RpbmciLCJmaWxlcyIsIm1hcCIsInJlc29sdmUiLCJyZXBsYWNlIiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYmFzZW5hbWUiLCJ2YWwiLCJqc29uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7cWpCQUFBOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWUEsSzs7QUFDWjs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQTs7O0lBR3FCQyxJO0FBQ25COzs7Ozs7O0FBT0EsZ0JBQWFDLEdBQWIsRUFBa0I7QUFBQTs7QUFDaEIsU0FBS0MsQ0FBTCxHQUFTO0FBQ1BELGNBRE87QUFFUEUsYUFBTztBQUZBLEtBQVQ7QUFJRDs7QUFFRDs7Ozs7Ozs7O3lCQUtNQyxHLEVBQUs7QUFDVCxXQUFLRixDQUFMLENBQU9HLElBQVAsR0FBY0QsR0FBZDtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs0RUFJYUUsSSxFQUFNQyxTOzs7Ozs7O2dDQUNNLDZCQUFxQkQsSUFBckIsQyxFQUFmRSxHLGlCQUFBQSxHLEVBQUtDLEssaUJBQUFBLEs7QUFDUEMscUIsR0FBUUMsS0FBS0MsR0FBTCxFOztBQUNkSixvQkFBSTs7QUFFSjs7O0FBRkEsa0I7Ozt1QkFLcUMsb0JBQUssS0FBS04sQ0FBTCxDQUFPRCxHQUFaLEVBQWlCTSxTQUFqQixDOzs7Ozs7Ozs7OzhCQUs1QjtBQUFBLHlCQUFTO0FBQ1pNLDhCQURZO0FBRVpDLDRCQUFRLGFBQUdDLGdCQUFILENBQW9CRixJQUFwQixFQUEwQixFQUFFRyxVQUFVLE1BQVosRUFBMUI7QUFGSSxtQkFBVDtBQUFBOztBQUtUOztBQUVBOzs7OztBQVpNQyxxQixpQ0FLREMsRztBQVVDYixvQixHQUFPLGVBQUtjLE9BQUwsQ0FBYVosU0FBYixFQUF3Qix1QkFBUSxLQUFLTCxDQUFMLENBQU9HLElBQWYsQ0FBeEIsQzs7dUJBQ1Asc0JBQU9BLEtBQUtlLE9BQUwsQ0FBYWIsU0FBYixFQUF3QixFQUF4QixDQUFQLEVBQW9DQSxTQUFwQyxDOzs7O0FBRU5VLHNCQUFNQyxHQUFOLENBQVUsZ0JBQVE7QUFDaEJMLHVCQUFLQyxNQUFMLENBQVlPLElBQVosQ0FDRSxhQUFHQyxpQkFBSCxDQUFxQmpCLE9BQU8sR0FBUCxHQUFhLGVBQUtrQixRQUFMLENBQWNWLEtBQUtBLElBQW5CLENBQWxDLENBREY7QUFHRDs7QUFFRDtBQU5BLGtCQU9BSSxNQUFNTyxHQUFOOztBQUVBaEIsb0JBQUkseUJBQUosRUFBK0JHLEtBQUtDLEdBQUwsS0FBYUYsS0FBNUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0Y7Ozs7Ozs7NkJBSVU7QUFDUixhQUFPO0FBQ0xMLGNBQU0sS0FBS0gsQ0FBTCxDQUFPRyxJQURSO0FBRUxKLGFBQUssS0FBS0MsQ0FBTCxDQUFPRCxHQUZQO0FBR0xFLGVBQU8sS0FBS0QsQ0FBTCxDQUFPQztBQUhULE9BQVA7QUFLRDs7QUFFRDs7Ozs7Ozs7NkJBS1VzQixJLEVBQU07QUFDZCxXQUFLdkIsQ0FBTCxDQUFPRyxJQUFQLEdBQWNvQixLQUFLcEIsSUFBbkI7QUFDQSxXQUFLSCxDQUFMLENBQU9ELEdBQVAsR0FBYXdCLEtBQUt4QixHQUFsQjtBQUNBLFdBQUtDLENBQUwsQ0FBT0MsS0FBUCxHQUFlc0IsS0FBS3RCLEtBQXBCOztBQUVBLGFBQU8sSUFBUDtBQUNEOzs7Ozs7a0JBMUZrQkgsSSIsImZpbGUiOiJtZ3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy90YXNrcy9tZ3IuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAnLi4vXydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0IG1rZGlycCBmcm9tICcuLi9ta2RpcnAnXG5pbXBvcnQgZ2V0UGF0aCBmcm9tICcuLi9nZXQtcGF0aCdcbmltcG9ydCAqIGFzIGNhY2hlIGZyb20gJy4uL2NhY2hlJ1xuaW1wb3J0IG1vZGlmaWVkIGZyb20gJy4uL21vZGlmaWVkJ1xuaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICcuLi91dGlscy9sb2cnXG5cbi8qKlxuICogSG9wcCBjbGFzcyB0byBtYW5hZ2UgdGFza3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvcHAge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB0YXNrIHdpdGggdGhlIGdsb2IuXG4gICAqIERPRVMgTk9UIFNUQVJUIFRIRSBUQVNLLlxuICAgKiBcbiAgICogQHBhcmFtIHtHbG9ifSBzcmNcbiAgICogQHJldHVybiB7SG9wcH0gbmV3IGhvcHAgb2JqZWN0XG4gICAqL1xuICBjb25zdHJ1Y3RvciAoc3JjKSB7XG4gICAgdGhpcy5kID0ge1xuICAgICAgc3JjLFxuICAgICAgc3RhY2s6IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmQuZGVzdCA9IG91dFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBwaXBlbGluZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gcmVzb2x2ZXMgd2hlbiB0YXNrIGlzIGNvbXBsZXRlXG4gICAqL1xuICBhc3luYyBzdGFydCAobmFtZSwgZGlyZWN0b3J5KSB7XG4gICAgY29uc3QgeyBsb2csIGRlYnVnIH0gPSBjcmVhdGVMb2dnZXIoYGhvcHA6JHtuYW1lfWApXG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgbG9nKCdTdGFydGluZyB0YXNrJylcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZmlsZXMuXG4gICAgICovXG4gICAgY29uc3QgZmlsZXMgPSBfKGF3YWl0IG1vZGlmaWVkKGF3YWl0IGdsb2IodGhpcy5kLnNyYywgZGlyZWN0b3J5KSkpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBzdHJlYW1zLlxuICAgICAgICAgKi9cbiAgICAgICAgLm1hcChmaWxlID0+ICh7XG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBzdHJlYW06IGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pXG4gICAgICAgIH0pKVxuXG4gICAgLy8gVE9ETzogcGlwZSB0byBwbHVnaW4gc3RyZWFtc1xuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB3aXRoIGRlc3RpbmF0aW9uLlxuICAgICAqL1xuICAgIGNvbnN0IGRlc3QgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5LCBnZXRQYXRoKHRoaXMuZC5kZXN0KSlcbiAgICBhd2FpdCBta2RpcnAoZGVzdC5yZXBsYWNlKGRpcmVjdG9yeSwgJycpLCBkaXJlY3RvcnkpXG5cbiAgICBmaWxlcy5tYXAoZmlsZSA9PiB7XG4gICAgICBmaWxlLnN0cmVhbS5waXBlKFxuICAgICAgICBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0ICsgJy8nICsgcGF0aC5iYXNlbmFtZShmaWxlLmZpbGUpKVxuICAgICAgKVxuICAgIH0pXG5cbiAgICAvLyBsYXVuY2hcbiAgICBmaWxlcy52YWwoKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZC5kZXN0LFxuICAgICAgc3JjOiB0aGlzLmQuc3JjLFxuICAgICAgc3RhY2s6IHRoaXMuZC5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZC5kZXN0ID0ganNvbi5kZXN0XG4gICAgdGhpcy5kLnNyYyA9IGpzb24uc3JjXG4gICAgdGhpcy5kLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==