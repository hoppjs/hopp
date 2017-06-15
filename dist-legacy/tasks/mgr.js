'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @file src/tasks/mgr.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @copyright 2017 Karim Alibhai.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _glob = require('../glob');

var _glob2 = _interopRequireDefault(_glob);

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

    this.src = src;
    this.stack = [];
  }

  /**
   * Sets the destination of this pipeline.
   * @param {String} out
   * @return {Hopp} task manager
   */


  _createClass(Hopp, [{
    key: 'dest',
    value: function dest(out) {
      this.dest = out;
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
        var _createLogger, log, debug, start, tree;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _createLogger = (0, _log2.default)('hopp:' + name), log = _createLogger.log, debug = _createLogger.debug;
                start = Date.now();

                log('Starting task'

                /**
                 * Create a tree of the current state.
                 */
                );_context.next = 5;
                return (0, _glob2.default)(this.src, directory

                // console.log(tree)

                );

              case 5:
                tree = _context.sent;
                log('Task ended (took %s ms)', Date.now() - start);

              case 7:
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
        dest: this.dest,
        src: this.src,
        stack: this.stack
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
      this.dest = json.dest;
      this.src = json.src;
      this.stack = json.stack;

      return this;
    }
  }]);

  return Hopp;
}();

exports.default = Hopp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9tZ3IuanMiXSwibmFtZXMiOlsiY2FjaGUiLCJIb3BwIiwic3JjIiwic3RhY2siLCJvdXQiLCJkZXN0IiwibmFtZSIsImRpcmVjdG9yeSIsImxvZyIsImRlYnVnIiwic3RhcnQiLCJEYXRlIiwibm93IiwidHJlZSIsImpzb24iXSwibWFwcGluZ3MiOiI7Ozs7OztxakJBQUE7Ozs7OztBQU1BOzs7O0FBQ0E7O0lBQVlBLEs7O0FBQ1o7Ozs7Ozs7Ozs7OztBQUVBOzs7SUFHcUJDLEk7QUFDbkI7Ozs7Ozs7QUFPQSxnQkFBYUMsR0FBYixFQUFrQjtBQUFBOztBQUNoQixTQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNEOztBQUVEOzs7Ozs7Ozs7eUJBS01DLEcsRUFBSztBQUNULFdBQUtDLElBQUwsR0FBWUQsR0FBWjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs0RUFJYUUsSSxFQUFNQyxTOzs7Ozs7O2dDQUNNLDZCQUFxQkQsSUFBckIsQyxFQUFmRSxHLGlCQUFBQSxHLEVBQUtDLEssaUJBQUFBLEs7QUFDUEMscUIsR0FBUUMsS0FBS0MsR0FBTCxFOztBQUNkSixvQkFBSTs7QUFFSjs7O0FBRkEsa0I7dUJBS21CLG9CQUFLLEtBQUtOLEdBQVYsRUFBZUs7O0FBRWxDOztBQUZtQixpQjs7O0FBQWJNLG9CO0FBSU5MLG9CQUFJLHlCQUFKLEVBQStCRyxLQUFLQyxHQUFMLEtBQWFGLEtBQTVDOzs7Ozs7Ozs7Ozs7Ozs7OztBQUdGOzs7Ozs7OzZCQUlVO0FBQ1IsYUFBTztBQUNMTCxjQUFNLEtBQUtBLElBRE47QUFFTEgsYUFBSyxLQUFLQSxHQUZMO0FBR0xDLGVBQU8sS0FBS0E7QUFIUCxPQUFQO0FBS0Q7O0FBRUQ7Ozs7Ozs7OzZCQUtVVyxJLEVBQU07QUFDZCxXQUFLVCxJQUFMLEdBQVlTLEtBQUtULElBQWpCO0FBQ0EsV0FBS0gsR0FBTCxHQUFXWSxLQUFLWixHQUFoQjtBQUNBLFdBQUtDLEtBQUwsR0FBYVcsS0FBS1gsS0FBbEI7O0FBRUEsYUFBTyxJQUFQO0FBQ0Q7Ozs7OztrQkFqRWtCRixJIiwiZmlsZSI6Im1nci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgc3JjL3Rhc2tzL21nci5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgS2FyaW0gQWxpYmhhaS5cbiAqL1xuXG5pbXBvcnQgZ2xvYiBmcm9tICcuLi9nbG9iJ1xuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSAnLi4vY2FjaGUnXG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJy4uL3V0aWxzL2xvZydcblxuLyoqXG4gKiBIb3BwIGNsYXNzIHRvIG1hbmFnZSB0YXNrcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9wcCB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHRhc2sgd2l0aCB0aGUgZ2xvYi5cbiAgICogRE9FUyBOT1QgU1RBUlQgVEhFIFRBU0suXG4gICAqIFxuICAgKiBAcGFyYW0ge0dsb2J9IHNyY1xuICAgKiBAcmV0dXJuIHtIb3BwfSBuZXcgaG9wcCBvYmplY3RcbiAgICovXG4gIGNvbnN0cnVjdG9yIChzcmMpIHtcbiAgICB0aGlzLnNyYyA9IHNyY1xuICAgIHRoaXMuc3RhY2sgPSBbXVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlc3RpbmF0aW9uIG9mIHRoaXMgcGlwZWxpbmUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvdXRcbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBkZXN0IChvdXQpIHtcbiAgICB0aGlzLmRlc3QgPSBvdXRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgcGlwZWxpbmUuXG4gICAqIEByZXR1cm4ge1Byb21pc2V9IHJlc29sdmVzIHdoZW4gdGFzayBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgc3RhcnQgKG5hbWUsIGRpcmVjdG9yeSkge1xuICAgIGNvbnN0IHsgbG9nLCBkZWJ1ZyB9ID0gY3JlYXRlTG9nZ2VyKGBob3BwOiR7bmFtZX1gKVxuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgIGxvZygnU3RhcnRpbmcgdGFzaycpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSB0cmVlIG9mIHRoZSBjdXJyZW50IHN0YXRlLlxuICAgICAqL1xuICAgIGNvbnN0IHRyZWUgPSBhd2FpdCBnbG9iKHRoaXMuc3JjLCBkaXJlY3RvcnkpXG5cbiAgICAvLyBjb25zb2xlLmxvZyh0cmVlKVxuXG4gICAgbG9nKCdUYXNrIGVuZGVkICh0b29rICVzIG1zKScsIERhdGUubm93KCkgLSBzdGFydClcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0YXNrIG1hbmFnZXIgdG8gSlNPTiBmb3Igc3RvcmFnZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBwcm9wZXIgSlNPTiBvYmplY3RcbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc3Q6IHRoaXMuZGVzdCxcbiAgICAgIHNyYzogdGhpcy5zcmMsXG4gICAgICBzdGFjazogdGhpcy5zdGFja1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBKU09OIG9iamVjdCBpbnRvIGEgbWFuYWdlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IGpzb25cbiAgICogQHJldHVybiB7SG9wcH0gdGFzayBtYW5hZ2VyXG4gICAqL1xuICBmcm9tSlNPTiAoanNvbikge1xuICAgIHRoaXMuZGVzdCA9IGpzb24uZGVzdFxuICAgIHRoaXMuc3JjID0ganNvbi5zcmNcbiAgICB0aGlzLnN0YWNrID0ganNvbi5zdGFja1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSJdfQ==