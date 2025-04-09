module.exports = {
  extends: [
    './rules/base/best-practices',
    './rules/base/es6',
    './rules/base/errors',
    './rules/base/possible-errors',
    './rules/base/strict',
    './rules/base/style',
    './rules/base/variables',
    './rules/imports/'
  ].map(require.resolve),
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      globalRrtuen: true,
      impliedStrict: true,
      jsx: true,
    }
  },
  root: true, // 停止向上查找 .eslintrc.js 文件
}