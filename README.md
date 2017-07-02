<p align="center">
  <a href="http://hoppjs.com/"><img src="https://github.com/hoppjs/hopp/raw/master/.github/logo.png"></a>
</p>
<p align="center">Crazy rapid build system.</p>

<p align="center">
  <a href="https://travis-ci.org/hoppjs/hopp"><img alt="Travis CI" src="https://travis-ci.org/hoppjs/hopp.svg?branch=master"></a>
  <a href="https://codecov.io/gh/hoppjs/hopp">
    <img src="https://codecov.io/gh/hoppjs/hopp/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
  <img alt="node v4 to 8" src="https://img.shields.io/badge/node-v4%20to%208-brightgreen.svg?style=flat">
</p>

[![NPM](https://nodei.co/npm/hopp.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hopp/)

## Usage

For all information regarding how to setup hopp, how to use plugins, & how to
make plugins, checkout our official [docs](https://docs.hoppjs.com/).

## Why hopp?

 1. **Ridiculously fast.** It was the reason we originally built hopp.
 We realized how much time was being wasted waiting for builds to finish.
 We also realized that all build tools claim to be the fastest. So we first
 developed benchmarks to verify the performance of build tools under various
 conditions over at **[buildjs-benchmarks](https://travis-ci.org/hoppjs/buildjs-benchmarks)**.
 We use these benchmarks to continuously test the performance of hopp as we
 add and remove features.
 2. **Super magical.** This is an opinion-based issue but many developers
 shy away from automation and say it is too *magical*. hopp does things a bit
 differently. We try to wave magic wands and say abracadabra whenever possible.
 Like autoloading plugins & managing bundling.
 3. **Built to scale.** Though the performance issues of other build tools is
 a bit painful, it really affects the build process of really large projects.
 hopp was built to perform well not just for smaller projects but also for large
 projects that their tools to perform at scale.

## Example

Sample `hoppfile.js`:

*You will need to install the proper plugins & presets to use this file.*

```javascript
import hopp from 'hopp'

export const less =
  hopp([ 'src/less/**/*.less' ])
    .less()
    .dest('dist/css')

export const js =
  hopp([ 'src/js/**/*.js' ])
    .babel()
    .concat()
    .dest()

export const watch = hopp.watch([
  'less',
  'css'
])

export default hopp.all([
  'less',
  'css'
])
```

## Contributing

We love contributors! After all, this is an open source project.

To get started, checkout our [contribution guide](.github/CONTRIBUTING.md).

**When reporting issues, please try to follow the provided template and
upload a proper `hopp-debug.log` file to accompany your bug report.**

## License

Copyright (C) 2017 10244872 Canada Inc.

Licensed under [MIT](LICENSE.md) license.