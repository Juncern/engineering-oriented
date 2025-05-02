const path = require('path');
const requireAll = require('require-all');

exports.rules = requireAll({
  dirname: path.resolve(__dirname, 'rules'),
});

exports.configs = requireAll({
  dirname: path.resolve(__dirname, 'configs'),
});

// 当ESlint遇到.json文件时，会调用preprocess方法对文件内容进行预处理，
// 然后再将预处理后的内容传递给ESlint进行语法分析和规则检查。
// 这样，ESlint就可以正确地解析和处理.json文件了。
exports.processors = {
  '.json': {
    preprocess(text) {
      return {
        code: `module.exports = ${text}`,
      }
    }
  }
}