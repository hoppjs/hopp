/**
 * @file src/glob.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { resolve } from 'path'
import { WaitGroup } from 'rsxjs'
import minimatch from 'minimatch'

import * as lf from './lockfile'
import { projectDir } from './args'
import { readdirAsync, statAsync } from './fs'

async function traverse(wg, glob, results, dir = projectDir) {
  const lastModified = lf.get(lf.Keys.lastModified)
  const globSlice = glob.shift()

  for (const p of await readdirAsync(dir)) {
    const fpath = resolve(dir, p)
    const relpath = fpath.substr(projectDir.length + 1)
    const stat = await statAsync(fpath)

    // console.log('match(%j,%j) => %s (of %j)', p, globSlice, minimatch(p, globSlice), glob)

    if (minimatch(p, globSlice)) {
      if (stat.isDirectory()) {
        wg.add(traverse(wg, glob, results, fpath))
      } else if (!lastModified[relpath] || +stat.mtime > lastModified[relpath]) {
        results.push(relpath)
      }
    }
  }
}

const globCache = {}
export function search(glob) {
  if (globCache[glob]) {
    return Promise.resolve(globCache[glob])
  }

  glob = glob.split(/\/|\\/)

  // '.' can be disregarded as having match the
  // project directory
  if (glob[0] === '.') {
    glob.shift()
  }

  if (glob[0][0] === '.') {
    throw new Error(`Invalid glob: ${glob}`)
  }

  const results = globCache[glob] = []
  const wg = new WaitGroup()
  wg.add(traverse(wg, glob, results))
  return wg.wait(2000).then(() => {
    // console.log('search(%s) =>', glob, results)
    return results
  })
}
