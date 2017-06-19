/**
 * @file src/tasks/read-stream.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import fs from 'fs'
import pump from 'pump'
import map from 'map-stream'
import { stat } from '../fs'

export default (file, dest) => {
  let size

  return pump(
    fs.createReadStream(file),
    map(async (body, next) => {
      if (size === undefined) {
        size = (await stat(file)).size
      }

      next(null, {
        // metadata
        file,
        dest,
        size,

        // contents
        body
      })
    })
  )
}