"use strict";

const rule = require("../rules/no-http-url");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

ruleTester.run(rule.name, rule, {
  valid: [
    {
      code: "var test = 'https://mhcoder.cn';",
    },
  ],
  invalid: [
    {
      code: "var test = 'http://mhcoder.cn';",
      output: "var test = 'http://mhcoder.cn';",
      errors: [
        {
          message: 'Recommend "http://mhcoder.cn" switch to HTTPS',
        },
      ],
    },
    {
      code: "<img src='http://mhcoder.cn' />",
      output: "<img src='http://mhcoder.cn' />",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      errors: [
        {
          message: 'Recommend "http://mhcoder.cn" switch to HTTPS',
        },
      ],
    },
  ],
});
