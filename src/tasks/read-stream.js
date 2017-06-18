/**
 * @file src/tasks/read-stream.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'
import pump from 'pump'
import map from 'map-stream'

export default (file, dest) => pump(
  fs.createReadStream(file),
  map((body, next) => {
    next(null, {
      file,
      body,
      dest
    })
  })
)