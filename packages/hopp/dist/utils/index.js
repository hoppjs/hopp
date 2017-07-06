'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simplifyError = exports.createLogger = exports.deepEqual = exports.fn = exports._ = undefined;

var _2 = require('./_');

var _3 = _interopRequireDefault(_2);

var _fn = require('./fn');

var _fn2 = _interopRequireDefault(_fn);

var _deepEqual = require('./deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file src/utils/index.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

const createLogger = require('./log');

exports._ = _3.default;
exports.fn = _fn2.default;
exports.deepEqual = _deepEqual2.default;
exports.createLogger = createLogger;
exports.simplifyError = _error2.default;

//# sourceMappingURL=index.js.map