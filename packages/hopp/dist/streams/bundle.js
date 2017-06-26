'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @file src/streams/bundle.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @license MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @copyright 2017 10244872 Canada Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

class Bundle extends _events.EventEmitter {
  constructor(directory, fd) {
    super();

    this.target = _fs2.default.createWriteStream(null, {
      fd,
      autoClose: false
    });

    this.map = {};
    this.offset = 0;
    this.files = [];
    this.sizes = {};
    this.status = {};
    this.buffers = {};
    this.flushIndex = 0;
    this.id = Math.random();
    this.directory = directory;

    this.goal = [];
  }

  add(file, stream) {
    this.files.push(file);
    this.buffers[file] = [];
    this.sizes[file] = 0;
    this.status[file] = false;

    stream.on('data', d => {
      // in case it got stringified
      if (!Buffer.isBuffer(d.body)) {
        d.body = Buffer.from(d.body);
      }

      this.sizes[file] += d.body.length;
      this.buffers[file].push(d.body);
    });

    this.goal.push(new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('end', () => {
        this.status[file] = true;
        this.flush().then(resolve, reject);
      });
    }));
  }

  /**
   * Flush, in order.
   */
  flush() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const file = _this.files[_this.flushIndex];
      const relative = file.replace(_this.directory, '.');

      if (_this.status[file] && !_this.map[relative]) {
        // record sourcemap
        _this.map[relative] = [_this.offset, _this.offset + _this.sizes[file]];
        _this.offset += _this.sizes[file];

        // write to file
        yield new Promise(function (resolve) {
          _this.target.write(Buffer.concat(_this.buffers[file]), resolve);
        });

        // move to next
        _this.flushIndex++;
      }
    })();
  }

  end() {
    var _this2 = this;

    return Promise.all(this.goal).then(_asyncToGenerator(function* () {
      /**
       * Ensure all data has been written.
       */
      while (_this2.flushIndex < _this2.files.length) {
        yield _this2.flush();
      }

      /**
       * Close the bundle.
       */
      _this2.target.close();
    }));
  }
}
exports.default = Bundle;