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
    value: function end() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1bmRsZS5qcyJdLCJuYW1lcyI6WyJCdW5kbGUiLCJmZCIsInRhcmdldCIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiYXV0b0Nsb3NlIiwibWFwIiwib2Zmc2V0IiwiZmlsZXMiLCJzaXplcyIsInN0YXR1cyIsImJ1ZmZlcnMiLCJmbHVzaEluZGV4IiwiaWQiLCJNYXRoIiwicmFuZG9tIiwiZ29hbCIsImZpbGUiLCJzdHJlYW0iLCJwdXNoIiwib24iLCJCdWZmZXIiLCJpc0J1ZmZlciIsImQiLCJib2R5IiwiZnJvbSIsImxlbmd0aCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmx1c2giLCJ0aGVuIiwid3JpdGUiLCJjb25jYXQiLCJhbGwiLCJjbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFNQTs7OztBQUNBOzs7Ozs7Ozs7OytlQVBBOzs7Ozs7SUFTTUEsTTs7O0FBQ0osa0JBQWFDLEVBQWIsRUFBaUI7QUFBQTs7QUFBQTs7QUFHZixVQUFLQyxNQUFMLEdBQWMsYUFBR0MsaUJBQUgsQ0FBcUIsSUFBckIsRUFBMkI7QUFDdkNGLFlBRHVDO0FBRXZDRyxpQkFBVztBQUY0QixLQUEzQixDQUFkOztBQUtBLFVBQUtDLEdBQUwsR0FBVyxFQUFYO0FBQ0EsVUFBS0MsTUFBTCxHQUFjLENBQWQ7QUFDQSxVQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFVBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0EsVUFBS0MsTUFBTCxHQUFjLEVBQWQ7QUFDQSxVQUFLQyxPQUFMLEdBQWUsRUFBZjtBQUNBLFVBQUtDLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxVQUFLQyxFQUFMLEdBQVVDLEtBQUtDLE1BQUwsRUFBVjs7QUFFQSxVQUFLQyxJQUFMLEdBQVksRUFBWjtBQWpCZTtBQWtCaEI7Ozs7d0JBRUlDLEksRUFBTUMsTSxFQUFRO0FBQUE7O0FBQ2pCLFdBQUtWLEtBQUwsQ0FBV1csSUFBWCxDQUFnQkYsSUFBaEI7QUFDQSxXQUFLTixPQUFMLENBQWFNLElBQWIsSUFBcUIsRUFBckI7QUFDQSxXQUFLUixLQUFMLENBQVdRLElBQVgsSUFBbUIsQ0FBbkI7QUFDQSxXQUFLUCxNQUFMLENBQVlPLElBQVosSUFBb0IsS0FBcEI7O0FBRUFDLGFBQU9FLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLGFBQUs7QUFDckI7QUFDQSxZQUFJLENBQUNDLE9BQU9DLFFBQVAsQ0FBZ0JDLEVBQUVDLElBQWxCLENBQUwsRUFBOEI7QUFDNUJELFlBQUVDLElBQUYsR0FBU0gsT0FBT0ksSUFBUCxDQUFZRixFQUFFQyxJQUFkLENBQVQ7QUFDRDs7QUFFRCxlQUFLZixLQUFMLENBQVdRLElBQVgsS0FBb0JNLEVBQUVDLElBQUYsQ0FBT0UsTUFBM0I7QUFDQSxlQUFLZixPQUFMLENBQWFNLElBQWIsRUFBbUJFLElBQW5CLENBQXdCSSxFQUFFQyxJQUExQjtBQUNELE9BUkQ7O0FBVUEsV0FBS1IsSUFBTCxDQUFVRyxJQUFWLENBQWUsSUFBSVEsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUM5Q1gsZUFBT0UsRUFBUCxDQUFVLE9BQVYsRUFBbUJTLE1BQW5CO0FBQ0FYLGVBQU9FLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLFlBQU07QUFDckIsaUJBQUtWLE1BQUwsQ0FBWU8sSUFBWixJQUFvQixJQUFwQjtBQUNBLGlCQUFLYSxLQUFMLEdBQWFDLElBQWIsQ0FBa0JILE9BQWxCLEVBQTJCQyxNQUEzQjtBQUNELFNBSEQ7QUFJRCxPQU5jLENBQWY7QUFPRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0FBSVFaLG9CLEdBQU8sS0FBS1QsS0FBTCxDQUFXLEtBQUtJLFVBQWhCLEM7O3NCQUVULEtBQUtGLE1BQUwsQ0FBWU8sSUFBWixLQUFxQixDQUFDLEtBQUtYLEdBQUwsQ0FBU1csSUFBVCxDOzs7OztBQUN4QjtBQUNBLHFCQUFLWCxHQUFMLENBQVNXLElBQVQsSUFBaUIsQ0FBQyxLQUFLVixNQUFOLEVBQWMsS0FBS0EsTUFBTCxHQUFjLEtBQUtFLEtBQUwsQ0FBV1EsSUFBWCxDQUE1QixDQUFqQjtBQUNBLHFCQUFLVixNQUFMLElBQWUsS0FBS0UsS0FBTCxDQUFXUSxJQUFYLENBQWY7O0FBRUE7O3VCQUNNLElBQUlVLE9BQUosQ0FBWSxtQkFBVztBQUMzQix5QkFBS3hCLE1BQUwsQ0FBWTZCLEtBQVosQ0FBa0JYLE9BQU9ZLE1BQVAsQ0FBYyxPQUFLdEIsT0FBTCxDQUFhTSxJQUFiLENBQWQsQ0FBbEIsRUFBcURXLE9BQXJEO0FBQ0QsaUJBRkssQzs7OztBQUlOO0FBQ0EscUJBQUtoQixVQUFMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBSUc7QUFBQTs7QUFDTCxhQUFPZSxRQUFRTyxHQUFSLENBQVksS0FBS2xCLElBQWpCLEVBQXVCZSxJQUF2QiwyQ0FBNEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUkxQixPQUFLbkIsVUFBTCxHQUFrQixPQUFLSixLQUFMLENBQVdrQixNQUpIO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBS3pCLE9BQUtJLEtBQUwsRUFMeUI7O0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQVFqQzs7O0FBR0EsdUJBQUszQixNQUFMLENBQVlnQyxLQUFaOztBQVhpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE1QixHQUFQO0FBYUQ7Ozs7OztrQkFHWTtBQUFBLFNBQU0sSUFBSWxDLE1BQUosQ0FBV0MsRUFBWCxDQUFOO0FBQUEsQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlIHNyYy9zdHJlYW1zL2J1bmRsZS5qc1xuICogQGxpY2Vuc2UgTUlUXG4gKiBAY29weXJpZ2h0IDIwMTcgMTAyNDQ4NzIgQ2FuYWRhIEluYy5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5cbmNsYXNzIEJ1bmRsZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yIChmZCkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMudGFyZ2V0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0obnVsbCwge1xuICAgICAgZmQsXG4gICAgICBhdXRvQ2xvc2U6IGZhbHNlXG4gICAgfSlcblxuICAgIHRoaXMubWFwID0ge31cbiAgICB0aGlzLm9mZnNldCA9IDBcbiAgICB0aGlzLmZpbGVzID0gW11cbiAgICB0aGlzLnNpemVzID0ge31cbiAgICB0aGlzLnN0YXR1cyA9IHt9XG4gICAgdGhpcy5idWZmZXJzID0ge31cbiAgICB0aGlzLmZsdXNoSW5kZXggPSAwXG4gICAgdGhpcy5pZCA9IE1hdGgucmFuZG9tKClcblxuICAgIHRoaXMuZ29hbCA9IFtdXG4gIH1cblxuICBhZGQgKGZpbGUsIHN0cmVhbSkge1xuICAgIHRoaXMuZmlsZXMucHVzaChmaWxlKVxuICAgIHRoaXMuYnVmZmVyc1tmaWxlXSA9IFtdXG4gICAgdGhpcy5zaXplc1tmaWxlXSA9IDBcbiAgICB0aGlzLnN0YXR1c1tmaWxlXSA9IGZhbHNlXG5cbiAgICBzdHJlYW0ub24oJ2RhdGEnLCBkID0+IHtcbiAgICAgIC8vIGluIGNhc2UgaXQgZ290IHN0cmluZ2lmaWVkXG4gICAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihkLmJvZHkpKSB7XG4gICAgICAgIGQuYm9keSA9IEJ1ZmZlci5mcm9tKGQuYm9keSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zaXplc1tmaWxlXSArPSBkLmJvZHkubGVuZ3RoXG4gICAgICB0aGlzLmJ1ZmZlcnNbZmlsZV0ucHVzaChkLmJvZHkpXG4gICAgfSlcblxuICAgIHRoaXMuZ29hbC5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHN0cmVhbS5vbignZXJyb3InLCByZWplY3QpXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0dXNbZmlsZV0gPSB0cnVlXG4gICAgICAgIHRoaXMuZmx1c2goKS50aGVuKHJlc29sdmUsIHJlamVjdClcbiAgICAgIH0pXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogRmx1c2gsIGluIG9yZGVyLlxuICAgKi9cbiAgYXN5bmMgZmx1c2ggKCkge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLmZpbGVzW3RoaXMuZmx1c2hJbmRleF1cblxuICAgIGlmICh0aGlzLnN0YXR1c1tmaWxlXSAmJiAhdGhpcy5tYXBbZmlsZV0pIHtcbiAgICAgIC8vIHJlY29yZCBzb3VyY2VtYXBcbiAgICAgIHRoaXMubWFwW2ZpbGVdID0gW3RoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIHRoaXMuc2l6ZXNbZmlsZV1dXG4gICAgICB0aGlzLm9mZnNldCArPSB0aGlzLnNpemVzW2ZpbGVdXG5cbiAgICAgIC8vIHdyaXRlIHRvIGZpbGVcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICB0aGlzLnRhcmdldC53cml0ZShCdWZmZXIuY29uY2F0KHRoaXMuYnVmZmVyc1tmaWxlXSksIHJlc29sdmUpXG4gICAgICB9KVxuXG4gICAgICAvLyBtb3ZlIHRvIG5leHRcbiAgICAgIHRoaXMuZmx1c2hJbmRleCArK1xuICAgIH1cbiAgfVxuXG4gIGVuZCAoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMuZ29hbCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAvKipcbiAgICAgICAqIEVuc3VyZSBhbGwgZGF0YSBoYXMgYmVlbiB3cml0dGVuLlxuICAgICAgICovXG4gICAgICB3aGlsZSAodGhpcy5mbHVzaEluZGV4IDwgdGhpcy5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5mbHVzaCgpXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ2xvc2UgdGhlIGJ1bmRsZS5cbiAgICAgICAqL1xuICAgICAgdGhpcy50YXJnZXQuY2xvc2UoKVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZmQgPT4gbmV3IEJ1bmRsZShmZClcbiJdfQ==