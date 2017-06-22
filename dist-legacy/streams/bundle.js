'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file src/streams/bundle.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Bundle = function (_EventEmitter) {
  _inherits(Bundle, _EventEmitter);

  function Bundle(fd) {
    _classCallCheck(this, Bundle);

    var _this = _possibleConstructorReturn(this, (Bundle.__proto__ || Object.getPrototypeOf(Bundle)).call(this));

    _this.target = _fs2.default.createWriteStream(null, {
      fd: fd,
      autoClose: false
    });

    _this.map = {};
    _this.offset = 0;
    _this.files = [];
    _this.sizes = {};
    _this.status = {};
    _this.buffers = {};
    _this.flushIndex = 0;
    _this.id = Math.random();

    _this.goal = [];
    return _this;
  }

  _createClass(Bundle, [{
    key: 'add',
    value: function add(file, stream) {
      var _this2 = this;

      this.files.push(file);
      this.buffers[file] = [];
      this.sizes[file] = 0;
      this.status[file] = false;

      stream.on('data', function (d) {
        // in case it got stringified
        if (!Buffer.isBuffer(d.body)) {
          d.body = Buffer.from(d.body);
        }

        _this2.sizes[file] += d.body.length;
        _this2.buffers[file].push(d.body);
      });

      this.goal.push(new Promise(function (resolve, reject) {
        stream.on('error', reject);
        stream.on('end', function () {
          _this2.status[file] = true;
          _this2.flush().then(resolve, reject);
        });
      }));
    }

    /**
     * Flush, in order.
     */

  }, {
    key: 'flush',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var _this3 = this;

        var file;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                file = this.files[this.flushIndex];

                if (!(this.status[file] && !this.map[file])) {
                  _context.next = 7;
                  break;
                }

                // record sourcemap
                this.map[file] = [this.offset, this.offset + this.sizes[file]];
                this.offset += this.sizes[file];

                // write to file
                _context.next = 6;
                return new Promise(function (resolve) {
                  _this3.target.write(Buffer.concat(_this3.buffers[file]), resolve);
                });

              case 6:

                // move to next
                this.flushIndex++;

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function flush() {
        return _ref.apply(this, arguments);
      }

      return flush;
    }()
  }, {
    key: 'end',
    value: function end(f) {
      var _this4 = this;

      return Promise.all(this.goal).then(_asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(_this4.flushIndex < _this4.files.length)) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 3;
                return _this4.flush();

              case 3:
                _context2.next = 0;
                break;

              case 5:

                /**
                 * Close the bundle.
                 */
                _this4.target.close();

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this4);
      })));
    }
  }]);

  return Bundle;
}(_events.EventEmitter);

