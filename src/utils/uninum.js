/**
 * @file src/uninum.js
 * @license MIT
 * @copyright 2017 Karim Alibhai.
 */

export function toString( number ) {
  number = String(number)

  return number.match(new RegExp(`([0-9]{4})|([0-9]{${ number.length % 4 }})`, 'g')).map(num => {
    return String.fromCodePoint(+num)
  }).join('')
}

export function toNumber( string ) {
  if (!string) return 0

  let number = ''

  for (let i = 0; i < string.length; i += 1) {
    number += string.codePointAt(i)
  }

  return +number
}