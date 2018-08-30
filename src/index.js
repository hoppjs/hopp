/**
 * @file src/index.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import './hooks'

import { TaskMgr } from './task'
import * as lf from './lockfile'

!async function () {
  // 1) load up `hopp.lock`
  lf.load()

  // 2) parse tasks
  const t = await TaskMgr.buildTree()

  // 3) when all globs are ready, use all non-empty results to mark tasks as stale
  // 4) distribute tasks pipeline across several gulp processes (don't even need to do this
  // in a smart way, just fork some gulps).
  // 5) when a task ends, if it is successful, update markings on source files.
  // 6) when all tasks are done, quit with error if any fail, otherwise succeed.
}()
