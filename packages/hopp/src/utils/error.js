/**
 * @file utils/stack.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Simplifies an error's stack trace by removing
 * the stack trace lines that are part of hopp.
 */
export default function simplifyError (err, here) {
  here = here.stack.split('\n')[1]
  here = here.substr(0, here.indexOf('.js:'))

  const substack = err.stack.split('\n')
  let stack = substack.slice(0, 2).join('\n') + '\n'

  for (const line of substack.slice(2)) {
    if (line.indexOf(here) !== -1) {
      break
    }

    stack += line + '\n'
  }

  return { stack: stack.substr(0, stack.length - 1) }
}
