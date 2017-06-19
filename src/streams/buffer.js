/**
 * @file src/tasks/buffer.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import map from 'map-stream'

export default () => {
  let buffers = []
  let length = 0

  return map((data, next) => {
    // add to buffer
    length += data.body.length
    buffers.push(data.body)

    // check for unexpected values
    if (length > data.size) {
      return next(new Error('Buffer size exceeded expected file size.'))
    }

    // check for end
    if (length === data.size) {
      return next(null, Buffer.concat(buffers))
    }

    // otherwise drop from stream
    next()
  })
}