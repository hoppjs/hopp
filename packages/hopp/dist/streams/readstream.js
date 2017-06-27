'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _fs3 = require('../fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/tasks/read-stream.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = (file, dest) => {
  let size;
  let emitted = 0;

  return (0, _pump2.default)(_fs2.default.createReadStream(file), (0, _map2.default)(async (body, next) => {
    if (size === undefined) {
      size = (await (0, _fs3.stat)(file)).size;
    }

    // collect size
    emitted += body.length;

    // check for unexpected values
    if (emitted > size) {
      return next(new Error('File size received exceeded expected file size.'));
    }

    next(null, {
      // metadata
      file,
      dest,
      size,
      done: emitted === size,

      // contents
      body
    });
  }));
};

//# sourceMappingURL=readstream.js.map