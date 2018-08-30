/**
 * @file src/args.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import minimist from 'minimist'
import { resolve, dirname } from 'path'
import { readFileSync, statSync } from 'fs'

const argv = minimist(process.argv.slice(2), {
  string: [
    'directory', 'd',
  ],

  boolean: [
    'help', 'h',
    'recache', 'R',
    'verbose', 'v',
    'version', 'V',
    'skip', 's'
  ]
})

if (argv.help || argv.h) {
  console.log('usage: hopp [OPTIONS] [TASKS]')
  console.log('')

  for (let a in args) {
    console.log('  -%s, --%s%s%s', a, args[a][0], ' '.repeat(largestArg.length - args[a][0].length + 2), args[a][1])
  }

  process.exit(1)
}

/**
 * Walk recursively upwards until a directory with
 * a 'hopp.json' file - i.e. the hopp project.
 * @param {string} directory the directory to walk
 * @returns {}
 */
function locateProject(dir) {
  if (dir === '/') {
    throw new Error(
      `Failed to determine the project location - make sure you have a hopp.json somewhere.`
    )
  }

  try {
    const configpath = resolve(dir, 'hopp.json')

    if (recache) {
      if (!statSync(configpath).isFile()) {
        throw new Error(`hopp.json must be a valid file`)
      }
    } else {
      readFileSync(configpath, 'utf8')
    }

    return dir
  } catch (err) {
    if (String(err).indexOf('no such file or directory') !== -1) {
      return locateProject(dirname(dir))
    }

    throw err
  }
}

export const recache = !!(argv.recache || argv.R)
export const skipBuild = !!(argv.skip || argv.s)
export const targets = argv._.length === 0 ? ['default'] : argv._

export const projectDir = (function() {
  const dir = argv.directory || argv.d
  if (dir) {
    if (dir[0] === '/') {
      return dir
    }

    return resolve(process.cwd(), dir)
  }

  return locateProject(process.cwd())
}())
export const configFile = resolve(projectDir, 'hopp.json')
export const config = JSON.parse(readFileSync(configFile, 'utf8'))
