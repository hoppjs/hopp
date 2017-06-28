'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

    this.goal.push(new _bluebird2.default((resolve, reject) => {
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

    return (0, _bluebird.coroutine)(function* () {
      const file = _this.files[_this.flushIndex];
      const relative = file.replace(_this.directory, '.');

      if (_this.status[file] && !_this.map[relative]) {
        // record sourcemap
        _this.map[relative] = [_this.offset, _this.offset + _this.sizes[file]];
        _this.offset += _this.sizes[file];

        // write to file
        yield (0, _bluebird.resolve)(new _bluebird2.default(resolve => {
          _this.target.write(Buffer.concat(_this.buffers[file]), resolve);
        }));

        // move to next
        _this.flushIndex++;
      }
    })();
  }

  end() {
    var _this2 = this;

    return (0, _bluebird.all)(this.goal).then((0, _bluebird.coroutine)(function* () {
      /**
       * Ensure all data has been written.
       */
      while (_this2.flushIndex < _this2.files.length) {
        yield (0, _bluebird.resolve)(_this2.flush());
      }

      /**
       * Close the bundle.
       */
      _this2.target.close();
    }));
  }
}
exports.default = Bundle;

//# sourceMappingURL=bundle.js.map