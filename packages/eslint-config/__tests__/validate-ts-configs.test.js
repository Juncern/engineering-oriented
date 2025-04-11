/**
 * 验证 TS 规则
 */

const assert = require('assert');
const eslint = require('eslint');
const path = require('path');
const sumBy = require('lodash/sumBy');

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

describe('Validate TS configs', () => {
  it('Validate eslint-config/typescript', async () => {
    const configPath = './typescript/index.js';
    const tsConfigPath = path.join(__dirname, './fixtures/tsconfig.json');
    const validTsFilePath = path.join(__dirname, './fixtures/ts.ts');
    const validImportFilePath = path.join(__dirname, './fixtures/ts-import-a.ts');
    const invalidImportFilePath = path.join(__dirname, './fixtures/ts-import-nonexistent.ts');

    // 初始化 ESLint 实例
    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
      overrideConfig: {
        parserOptions: {
          project: tsConfigPath,
        },
        plugins: ['import'], // 明确加载 import 插件
        settings: {
          'import/resolver': {
            typescript: {
              project: tsConfigPath,
              alwaysTryTypes: false,
            },
            node: {
              extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
          },
        },
        rules: {
          'import/no-unresolved': 'error', // 确保 import/no-unresolved 规则被启用
        },
      },
    });

    // === 1. 验证导出的 config 是否正常 ===
    const config = await cli.calculateConfigForFile(validTsFilePath);
    assert.ok(isObject(config), 'Config 应为对象');
    assert.ok(config.parser.includes('@typescript-eslint/parser'), '应使用 TS parser');
    assert.ok(config.plugins.includes('@typescript-eslint'), '应包含 TS 插件');

    // === 2. 验证 lint 工作是否正常 ===
    const results = await cli.lintFiles([validTsFilePath]);
    assert.equal(results[0].fatalErrorCount, 0, '不应有致命错误');
    assert.notEqual(results[0].errorCount, 0, '应包含 TS 规则错误');
    assert.equal(results[0].warningCount, 0, '不应有警告');

    // === 3. 验证 @typescript-eslint 工作是否正常 ===
    const { messages } = results[0];
    const errorReportedByReactPlugin = messages.filter((result) => {
      return result.ruleId && result.ruleId.indexOf('@typescript-eslint/') !== -1;
    });
    assert.notEqual(errorReportedByReactPlugin.length, 0, '应监测到 @typescript-eslint 规则错误');

    const errorReportedByNoRedeclare = messages.filter((result) => {
      return result.ruleId === 'no-redeclare';
    });
    assert.equal(errorReportedByNoRedeclare.length, 0);

    // === 4. 验证 eslint-import-resolver-typescript 工作是否正常 ===
    // 4.1 测试合法导入
    const validImportResults = await cli.lintFiles([validImportFilePath]);
    assert.equal(validImportResults[0].errorCount, 0, '应能正常解析合法导入');

    // 4.2 测试非法导入
    const invalidImportResults = await cli.lintFiles([invalidImportFilePath]);
    const impportErrors = invalidImportResults[0].messages.filter((result) => {
      return result.ruleId === 'import/no-unresolved';
    });
    assert.ok(impportErrors.length > 0, '应检测到无法解析的模块');
  });

  it('Validate eslint-config/typescript/vue', async () => {
    const configPath = './typescript/vue.js';
    const filePath = path.join(__dirname, './fixtures/ts-vue.vue');

    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
      overrideConfig: {
        parserOptions: {
          project: path.join(__dirname, './fixtures/tsconfig.json'),
        },
      },
    });

    // 验证导出的 config 是否正常
    const config = await cli.calculateConfigForFile(filePath);
    assert.ok(isObject(config));

    // 验证 lint 工作是否正常
    const results = await cli.lintFiles([filePath]);
    assert.equal(sumBy(results, 'fatalErrorCount'), 0);
    assert.notEqual(sumBy(results, 'errorCount'), 0);
    assert.notEqual(sumBy(results, 'warningCount'), 0);

    // 验证 eslint-plugin-vue 及 @typescript-eslint 工作是否正常
    const { messages } = results[0];
    const errorReportedByReactPlugin = messages.filter((result) => {
      return result.ruleId && result.ruleId.indexOf('vue/') !== -1;
    });
    const errorReportedByTSPlugin = messages.filter((result) => {
      return result.ruleId && result.ruleId.indexOf('@typescript-eslint/') !== -1;
    });
    assert.notEqual(errorReportedByReactPlugin.length, 0);
    assert.notEqual(errorReportedByTSPlugin.length, 0);
  });

  it('Validate eslint-config/essential/typescript', async () => {
    const configPath = './essential/typescript/index.js';
    const filePath = path.join(__dirname, './fixtures/ts.ts');

    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
      overrideConfig: {
        parserOptions: {
          project: path.join(__dirname, './fixtures/tsconfig.json'),
        },
      },
    });

    // 验证导出的 config 是否正常
    const config = await cli.calculateConfigForFile(filePath);
    assert.ok(isObject(config));

    // 验证 lint 工作是否正常
    const results = await cli.lintFiles([filePath]);
    assert.equal(sumBy(results, 'fatalErrorCount'), 0);
    assert.notEqual(sumBy(results, 'errorCount'), 0);
    assert.notEqual(sumBy(results, 'warningCount'), 0);

    // 验证黑名单中的规则已关闭
    const { messages } = results[0];

    // 验证 @typescript-eslint/semi 被关闭
    const semiErrors = messages.filter((result) => {
      return result.ruleId === '@typescript-eslint/semi';
    });
    assert.equal(semiErrors.length, 0);

    // 验证一个风格问题被降级
    const styleErrors = messages.filter((result) => {
      return result.ruleId === 'object-curly-spacing';
    });
    assert.equal(styleErrors[0].severity, 1);
  });

  it('Validate eslint-config/essential/typescript/react', async () => {
    const configPath = './essential/typescript/react.js';
    const filePath = path.join(__dirname, './fixtures/ts-react.tsx');

    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
      overrideConfig: {
        parserOptions: {
          project: path.join(__dirname, './fixtures/tsconfig.json'),
        },
      },
    });

    // 验证导出的 config 是否正常
    const config = await cli.calculateConfigForFile(filePath);
    assert.ok(isObject(config));

    // 验证 lint 工作是否正常
    const results = await cli.lintFiles([filePath]);
    assert.equal(sumBy(results, 'fatalErrorCount'), 0);
    assert.notEqual(sumBy(results, 'errorCount'), 0);
    assert.notEqual(sumBy(results, 'warningCount'), 0);

    // 验证对 tsx 工作是否正常
    const { messages } = results[0];
    const errorReportedByReactPlugin = messages.filter((result) => {
      return result.ruleId && result.ruleId.indexOf('react/') !== -1;
    });
    assert.notEqual(errorReportedByReactPlugin.length, 0);
    const errorReportedByTSPlugin = messages.filter((result) => {
      return result.ruleId && result.ruleId.indexOf('@typescript-eslint/') !== -1;
    });
    assert.notEqual(errorReportedByTSPlugin.length, 0);

    // 验证 @typescript-eslint/semi 被关闭
    const semiErrors = messages.filter((result) => {
      return result.ruleId === '@typescript-eslint/semi';
    });
    assert.equal(semiErrors.length, 0);

    // 验证黑名单中的规则已关闭，取 react/jsx-indent 进行测试
    const errorReportedByReactPluginBlackList = messages.filter((result) => {
      return result.ruleId === 'react/jsx-indent';
    });
    assert.equal(errorReportedByReactPluginBlackList.length, 0);
  });

  it('Validate eslint-config/essential/typescript/vue', async () => {
    const configPath = './essential/typescript/vue.js';
    const filePath = path.join(__dirname, './fixtures/ts-vue.vue');

    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
      overrideConfig: {
        parserOptions: {
          project: path.join(__dirname, './fixtures/tsconfig.json'),
        },
      },
    });

    // 验证导出的 config 是否正常
    const config = await cli.calculateConfigForFile(filePath);
    assert.ok(isObject(config));

    // 验证 lint 工作是否正常
    const results = await cli.lintFiles([filePath]);
    assert.equal(sumBy(results, 'fatalErrorCount'), 0);
    assert.notEqual(sumBy(results, 'errorCount'), 0);
    assert.notEqual(sumBy(results, 'warningCount'), 0);

    // 验证 vue plugin 工作是否正常
    const result = results[0];
    const errorReportedByReactPlugin = result.messages.filter((message) => {
      return message.ruleId && message.ruleId.indexOf('vue/') !== -1;
    });
    assert.notEqual(errorReportedByReactPlugin.length, 0);

    // 验证黑名单中的规则已关闭
    const errorReportedByReactPluginBlackList = result.messages.filter((message) => {
      return message.ruleId === '@typescript-eslint/indent';
    });
    assert.equal(errorReportedByReactPluginBlackList.length, 0);
  });

  it('Validate eslint-config/typescript/node', async () => {
    const configPath = './typescript/node.js';
    const filePath = path.join(__dirname, './fixtures/ts-node.ts');

    const cli = new eslint.ESLint({
      overrideConfigFile: configPath,
      useEslintrc: false,
      ignore: false,
    });

    // 验证导出的 config 是否正常
    const config = await cli.calculateConfigForFile(filePath);
    assert.ok(isObject(config));
    assert.strictEqual(config.env.node, true);
    assert.strictEqual(config.plugins.includes('node'), true);

    // 验证已开启的 link 规则是否校验正常
    const results = await cli.lintFiles([filePath]);
    const { messages, errorCount, warningCount } = results[0];
    const ruleIds = Array.from(messages.map((item) => item.ruleId));

    assert.strictEqual(ruleIds.includes('node/prefer-promises/fs'), true);
    assert.strictEqual(ruleIds.includes('@typescript-eslint/no-unused-vars'), true);
    assert.strictEqual(ruleIds.includes('no-console'), true);
    assert.strictEqual(ruleIds.includes('no-var'), true);
    assert.strictEqual(ruleIds.includes('eol-last'), true);
    assert.equal(errorCount, 2);
    assert.equal(warningCount, 3);

    // 验证已关闭的 link 规则是否校验正常，以 @typescript-eslint/explicit-function-return-type 为例
    assert.strictEqual(ruleIds.includes('@typescript-eslint/explicit-function-return-type'), false);
  });
});
