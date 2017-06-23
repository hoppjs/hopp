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
//# sourceMappingURL=bundle.js.map