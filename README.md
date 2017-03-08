WDIO Tap reporter
==================

[![CircleCI](https://circleci.com/gh/LKay/wdio-tap-reporter/tree/master.svg?style=shield)](https://circleci.com/gh/LKay/wdio-tap-reporter/tree/master) [![Coverage Status](https://coveralls.io/repos/github/LKay/wdio-tap-reporter/badge.svg)](https://coveralls.io/github/LKay/wdio-tap-reporter) [![devDependencies Status](https://david-dm.org/lkay/wdio-tap-reporter/dev-status.svg)](https://david-dm.org/lkay/wdio-tap-reporter?type=dev)

> A WebdriverIO plugin to report in tap style. 
> Output is based on specification for [TAP13](https://testanything.org/tap-version-13-specification.html) 


## Installation

The easiest way is to keep `wdio-tap-reporter` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-tap-reporter": "~0.0.1"
  }
}
```

You can simple do it by:

```bash
npm install wdio-tap-reporter --save-dev
```
or if you are using [YARN](https://yarnpkg.com) (which I recomend):

```bash
yarn add wdio-tap-reporter -D
```

Instructions on how to install `WebdriverIO` can be found [here](http://webdriver.io/guide/getstarted/install.html).

## Configuration

Following code shows the default wdio test runner configuration. Just add `'tap'` as reporter
to the array.

```js
// wdio.conf.js
module.exports = {
  // ...
  reporters: ['dot', 'tap'],
  // ...
};
```

## Usage

Reporter outputs tests results in the TAP format and thus the output 
is compatible with [any TAP reporter](https://github.com/sindresorhus/awesome-tap#reporters).

Simply pipe the output to reporter you want to use: 

```bash
wdio | tap-nyan
```


