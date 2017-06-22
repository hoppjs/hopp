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
  let size, emitted = 0

  return pump(
    fs.createReadStream(file),
    map(async (body, next) => {
      if (size === undefined) {
        size = (await stat(file)).size
      }

      // collect size
      emitted += body.length

      // check for unexpected values
      if (emitted > size) {
        return next(new Error('File size received exceeded expected file size.'))
      }

      next(null, {
        // metadata
        file,
        dest,
        size,
        done: emitted === size,

        // contents
        body
      })
    })
  )
}