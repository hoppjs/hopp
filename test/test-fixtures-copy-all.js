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

describe('hopp cli', () => {
  it('should copy all files with simple glob: src/*.js -> dist', async () => {
    rf(`${__dirname}/fixtures/copy-all/dist`)
    rf(`${__dirname}/fixtures/copy-all/hopp.lock`)

    // run hopp, no args
    await expect(hopp([], {
      cwd: `${__dirname}/fixtures/copy-all`
    })).resolves.toBeDefined()

    // check for files
    shouldExist(`${__dirname}/fixtures/copy-all/dist`)
    shouldExist(`${__dirname}/fixtures/copy-all/hopp.lock`)

    fs.readdirSync(`${__dirname}/fixtures/copy-all/src`).forEach(file => {
      shouldExist(`${__dirname}/fixtures/copy-all/dist/${file}`)
    })
  })
})