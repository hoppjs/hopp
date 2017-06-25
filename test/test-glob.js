/**
 * @file test/test-glob.js
 * @license MIT
 * @copyright 10244872 Canada Inc.
 */

const tmp = require('tmp');
const glob = require('../packages/hopp/dist/fs/glob').default
const cache = require('../packages/hopp/dist/cache')

describe('glob', () => {
  it('*.js', async () => {
    // load cache from new dir, shouldn't have lockfile
    await cache.load(tmp.dirSync().name)

    // tests
    expect(await glob('*.js', `${__dirname}/fixtures/glob`, false, true)).toMatchSnapshot()
  })
})