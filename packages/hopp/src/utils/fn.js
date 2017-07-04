/**
 * @file src/utils/fn.js
 * @license MIT
 * @copyright 2017 10244872 Canada Inc.
 */

/**
 * Makes async functions deterministic.
 */
export default fn => {
  const cache = Object.create(null)

  return process.env.RECACHE === 'true' ? fn : async function () {
    const last = arguments[arguments.length - 1]
    let val = cache

    for (let i = 0, a = arguments[0]; i < arguments.length - 1; i += 1, a = arguments[i]) {
      val = val[a] = val[a] || Object.create(null)
    }

    return val[last] = (val[last] || await fn.apply(this, [... arguments]))
  }
}
