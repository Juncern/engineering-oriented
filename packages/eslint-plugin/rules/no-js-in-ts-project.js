const path = require("path");

const RULE_NAME = "no-js-in-ts-project";

const JS_REGEX = /\.jsx?$/;

const DEFAULT_WHITE_LIST = [
  "commitlint.config.js",
  "eslint.config.js",
  "prettier.config.js",
  "stylelint.config.js",
  ".stylelintrc.js",
];

module.exports = {
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    fixable: null,
    messages: {
      noJSInTSProject: 'The "{{fileName}}" is not recommended in TS project',
    },
  },
  create(context) {
    const fileName = context.getFilename();
    const extName = path.extname(fileName);
    const ruleOptions = context.options[0] || {};
    let { whiteList = [], autoMerge = true } = ruleOptions;
    if (!whiteList.length) {
      whiteList = DEFAULT_WHITE_LIST;
    } else if (autoMerge) {
      whiteList = [...new Set([...DEFAULT_WHITE_LIST, ...whiteList])];
    }

    const isInWhiteList = whiteList.some((item) => fileName.includes(item));
    const isJSFile = JS_REGEX.test(extName);
    if (isJSFile && !isInWhiteList) {
      context.report({
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        messageId: "noJSInTSProject",
        data: {
          fileName,
        },
      });
    }

    // Necessary to return an object to avoid ESLint error
    return {};
  },
};
