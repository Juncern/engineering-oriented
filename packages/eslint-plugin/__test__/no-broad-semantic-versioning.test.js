const rule = require("../rules/no-broad-semantic-versioning");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run(rule.name, rule, {
  valid: [
    {
      filename: "package.json",
      code: `module.exports = ${JSON.stringify({
        devDenpendencies: {
          "lodash": "^1.0.0",
        }
      })}`,
    },
    {
      filename: "package.json",
      code: 'var t = 1;',
    }
  ],
  invalid: [
    {
      filename: "package.json",
      code: `module.exports = ${JSON.stringify({
        devDenpendencies: {
          "lodash": "*",
        }
      })}`,
      errors: [
        {
          message: 'The "lodash" is not recommended to use "*"',
        }
      ]
    }
  ]
})
