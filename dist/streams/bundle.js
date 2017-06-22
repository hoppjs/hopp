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

  end(f) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL2J1bmRsZS5qcyJdLCJuYW1lcyI6WyJCdW5kbGUiLCJjb25zdHJ1Y3RvciIsImZkIiwidGFyZ2V0IiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJhdXRvQ2xvc2UiLCJtYXAiLCJvZmZzZXQiLCJmaWxlcyIsInNpemVzIiwic3RhdHVzIiwiYnVmZmVycyIsImZsdXNoSW5kZXgiLCJpZCIsIk1hdGgiLCJyYW5kb20iLCJnb2FsIiwiYWRkIiwiZmlsZSIsInN0cmVhbSIsInB1c2giLCJvbiIsImQiLCJCdWZmZXIiLCJpc0J1ZmZlciIsImJvZHkiLCJmcm9tIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmbHVzaCIsInRoZW4iLCJ3cml0ZSIsImNvbmNhdCIsImVuZCIsImYiLCJhbGwiLCJjbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTUE7Ozs7QUFDQTs7OztBQVBBOzs7Ozs7QUFTQSxNQUFNQSxNQUFOLDhCQUFrQztBQUNoQ0MsY0FBYUMsRUFBYixFQUFpQjtBQUNmOztBQUVBLFNBQUtDLE1BQUwsR0FBYyxhQUFHQyxpQkFBSCxDQUFxQixJQUFyQixFQUEyQjtBQUN2Q0YsUUFEdUM7QUFFdkNHLGlCQUFXO0FBRjRCLEtBQTNCLENBQWQ7O0FBS0EsU0FBS0MsR0FBTCxHQUFXLEVBQVg7QUFDQSxTQUFLQyxNQUFMLEdBQWMsQ0FBZDtBQUNBLFNBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxTQUFLQyxNQUFMLEdBQWMsRUFBZDtBQUNBLFNBQUtDLE9BQUwsR0FBZSxFQUFmO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixDQUFsQjtBQUNBLFNBQUtDLEVBQUwsR0FBVUMsS0FBS0MsTUFBTCxFQUFWOztBQUVBLFNBQUtDLElBQUwsR0FBWSxFQUFaO0FBQ0Q7O0FBRURDLE1BQUtDLElBQUwsRUFBV0MsTUFBWCxFQUFtQjtBQUNqQixTQUFLWCxLQUFMLENBQVdZLElBQVgsQ0FBZ0JGLElBQWhCO0FBQ0EsU0FBS1AsT0FBTCxDQUFhTyxJQUFiLElBQXFCLEVBQXJCO0FBQ0EsU0FBS1QsS0FBTCxDQUFXUyxJQUFYLElBQW1CLENBQW5CO0FBQ0EsU0FBS1IsTUFBTCxDQUFZUSxJQUFaLElBQW9CLEtBQXBCOztBQUVBQyxXQUFPRSxFQUFQLENBQVUsTUFBVixFQUFrQkMsS0FBSztBQUNyQjtBQUNBLFVBQUksQ0FBQ0MsT0FBT0MsUUFBUCxDQUFnQkYsRUFBRUcsSUFBbEIsQ0FBTCxFQUE4QjtBQUM1QkgsVUFBRUcsSUFBRixHQUFTRixPQUFPRyxJQUFQLENBQVlKLEVBQUVHLElBQWQsQ0FBVDtBQUNEOztBQUVELFdBQUtoQixLQUFMLENBQVdTLElBQVgsS0FBb0JJLEVBQUVHLElBQUYsQ0FBT0UsTUFBM0I7QUFDQSxXQUFLaEIsT0FBTCxDQUFhTyxJQUFiLEVBQW1CRSxJQUFuQixDQUF3QkUsRUFBRUcsSUFBMUI7QUFDRCxLQVJEOztBQVVBLFNBQUtULElBQUwsQ0FBVUksSUFBVixDQUFlLElBQUlRLE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDOUNYLGFBQU9FLEVBQVAsQ0FBVSxPQUFWLEVBQW1CUyxNQUFuQjtBQUNBWCxhQUFPRSxFQUFQLENBQVUsS0FBVixFQUFpQixNQUFNO0FBQ3JCLGFBQUtYLE1BQUwsQ0FBWVEsSUFBWixJQUFvQixJQUFwQjtBQUNBLGFBQUthLEtBQUwsR0FBYUMsSUFBYixDQUFrQkgsT0FBbEIsRUFBMkJDLE1BQTNCO0FBQ0QsT0FIRDtBQUlELEtBTmMsQ0FBZjtBQU9EOztBQUVEOzs7QUFHQSxRQUFNQyxLQUFOLEdBQWU7QUFDYixVQUFNYixPQUFPLEtBQUtWLEtBQUwsQ0FBVyxLQUFLSSxVQUFoQixDQUFiOztBQUVBLFFBQUksS0FBS0YsTUFBTCxDQUFZUSxJQUFaLEtBQXFCLENBQUMsS0FBS1osR0FBTCxDQUFTWSxJQUFULENBQTFCLEVBQTBDO0FBQ3hDO0FBQ0EsV0FBS1osR0FBTCxDQUFTWSxJQUFULElBQWlCLENBQUMsS0FBS1gsTUFBTixFQUFjLEtBQUtBLE1BQUwsR0FBYyxLQUFLRSxLQUFMLENBQVdTLElBQVgsQ0FBNUIsQ0FBakI7QUFDQSxXQUFLWCxNQUFMLElBQWUsS0FBS0UsS0FBTCxDQUFXUyxJQUFYLENBQWY7O0FBRUE7QUFDQSxZQUFNLElBQUlVLE9BQUosQ0FBWUMsV0FBVztBQUMzQixhQUFLMUIsTUFBTCxDQUFZOEIsS0FBWixDQUFrQlYsT0FBT1csTUFBUCxDQUFjLEtBQUt2QixPQUFMLENBQWFPLElBQWIsQ0FBZCxDQUFsQixFQUFxRFcsT0FBckQ7QUFDRCxPQUZLLENBQU47O0FBSUE7QUFDQSxXQUFLakIsVUFBTDtBQUNEO0FBQ0Y7O0FBRUR1QixNQUFLQyxDQUFMLEVBQVE7QUFDTixXQUFPUixRQUFRUyxHQUFSLENBQVksS0FBS3JCLElBQWpCLEVBQXVCZ0IsSUFBdkIsQ0FBNEIsWUFBWTtBQUM3Qzs7O0FBR0EsYUFBTyxLQUFLcEIsVUFBTCxHQUFrQixLQUFLSixLQUFMLENBQVdtQixNQUFwQyxFQUE0QztBQUMxQyxjQUFNLEtBQUtJLEtBQUwsRUFBTjtBQUNEOztBQUVEOzs7QUFHQSxXQUFLNUIsTUFBTCxDQUFZbUMsS0FBWjtBQUNELEtBWk0sQ0FBUDtBQWFEO0FBakYrQjs7a0JBb0ZuQnBDLE1BQU0sSUFBSUYsTUFBSixDQUFXRSxFQUFYLEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvc3RyZWFtcy9idW5kbGUuanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IDEwMjQ0ODcyIENhbmFkYSBJbmMuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuXG5jbGFzcyBCdW5kbGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoZmQpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLnRhcmdldCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKG51bGwsIHtcbiAgICAgIGZkLFxuICAgICAgYXV0b0Nsb3NlOiBmYWxzZVxuICAgIH0pXG5cbiAgICB0aGlzLm1hcCA9IHt9XG4gICAgdGhpcy5vZmZzZXQgPSAwXG4gICAgdGhpcy5maWxlcyA9IFtdXG4gICAgdGhpcy5zaXplcyA9IHt9XG4gICAgdGhpcy5zdGF0dXMgPSB7fVxuICAgIHRoaXMuYnVmZmVycyA9IHt9XG4gICAgdGhpcy5mbHVzaEluZGV4ID0gMFxuICAgIHRoaXMuaWQgPSBNYXRoLnJhbmRvbSgpXG5cbiAgICB0aGlzLmdvYWwgPSBbXVxuICB9XG5cbiAgYWRkIChmaWxlLCBzdHJlYW0pIHtcbiAgICB0aGlzLmZpbGVzLnB1c2goZmlsZSlcbiAgICB0aGlzLmJ1ZmZlcnNbZmlsZV0gPSBbXVxuICAgIHRoaXMuc2l6ZXNbZmlsZV0gPSAwXG4gICAgdGhpcy5zdGF0dXNbZmlsZV0gPSBmYWxzZVxuXG4gICAgc3RyZWFtLm9uKCdkYXRhJywgZCA9PiB7XG4gICAgICAvLyBpbiBjYXNlIGl0IGdvdCBzdHJpbmdpZmllZFxuICAgICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoZC5ib2R5KSkge1xuICAgICAgICBkLmJvZHkgPSBCdWZmZXIuZnJvbShkLmJvZHkpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2l6ZXNbZmlsZV0gKz0gZC5ib2R5Lmxlbmd0aFxuICAgICAgdGhpcy5idWZmZXJzW2ZpbGVdLnB1c2goZC5ib2R5KVxuICAgIH0pXG5cbiAgICB0aGlzLmdvYWwucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzdHJlYW0ub24oJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgc3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdHVzW2ZpbGVdID0gdHJ1ZVxuICAgICAgICB0aGlzLmZsdXNoKCkudGhlbihyZXNvbHZlLCByZWplY3QpXG4gICAgICB9KVxuICAgIH0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEZsdXNoLCBpbiBvcmRlci5cbiAgICovXG4gIGFzeW5jIGZsdXNoICgpIHtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlc1t0aGlzLmZsdXNoSW5kZXhdXG5cbiAgICBpZiAodGhpcy5zdGF0dXNbZmlsZV0gJiYgIXRoaXMubWFwW2ZpbGVdKSB7XG4gICAgICAvLyByZWNvcmQgc291cmNlbWFwXG4gICAgICB0aGlzLm1hcFtmaWxlXSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKyB0aGlzLnNpemVzW2ZpbGVdXVxuICAgICAgdGhpcy5vZmZzZXQgKz0gdGhpcy5zaXplc1tmaWxlXVxuXG4gICAgICAvLyB3cml0ZSB0byBmaWxlXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgdGhpcy50YXJnZXQud3JpdGUoQnVmZmVyLmNvbmNhdCh0aGlzLmJ1ZmZlcnNbZmlsZV0pLCByZXNvbHZlKVxuICAgICAgfSlcblxuICAgICAgLy8gbW92ZSB0byBuZXh0XG4gICAgICB0aGlzLmZsdXNoSW5kZXggKytcbiAgICB9XG4gIH1cblxuICBlbmQgKGYpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGhpcy5nb2FsKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRW5zdXJlIGFsbCBkYXRhIGhhcyBiZWVuIHdyaXR0ZW4uXG4gICAgICAgKi9cbiAgICAgIHdoaWxlICh0aGlzLmZsdXNoSW5kZXggPCB0aGlzLmZpbGVzLmxlbmd0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLmZsdXNoKClcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDbG9zZSB0aGUgYnVuZGxlLlxuICAgICAgICovXG4gICAgICB0aGlzLnRhcmdldC5jbG9zZSgpXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmZCA9PiBuZXcgQnVuZGxlKGZkKVxuIl19