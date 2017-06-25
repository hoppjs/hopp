/**
 * @file test/utils/exist.js
 * @license MIT
 * @copyright
 */

const fs = require('fs')

module.exports = file => expect(!!fs.statSync(file)).toBeTruthy()