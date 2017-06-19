'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @file src/get-path.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

exports.default = function (url) {
  return url[0] !== '.' && url[0] !== '/' ? './' + url : url;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mcy9nZXQtcGF0aC5qcyJdLCJuYW1lcyI6WyJ1cmwiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7a0JBTWU7QUFBQSxTQUFPQSxJQUFJLENBQUosTUFBVyxHQUFYLElBQWtCQSxJQUFJLENBQUosTUFBVyxHQUE3QixHQUFtQyxPQUFPQSxHQUExQyxHQUFnREEsR0FBdkQ7QUFBQSxDIiwiZmlsZSI6ImdldC1wYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSBzcmMvZ2V0LXBhdGguanNcbiAqIEBsaWNlbnNlIE1JVFxuICogQGNvcHlyaWdodCAyMDE3IEthcmltIEFsaWJoYWkuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgdXJsID0+IHVybFswXSAhPT0gJy4nICYmIHVybFswXSAhPT0gJy8nID8gJy4vJyArIHVybCA6IHVybCJdfQ==