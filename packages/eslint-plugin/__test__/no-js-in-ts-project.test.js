const rule = require("../rules/no-js-in-ts-project");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run(rule.name, rule, {
  valid: [
    {
      filename: "test.ts",
      code: '',
    },
    {
      filename: ".stylelintrc.js",
      code: '',
    },
    {
      filename: "homw.ts",
      code: '',
    },
  ],
  invalid: [
    {
      filename: "test.js",
      code: '',
      errors: [
        {
          message: 'The "test.js" is not recommended in TS project',
        },
      ],
    }
  ]
})