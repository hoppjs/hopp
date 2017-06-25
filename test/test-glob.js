/**
 * @file test/test-glob.js
 * @license MIT
 * @copyright 10244872 Canada Inc.
 */

const tmp = require('tmp');
const glob = require('../packages/hopp/dist/fs/glob').default
const cache = require('../packages/hopp/dist/cache')

describe('glob', async () => {
  it('should recursively match files relative to current dir', async () => {
    // load cache from new dir, shouldn't have lockfile
    await cache.load(tmp.dirSync().name)

    // tests with no .; these snapshots are assumed to be correct
    // in later tests
    expect(await glob('*.js', `${__dirname}/fixtures/glob`, false, true)).toMatchSnapshot()
    expect(await glob('*/*.js', `${__dirname}/fixtures/glob`, false, true)).toMatchSnapshot()
    expect(await glob('**/*.js', `${__dirname}/fixtures/glob`, false, true)).toMatchSnapshot()
  })

  it('should recursively match files relative to ./', async () => {
    // load cache from new dir, shouldn't have lockfile
    await cache.load(tmp.dirSync().name)

    async function assert (pttn) {
      const relativeToDot = await glob('./' + pttn, `${__dirname}/fixtures/glob`, false, true)
      const relativeToCurr = await glob(pttn, `${__dirname}/fixtures/glob`, false, true)

      return expect(relativeToDot).toEqual(relativeToCurr)
    }

    await assert('*.js')
    await assert('*/*.js')
    await assert('**/*.js')
  })

  it('should recursively match files relative to ../', async () => {
    // load cache from new dir, shouldn't have lockfile
    await cache.load(tmp.dirSync().name)

    async function assert (pttn) {
      const relativeToDot = await glob('../' + pttn, `${__dirname}/fixtures/glob/1`, false, true)
      const relativeToCurr = await glob(pttn, `${__dirname}/fixtures/glob`, false, true)

      return expect(relativeToDot).toEqual(relativeToCurr)
    }

    await assert('*.js')
    await assert('*/*.js')
    await assert('**/*.js')
  })
})