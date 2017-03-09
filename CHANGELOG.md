# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.0.4 - 2017-03-09
### Changed
- Base test state detaction on actual `event`/`type` property as `state` is missing
- Don't show duration for single tests
- Simplify interfaces for minimum necessary data
- Include skipped tests in the plan as `test:start` is not emitted for skipped tests

## 0.0.3 - 2017-03-09
### Added
- `coveralls` as dev dependency
- `files` section in `package.json` as built fiels were missing
- `prepublish` script to make sure built files are present

### Removed
- Installing `coveralls` globally in CI
- Unused typings

## 0.0.2 - 2017-03-08
### Changed
- Fix typo in README
- Upload coverage results only for `master` branch

## 0.0.1 - 2017-03-08
### Added
- Initial code for the tap reporter
- Tests for reporter
- Basic README file
- This CHANGELOG
- Config file for CircleCI

## Compare
- [Unreleased](https://github.com/LKay/wdio-tap-reporter/compare/v0.0.4...HEAD)
- [0.0.3](https://github.com/LKay/wdio-tap-reporter/compare/v0.0.3...v0.0.4)
- [0.0.3](https://github.com/LKay/wdio-tap-reporter/compare/v0.0.2...v0.0.3)
- [0.0.2](https://github.com/LKay/wdio-tap-reporter/compare/v0.0.1...v0.0.2)
