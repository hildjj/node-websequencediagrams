'use strict'

module.exports = {
  root: true,
  extends: ['@cto.af', 'plugin:markdown/recommended'],
  ignorePatterns: [
    'node_modules/',
  ],
  overrides: [
    {
      files: ['*.md/*.js', 'bin/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
}
