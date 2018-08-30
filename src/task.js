/**
 * @file src/task.js
 * @copyright 2018-present Karim Alibhai. All rights reserved.
 */

import { WaitGroup } from 'rsxjs'

import { search } from './glob'
import { targets, config } from './args'

const ENTRY_POINT = '__hopp_entry__'

export class Task {
  constructor(name, data) {
    this.name = name
    this.src = []
    this.globs = (
      data.src ?
      (
        typeof data.src === 'string' ?
        [data.src] :
        data.src
      ) :
      []
    )
    this.dest = data.dest
    this.depends = data.deps || []
    this.stages = (data.build || []).map(s => {
      if (typeof s === 'string') {
        return {
          name: s,
        }
      }

      return s
    })
  }

  getDependencies() {
    return this.depends.map(name => {
      if (name === this.name) {
        throw new Error(`Found circular dependency in tasks: ${name} depends on itself`)
      }

      return tasks[name]
    })
  }

  isStale() {
    if (this.src.length > 0) {
      return true
    }

    for (const d of this.getDependencies()) {
      if (d.isStale()) {
        return true
      }
    }

    return false
  }

  toString() {
    if (this.depends.length > 0) {
      return `
        function ${this.name}() {
          return parallel(${this.depends.join(', ')})
        }
        exports.${this.name} = ${this.name}
      `
    }

    return `
      function ${this.name}() {
        return src(${JSON.stringify(this.src)})
${this.stages.map(s => `          .pipe(${s.name}())`).join('\n')}
          .pipe(dest('${this.dest}'))
      }
      exports.${this.name} = ${this.name}
    `
  }
}

function loadTask(wg, t) {
  for (const src of t.globs) {
    wg.add(
      search(src).then(r => t.src.push(...r))
    )
  }

  for (const dep of t.depends) {
    loadTask(wg, tasks[dep])
  }
}

function load() {
  const wg = new WaitGroup()

  for (const taskName of targets) {
    loadTask(wg, tasks[taskName])
  }

  return wg.wait()
}

export const TaskMgr = {
  async execute(tree) {
    if (tree.zeroKeys.length === 0) {
      throw new Error(`Cannot continue to execute tree - no zero-dep tasks left`)
    }

    for (const taskName of tree.zeroKeys) {
      // ...
    }
  },

  compile(t) {
    const imports = {}
    
    function checkImports(t) {
      if (t.src.length > 0) {
        imports.gulp = ['src', 'dest']
      }

      for (const s of t.stages) {
        const pluginName = s.name
        imports[`gulp-${pluginName}`] = pluginName
      }

      for (const dep of t.getDependencies()) {
        checkImports(dep)
      }
    }
    checkImports(t)

    return `
    ${Object.keys(imports)
        .map(mod => `const ${typeof imports[mod] === 'string' ? imports[mod] : `{ ${imports[mod].join(', ')} }`} = require('${mod}')`)
        .join('\n')}
    ${[
      ...t.getDependencies(),
      t,
    ].join('\n\n')}
    `
  },

  async buildTree() {
    await load()

    const zeroKeys = []

    function tryMark(name) {
      if (tasks[name].isStale() && tasks[name].depends.length === 0) {
        zeroKeys.push(name)
      }

      for (const dep of tasks[name].depends) {
        tryMark(dep)
      }
    }

    targets.forEach(t => tryMark(t))

    if (zeroKeys.length === 1) {
      return (
        this.compile(tasks[zeroKeys[0]]) + `
        exports.${ENTRY_POINT} = ${zeroKeys[0]}`
      )
    }

    return this.compile(new Task(ENTRY_POINT, {
      deps: zeroKeys,
    }))
  },
}

// load up static data off tasks
const tasks = {}
for (const taskName in config) {
  if (config.hasOwnProperty(taskName)) {
    tasks[taskName] = new Task(taskName, config[taskName])
  }
}
