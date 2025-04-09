module.exports = {
  extends: [
    './rules/base/best-practices',
    './rules/base/possible-errors',
    './rules/base/style',
    './rules/base/variables',
    './rules/es5',
  ].map(require.resolve),
  root: true, // 停止向上查找.eslintrc.js 文件
}