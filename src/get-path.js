/**
 * @file src/get-path.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

export default url => url[0] !== '.' && url[0] !== '/' ? './' + url : url