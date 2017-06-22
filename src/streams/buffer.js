/**
 * @file src/tasks/buffer.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

import map from 'map-stream'

export default () => {
  const buffers = []

  return map((data, next) => {
    // add to buffer
    buffers.push(data.body)

    // check for end
    if (data.done) {
      return next(null, Buffer.concat(buffers))
    }

    // otherwise drop from stream
    next()
  })
}