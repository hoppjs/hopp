#!/usr/bin/env node

/**
 * @file index.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

process.env.LEGACY_NODE = +(process.version.substr(1).split('.')[0]) < 7

if (process.env.LEGACY_NODE !== 'false') {
  require('regenerator-runtime/runtime')
  require('./dist-legacy')
} else {
  require('./dist')
}
