/**
 * @file index.src.js
 * @license MIT
 */

import { CLIEngine } from 'eslint'

/**
 * For node v4.
 */
require('regenerator-runtime/runtime')

/**
 * Buffer mode, since we're doing static analysis.
 * Readonly since we're not letting hopp handle the output.
 */
export const config = {
  mode: 'buffer',
  readonly: true
}

/**
 * Regular linting function. Just passes the results
 * down the stream.
 * 
 * @param {Object} options eslint options
 */
export default async (ctx, data) => {
  // create new linter
  if (!ctx.linter) {
    ctx.linter = new CLIEngine(ctx.args[0] || {})
  }

  // lint file
  data.lintResults = ctx.linter.executeOnText(
    data.body.toString('utf8'),
    data.file
  )

  // try and fix data
      if (data.lintResults.hasOwnProperty('output')) {
    console.log('applying fixes')
    data.body = data.lintResults.output
  }

  // passthrough
  return data
}

/**
 * Sets the formatter to be used for reporting.
 */
export const format = async (ctx, data) => {
  // grab formatter
  ctx.formatters = ctx.formatters || Object.create(null)
  const formatter = ctx.args[0] || 'stylish'
  ctx.formatters[formatter] = ctx.formatters[formatter] || CLIEngine.getFormatter(formatter)

  let firstResult
  ;[].forEach.call(data.lintResults.results, result => {
    if (!firstResult) {
      firstResult = result.config
    }

    const msg = ctx.formatters[formatter](data.lintResults.results, firstResult)

    if (msg) {
      console.log('\n%s', msg)
    }
  })

  return data
}

/**
 * Triggers failure if there are linting errors.
 */
export const failOnError = async (ctx, data) => {
  const count = data.lintResults.errorCount | 0

  if (count > 0) {
    throw new Error(`Failed with ${count} errors.`)
  }

  return data
}
