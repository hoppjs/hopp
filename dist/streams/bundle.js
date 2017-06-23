'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
  constructor(fd) {
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
  async flush() {
    const file = this.files[this.flushIndex];

    if (this.status[file] && !this.map[file]) {
      // record sourcemap
      this.map[file] = [this.offset, this.offset + this.sizes[file]];
      this.offset += this.sizes[file];

      // write to file
      await new Promise(resolve => {
        this.target.write(Buffer.concat(this.buffers[file]), resolve);
      });

      // move to next
      this.flushIndex++;
    }
  }

  end() {
    return Promise.all(this.goal).then(async () => {
      /**
       * Ensure all data has been written.
       */
      while (this.flushIndex < this.files.length) {
        await this.flush();
      }

      /**
       * Close the bundle.
       */
      this.target.close();
    });
  }
}

exports.default = fd => new Bundle(fd);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1bmRsZS5qcyJdLCJuYW1lcyI6WyJCdW5kbGUiLCJjb25zdHJ1Y3RvciIsImZkIiwidGFyZ2V0IiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJhdXRvQ2xvc2UiLCJtYXAiLCJvZmZzZXQiLCJmaWxlcyIsInNpemVzIiwic3RhdHVzIiwiYnVmZmVycyIsImZsdXNoSW5kZXgiLCJpZCIsIk1hdGgiLCJyYW5kb20iLCJnb2FsIiwiYWRkIiwiZmlsZSIsInN0cmVhbSIsInB1c2giLCJvbiIsImQiLCJCdWZmZXIiLCJpc0J1ZmZlciIsImJvZHkiLCJmcm9tIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmbHVzaCIsInRoZW4iLCJ3cml0ZSIsImNvbmNhdCIsImVuZCIsImFsbCIsImNsb3NlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7OztBQUNBOzs7O0FBUEE7Ozs7OztBQVNBLE1BQU1BLE1BQU4sOEJBQWtDO0FBQ2hDQyxjQUFhQyxFQUFiLEVBQWlCO0FBQ2Y7O0FBRUEsU0FBS0MsTUFBTCxHQUFjLGFBQUdDLGlCQUFILENBQXFCLElBQXJCLEVBQTJCO0FBQ3ZDRixRQUR1QztBQUV2Q0csaUJBQVc7QUFGNEIsS0FBM0IsQ0FBZDs7QUFLQSxTQUFLQyxHQUFMLEdBQVcsRUFBWDtBQUNBLFNBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxFQUFkO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLEVBQWY7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLENBQWxCO0FBQ0EsU0FBS0MsRUFBTCxHQUFVQyxLQUFLQyxNQUFMLEVBQVY7O0FBRUEsU0FBS0MsSUFBTCxHQUFZLEVBQVo7QUFDRDs7QUFFREMsTUFBS0MsSUFBTCxFQUFXQyxNQUFYLEVBQW1CO0FBQ2pCLFNBQUtYLEtBQUwsQ0FBV1ksSUFBWCxDQUFnQkYsSUFBaEI7QUFDQSxTQUFLUCxPQUFMLENBQWFPLElBQWIsSUFBcUIsRUFBckI7QUFDQSxTQUFLVCxLQUFMLENBQVdTLElBQVgsSUFBbUIsQ0FBbkI7QUFDQSxTQUFLUixNQUFMLENBQVlRLElBQVosSUFBb0IsS0FBcEI7O0FBRUFDLFdBQU9FLEVBQVAsQ0FBVSxNQUFWLEVBQWtCQyxLQUFLO0FBQ3JCO0FBQ0EsVUFBSSxDQUFDQyxPQUFPQyxRQUFQLENBQWdCRixFQUFFRyxJQUFsQixDQUFMLEVBQThCO0FBQzVCSCxVQUFFRyxJQUFGLEdBQVNGLE9BQU9HLElBQVAsQ0FBWUosRUFBRUcsSUFBZCxDQUFUO0FBQ0Q7O0FBRUQsV0FBS2hCLEtBQUwsQ0FBV1MsSUFBWCxLQUFvQkksRUFBRUcsSUFBRixDQUFPRSxNQUEzQjtBQUNBLFdBQUtoQixPQUFMLENBQWFPLElBQWIsRUFBbUJFLElBQW5CLENBQXdCRSxFQUFFRyxJQUExQjtBQUNELEtBUkQ7O0FBVUEsU0FBS1QsSUFBTCxDQUFVSSxJQUFWLENBQWUsSUFBSVEsT0FBSixDQUFZLENBQUNDLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUM5Q1gsYUFBT0UsRUFBUCxDQUFVLE9BQVYsRUFBbUJTLE1BQW5CO0FBQ0FYLGFBQU9FLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLE1BQU07QUFDckIsYUFBS1gsTUFBTCxDQUFZUSxJQUFaLElBQW9CLElBQXBCO0FBQ0EsYUFBS2EsS0FBTCxHQUFhQyxJQUFiLENBQWtCSCxPQUFsQixFQUEyQkMsTUFBM0I7QUFDRCxPQUhEO0FBSUQsS0FOYyxDQUFmO0FBT0Q7O0FBRUQ7OztBQUdBLFFBQU1DLEtBQU4sR0FBZTtBQUNiLFVBQU1iLE9BQU8sS0FBS1YsS0FBTCxDQUFXLEtBQUtJLFVBQWhCLENBQWI7O0FBRUEsUUFBSSxLQUFLRixNQUFMLENBQVlRLElBQVosS0FBcUIsQ0FBQyxLQUFLWixHQUFMLENBQVNZLElBQVQsQ0FBMUIsRUFBMEM7QUFDeEM7QUFDQSxXQUFLWixHQUFMLENBQVNZLElBQVQsSUFBaUIsQ0FBQyxLQUFLWCxNQUFOLEVBQWMsS0FBS0EsTUFBTCxHQUFjLEtBQUtFLEtBQUwsQ0FBV1MsSUFBWCxDQUE1QixDQUFqQjtBQUNBLFdBQUtYLE1BQUwsSUFBZSxLQUFLRSxLQUFMLENBQVdTLElBQVgsQ0FBZjs7QUFFQTtBQUNBLFlBQU0sSUFBSVUsT0FBSixDQUFZQyxXQUFXO0FBQzNCLGFBQUsxQixNQUFMLENBQVk4QixLQUFaLENBQWtCVixPQUFPVyxNQUFQLENBQWMsS0FBS3ZCLE9BQUwsQ0FBYU8sSUFBYixDQUFkLENBQWxCLEVBQXFEVyxPQUFyRDtBQUNELE9BRkssQ0FBTjs7QUFJQTtBQUNBLFdBQUtqQixVQUFMO0FBQ0Q7QUFDRjs7QUFFRHVCLFFBQU87QUFDTCxXQUFPUCxRQUFRUSxHQUFSLENBQVksS0FBS3BCLElBQWpCLEVBQXVCZ0IsSUFBdkIsQ0FBNEIsWUFBWTtBQUM3Qzs7O0FBR0EsYUFBTyxLQUFLcEIsVUFBTCxHQUFrQixLQUFLSixLQUFMLENBQVdtQixNQUFwQyxFQUE0QztBQUMxQyxjQUFNLEtBQUtJLEtBQUwsRUFBTjtBQUNEOztBQUVEOzs7QUFHQSxXQUFLNUIsTUFBTCxDQUFZa0MsS0FBWjtBQUNELEtBWk0sQ0FBUDtBQWFEO0FBakYrQjs7a0JBb0ZuQm5DLE1BQU0sSUFBSUYsTUFBSixDQUFXRSxFQUFYLEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvc3RyZWFtcy9idW5kbGUuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuXG5jbGFzcyBCdW5kbGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoZmQpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLnRhcmdldCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG51bGwsIHtcbiAgICAgIGZkLFxuICAgICAgYXV0b0Nsb3NlOiBmYWxzZVxuICAgIH0pXG5cbiAgICB0aGlzLm1hcCA9IHt9XG4gICAgdGhpcy5vZmZzZXQgPSAwXG4gICAgdGhpcy5maWxlcyA9IFtdXG4gICAgdGhpcy5zaXplcyA9IHt9XG4gICAgdGhpcy5zdGF0dXMgPSB7fVxuICAgIHRoaXMuYnVmZmVycyA9IHt9XG4gICAgdGhpcy5mbHVzaEluZGV4ID0gMFxuICAgIHRoaXMuaWQgPSBNYXRoLnJhbmRvbSgpXG5cbiAgICB0aGlzLmdvYWwgPSBbXVxuICB9XG5cbiAgYWRkIChmaWxlLCBzdHJlYW0pIHtcbiAgICB0aGlzLmZpbGVzLnB1c2goZmlsZSlcbiAgICB0aGlzLmJ1ZmZlcnNbZmlsZV0gPSBbXVxuICAgIHRoaXMuc2l6ZXNbZmlsZV0gPSAwXG4gICAgdGhpcy5zdGF0dXNbZmlsZV0gPSBmYWxzZVxuXG4gICAgc3RyZWFtLm9uKCdkYXRhJywgZCA9PiB7XG4gICAgICAvLyBpbiBjYXNlIGl0IGdvdCBzdHJpbmdpZmllZFxuICAgICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoZC5ib2R5KSkge1xuICAgICAgICBkLmJvZHkgPSBCdWZmZXIuZnJvbShkLmJvZHkpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2l6ZXNbZmlsZV0gKz0gZC5ib2R5Lmxlbmd0aFxuICAgICAgdGhpcy5idWZmZXJzW2ZpbGVdLnB1c2goZC5ib2R5KVxuICAgIH0pXG5cbiAgICB0aGlzLmdvYWwucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdHVzW2ZpbGVdID0gdHJ1ZVxuICAgICAgICB0aGlzLmZsdXNoKCkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoLCBpbiBvcmRlci5cbiAgICovXG4gIGFzeW5jIGZsdXNoICgpIHtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlc1t0aGlzLmZsdXNoSW5kZXhdXG5cbiAgICBpZiAodGhpcy5zdGF0dXNbZmlsZV0gJiYgIXRoaXMubWFwW2ZpbGVdKSB7XG4gICAgICAvLyByZWNvcmQgc291cmNlbWFwXG4gICAgICB0aGlzLm1hcFtmaWxlXSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKyB0aGlzLnNpemVzW2ZpbGVdXVxuICAgICAgdGhpcy5vZmZzZXQgKz0gdGhpcy5zaXplc1tmaWxlXVxuXG4gICAgICAvLyB3cml0ZSB0byBmaWxlXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgdGhpcy50YXJnZXQud3JpdGUoQnVmZmVyLmNvbmNhdCh0aGlzLmJ1ZmZlcnNbZmlsZV0pLCByZXNvbHZlKVxuICAgICAgfSlcblxuICAgICAgLy8gbW92ZSB0byBuZXh0XG4gICAgICB0aGlzLmZsdXNoSW5kZXggKytcbiAgICB9XG4gIH1cblxuICBlbmQgKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmdvYWwpLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBFbnN1cmUgYWxsIGRhdGEgaGFzIGJlZW4gd3JpdHRlbi5cbiAgICAgICAqL1xuICAgICAgd2hpbGUgKHRoaXMuZmx1c2hJbmRleCA8IHRoaXMuZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZmx1c2goKVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENsb3NlIHRoZSBidW5kbGUuXG4gICAgICAgKi9cbiAgICAgIHRoaXMudGFyZ2V0LmNsb3NlKClcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZkID0+IG5ldyBCdW5kbGUoZmQpXG4iXX0=