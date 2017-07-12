/**
 * @file test/test-copy.js
 * @license MIT
 * @copyright
 */

const fs = require('fs')
const path = require('path')
const rf = require('rimraf').sync
const hopp = require('./utils/hopp')
const shouldExist = require('./utils/exist')

describe('hopp#concat', () => {
  it('should concat (without options) properly: src/*.js -> dist/bundle.js', async () => {
    rf(`${__dirname}/fixtures/concat-simple/dist`)
    rf(`${__dirname}/fixtures/concat-simple/hopp.lock`)

    // run hopp, no args
    await expect(hopp([], {
      cwd: `${__dirname}/fixtures/concat-simple`
    })).resolves.toBeDefined()

    // check for files
    shouldExist(`${__dirname}/fixtures/concat-simple/dist/bundle.js`)
    shouldExist(`${__dirname}/fixtures/concat-simple/hopp.lock`)

    const expected = fs.readFileSync(`${__dirname}/fixtures/concat-simple/expected.js`, 'utf8')
    const given = fs.readFileSync(`${__dirname}/fixtures/concat-simple/dist/bundle.js`, 'utf8')

    expect(given).toBe(expected)
  })
})