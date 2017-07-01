'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/get-path.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = url => url[0] !== '.' && url[0] !== '/' ? './' + url : url;

//# sourceMappingURL=get-path.js.map