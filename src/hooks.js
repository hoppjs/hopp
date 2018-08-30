/**
 * @file src/hooks.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

const fastfs = require('./fs')
const fs = require('fs')
Object.assign(fs, fastfs)
