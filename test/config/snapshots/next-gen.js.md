# Snapshot report for `test/config/next-gen.js`

The actual snapshot is saved in `next-gen.js.snap`.

Generated by [AVA](https://avajs.dev).

## handles errors when loading .mjs config

> error message

    'Error loading error.mjs: 🙈'

## fails when .mjs config does not have a default export

> error message

    'no-default-export.mjs must have a default export'

## handles errors when loading .js config as ESM

> error message

    'Error loading error.js: 🙈'

## fails when .js config does not have a default export

> error message

    'no-default-export.js must have a default export'

## throws an error if .js, .cjs and .mjs configs are present

> error message

    'Conflicting configuration in ava.config.js and ava.config.cjs & ava.config.mjs'
