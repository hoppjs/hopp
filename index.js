#!/usr/bin/env node

/**
 * @file index.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

const NODE_VERSION = +process.version.substr(1).split('.')[0]

if ( NODE_VERSION < 7 ) {
  require('regenerator-runtime/runtime')
  require('./dist-legacy')
} else {
  require('./dist')
}
