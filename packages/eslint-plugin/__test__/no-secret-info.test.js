const rule = require("../rules/no-secret-info");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run(rule.name, rule, {
  valid: [
    {
      code: "var accessKeySecret = process.env.ACCESS_KEY_SECRET;",
    },
    {
      code: 'var password = "";',
    },
    {
      code: `var client = {
        accessKeySecret: process.env.ACCESS_KEY_SECRET,
      }`,
    },
  ],
  invalid: [
    {
      code: "var accessKeySecret = 'xxx';",
      errors: [
        {
          message: 'Detect that the "xxx" might be a secret token, please check it carefully!',
        }
      ]
    },
    {
      code: `var client = {
        accessKeyToken: 'xxx',
      }`,
      errors: [
        {
          message: 'Detect that the "xxx" might be a secret token, please check it carefully!',
        }
      ]
    }
  ]
});
