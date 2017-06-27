/**
 * @file src/streams/map.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

import through2 from 'through2'

export default mapper => through2.obj(function (data, _, done) {
  mapper(data, (err, newData) => {
    // if both undefined, just exit
    if (err === undefined && newData === undefined) return done()

    // otherwise, treat like usual async function
    if (err === null) {
      this.push(newData)
      done()
    } else done(err)
  })
})