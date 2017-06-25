/**
 * @file test/utils/hopp.js
 * @license MIT
 * @copyright
 */

const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn

module.exports = (args, opts) => new Promise((resolve, reject) => {
  const child = spawn(path.resolve(__dirname, '..', '..', 'packages', 'hopp', 'index.js'), args, opts)
  let output = ''

  child.stdout.on('data', chunk => output += chunk + '\n')
  child.stderr.on('data', chunk => output += chunk + '\n')

  child.on('close', code => {
    if (code !== 0) reject(new Error(output))
    else resolve(output)
  })
})