"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/utils/_.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

exports.default = array => {
  const maps = [];
  const handler = {
    map(fn) {
      maps.push(fn);
      return handler;
    },

    val() {
      array = array.slice();

      for (let i = 0; i < array.length; i += 1) {
        for (let fn of maps) {
          array[i] = fn(array[i]);
        }
      }

      return array;
    }
  };

  return handler;
};

//# sourceMappingURL=_.js.map