exports.default = function (fd) {
  return new Bundle(fd);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1bmRsZS5qcyJdLCJuYW1lcyI6WyJCdW5kbGUiLCJmZCIsInRhcmdldCIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYXV0b0Nsb3NlIiwibWFwIiwib2Zmc2V0IiwiZmlsZXMiLCJzaXplcyIsInN0YXR1cyIsImJ1ZmZlcnMiLCJmbHVzaEluZGV4IiwiaWQiLCJNYXRoIiwicmFuZG9tIiwiZ29hbCIsImZpbGUiLCJzdHJlYW0iLCJwdXNoIiwib24iLCJCdWZmZXIiLCJpc0J1ZmZlciIsImQiLCJib2R5IiwiZnJvbSIsImxlbmd0aCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmx1c2giLCJ0aGVuIiwid3JpdGUiLCJjb25jYXQiLCJmIiwiYWxsIiwiY2xvc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBTUE7Ozs7QUFDQTs7Ozs7Ozs7OzsrZUFQQTs7Ozs7O0lBU01BLE07OztBQUNKLGtCQUFhQyxFQUFiLEVBQWlCO0FBQUE7O0FBQUE7O0FBR2YsVUFBS0MsTUFBTCxHQUFjLGFBQUdDLGlCQUFILENBQXFCLElBQXJCLEVBQTJCO0FBQ3ZDRixZQUR1QztBQUV2Q0csaUJBQVc7QUFGNEIsS0FBM0IsQ0FBZDs7QUFLQSxVQUFLQyxHQUFMLEdBQVcsRUFBWDtBQUNBLFVBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsVUFBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxVQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFVBQUtDLE1BQUwsR0FBYyxFQUFkO0FBQ0EsVUFBS0MsT0FBTCxHQUFlLEVBQWY7QUFDQSxVQUFLQyxVQUFMLEdBQWtCLENBQWxCO0FBQ0EsVUFBS0MsRUFBTCxHQUFVQyxLQUFLQyxNQUFMLEVBQVY7O0FBRUEsVUFBS0MsSUFBTCxHQUFZLEVBQVo7QUFqQmU7QUFrQmhCOzs7O3dCQUVJQyxJLEVBQU1DLE0sRUFBUTtBQUFBOztBQUNqQixXQUFLVixLQUFMLENBQVdXLElBQVgsQ0FBZ0JGLElBQWhCO0FBQ0EsV0FBS04sT0FBTCxDQUFhTSxJQUFiLElBQXFCLEVBQXJCO0FBQ0EsV0FBS1IsS0FBTCxDQUFXUSxJQUFYLElBQW1CLENBQW5CO0FBQ0EsV0FBS1AsTUFBTCxDQUFZTyxJQUFaLElBQW9CLEtBQXBCOztBQUVBQyxhQUFPRSxFQUFQLENBQVUsTUFBVixFQUFrQixhQUFLO0FBQ3JCO0FBQ0EsWUFBSSxDQUFDQyxPQUFPQyxRQUFQLENBQWdCQyxFQUFFQyxJQUFsQixDQUFMLEVBQThCO0FBQzVCRCxZQUFFQyxJQUFGLEdBQVNILE9BQU9JLElBQVAsQ0FBWUYsRUFBRUMsSUFBZCxDQUFUO0FBQ0Q7O0FBRUQsZUFBS2YsS0FBTCxDQUFXUSxJQUFYLEtBQW9CTSxFQUFFQyxJQUFGLENBQU9FLE1BQTNCO0FBQ0EsZUFBS2YsT0FBTCxDQUFhTSxJQUFiLEVBQW1CRSxJQUFuQixDQUF3QkksRUFBRUMsSUFBMUI7QUFDRCxPQVJEOztBQVVBLFdBQUtSLElBQUwsQ0FBVUcsSUFBVixDQUFlLElBQUlRLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDOUNYLGVBQU9FLEVBQVAsQ0FBVSxPQUFWLEVBQW1CUyxNQUFuQjtBQUNBWCxlQUFPRSxFQUFQLENBQVUsS0FBVixFQUFpQixZQUFNO0FBQ3JCLGlCQUFLVixNQUFMLENBQVlPLElBQVosSUFBb0IsSUFBcEI7QUFDQSxpQkFBS2EsS0FBTCxHQUFhQyxJQUFiLENBQWtCSCxPQUFsQixFQUEyQkMsTUFBM0I7QUFDRCxTQUhEO0FBSUQsT0FOYyxDQUFmO0FBT0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7OztBQUlRWixvQixHQUFPLEtBQUtULEtBQUwsQ0FBVyxLQUFLSSxVQUFoQixDOztzQkFFVCxLQUFLRixNQUFMLENBQVlPLElBQVosS0FBcUIsQ0FBQyxLQUFLWCxHQUFMLENBQVNXLElBQVQsQzs7Ozs7QUFDeEI7QUFDQSxxQkFBS1gsR0FBTCxDQUFTVyxJQUFULElBQWlCLENBQUMsS0FBS1YsTUFBTixFQUFjLEtBQUtBLE1BQUwsR0FBYyxLQUFLRSxLQUFMLENBQVdRLElBQVgsQ0FBNUIsQ0FBakI7QUFDQSxxQkFBS1YsTUFBTCxJQUFlLEtBQUtFLEtBQUwsQ0FBV1EsSUFBWCxDQUFmOztBQUVBOzt1QkFDTSxJQUFJVSxPQUFKLENBQVksbUJBQVc7QUFDM0IseUJBQUt4QixNQUFMLENBQVk2QixLQUFaLENBQWtCWCxPQUFPWSxNQUFQLENBQWMsT0FBS3RCLE9BQUwsQ0FBYU0sSUFBYixDQUFkLENBQWxCLEVBQXFEVyxPQUFyRDtBQUNELGlCQUZLLEM7Ozs7QUFJTjtBQUNBLHFCQUFLaEIsVUFBTDs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUlDc0IsQyxFQUFHO0FBQUE7O0FBQ04sYUFBT1AsUUFBUVEsR0FBUixDQUFZLEtBQUtuQixJQUFqQixFQUF1QmUsSUFBdkIsMkNBQTRCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFJMUIsT0FBS25CLFVBQUwsR0FBa0IsT0FBS0osS0FBTCxDQUFXa0IsTUFKSDtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVCQUt6QixPQUFLSSxLQUFMLEVBTHlCOztBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFRakM7OztBQUdBLHVCQUFLM0IsTUFBTCxDQUFZaUMsS0FBWjs7QUFYaUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBNUIsR0FBUDtBQWFEOzs7Ozs7a0JBR1k7QUFBQSxTQUFNLElBQUluQyxNQUFKLENBQVdDLEVBQVgsQ0FBTjtBQUFBLEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvc3RyZWFtcy9idW5kbGUuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuXG5jbGFzcyBCdW5kbGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoZmQpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLnRhcmdldCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG51bGwsIHtcbiAgICAgIGZkLFxuICAgICAgYXV0b0Nsb3NlOiBmYWxzZVxuICAgIH0pXG5cbiAgICB0aGlzLm1hcCA9IHt9XG4gICAgdGhpcy5vZmZzZXQgPSAwXG4gICAgdGhpcy5maWxlcyA9IFtdXG4gICAgdGhpcy5zaXplcyA9IHt9XG4gICAgdGhpcy5zdGF0dXMgPSB7fVxuICAgIHRoaXMuYnVmZmVycyA9IHt9XG4gICAgdGhpcy5mbHVzaEluZGV4ID0gMFxuICAgIHRoaXMuaWQgPSBNYXRoLnJhbmRvbSgpXG5cbiAgICB0aGlzLmdvYWwgPSBbXVxuICB9XG5cbiAgYWRkIChmaWxlLCBzdHJlYW0pIHtcbiAgICB0aGlzLmZpbGVzLnB1c2goZmlsZSlcbiAgICB0aGlzLmJ1ZmZlcnNbZmlsZV0gPSBbXVxuICAgIHRoaXMuc2l6ZXNbZmlsZV0gPSAwXG4gICAgdGhpcy5zdGF0dXNbZmlsZV0gPSBmYWxzZVxuXG4gICAgc3RyZWFtLm9uKCdkYXRhJywgZCA9PiB7XG4gICAgICAvLyBpbiBjYXNlIGl0IGdvdCBzdHJpbmdpZmllZFxuICAgICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoZC5ib2R5KSkge1xuICAgICAgICBkLmJvZHkgPSBCdWZmZXIuZnJvbShkLmJvZHkpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2l6ZXNbZmlsZV0gKz0gZC5ib2R5Lmxlbmd0aFxuICAgICAgdGhpcy5idWZmZXJzW2ZpbGVdLnB1c2goZC5ib2R5KVxuICAgIH0pXG5cbiAgICB0aGlzLmdvYWwucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdHVzW2ZpbGVdID0gdHJ1ZVxuICAgICAgICB0aGlzLmZsdXNoKCkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoLCBpbiBvcmRlci5cbiAgICovXG4gIGFzeW5jIGZsdXNoICgpIHtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlc1t0aGlzLmZsdXNoSW5kZXhdXG5cbiAgICBpZiAodGhpcy5zdGF0dXNbZmlsZV0gJiYgIXRoaXMubWFwW2ZpbGVdKSB7XG4gICAgICAvLyByZWNvcmQgc291cmNlbWFwXG4gICAgICB0aGlzLm1hcFtmaWxlXSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKyB0aGlzLnNpemVzW2ZpbGVdXVxuICAgICAgdGhpcy5vZmZzZXQgKz0gdGhpcy5zaXplc1tmaWxlXVxuXG4gICAgICAvLyB3cml0ZSB0byBmaWxlXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgdGhpcy50YXJnZXQud3JpdGUoQnVmZmVyLmNvbmNhdCh0aGlzLmJ1ZmZlcnNbZmlsZV0pLCByZXNvbHZlKVxuICAgICAgfSlcblxuICAgICAgLy8gbW92ZSB0byBuZXh0XG4gICAgICB0aGlzLmZsdXNoSW5kZXggKytcbiAgICB9XG4gIH1cblxuICBlbmQgKGYpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGhpcy5nb2FsKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGFsbCBkYXRhIGhhcyBiZWVuIHdyaXR0ZW4uXG4gICAgICAgKi9cbiAgICAgIHdoaWxlICh0aGlzLmZsdXNoSW5kZXggPCB0aGlzLmZpbGVzLmxlbmd0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLmZsdXNoKClcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDbG9zZSB0aGUgYnVuZGxlLlxuICAgICAgICovXG4gICAgICB0aGlzLnRhcmdldC5jbG9zZSgpXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmZCA9PiBuZXcgQnVuZGxlKGZkKVxuIl19