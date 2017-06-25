/**
 * @file src/streams/bundle.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import fs from 'fs'
import { EventEmitter } from 'events'

export default class Bundle extends EventEmitter {
  constructor (directory, fd) {
    super()

    this.target = fs.createWriteStream(null, {
      fd,
      autoClose: false
    })

    this.map = {}
    this.offset = 0
    this.files = []
    this.sizes = {}
    this.status = {}
    this.buffers = {}
    this.flushIndex = 0
    this.id = Math.random()
    this.directory = directory

    this.goal = []
  }

  add (file, stream) {
    this.files.push(file)
    this.buffers[file] = []
    this.sizes[file] = 0
    this.status[file] = false

    stream.on('data', d => {
      // in case it got stringified
      if (!Buffer.isBuffer(d.body)) {
        d.body = Buffer.from(d.body)
      }

      this.sizes[file] += d.body.length
      this.buffers[file].push(d.body)
    })

    this.goal.push(new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('end', () => {
        this.status[file] = true
        this.flush().then(resolve, reject)
      })
    }))
  }

  /**
   * Flush, in order.
   */
  async flush () {
    const file = this.files[this.flushIndex]
    const relative = file.replace(this.directory, '.')

    if (this.status[file] && !this.map[relative]) {
      // record sourcemap
      this.map[relative] = [this.offset, this.offset + this.sizes[file]]
      this.offset += this.sizes[file]

      // write to file
      await new Promise(resolve => {
        this.target.write(Buffer.concat(this.buffers[file]), resolve)
      })

      // move to next
      this.flushIndex++
    }
  }

  end () {
    return Promise.all(this.goal).then(async () => {
      /**
       * Ensure all data has been written.
       */
      while (this.flushIndex < this.files.length) {
        await this.flush()
      }

      /**
       * Close the bundle.
       */
      this.target.close()
    })
  }
}
