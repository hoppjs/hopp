/**
 * @file src/get-path.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

export default url => url[0] !== '.' && url[0] !== '/' ? './' + url : url
