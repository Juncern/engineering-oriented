const path = require('path');
const assert = require('assert');
const eslint = require('eslint');

describe('ESLint Import Resolver', () => {
  it('should report import/no-unresolved for missing modules', async () => {
    // 1. 创建临时 ESLint 配置
    const config = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: path.join(__dirname, 'fixtures/tsconfig.json'),
      },
      plugins: ['import'], // 明确加载 import 插件
      settings: {
        'import/resolver': {
          typescript: {
            project: path.join(__dirname, 'fixtures/tsconfig.json'),
          },
        },
      },
      rules: {
        'import/no-unresolved': ['error', { commonjs: true }], // 完整规则配置
      },
    };

    // 2. 初始化 ESLint
    const cli = new eslint.ESLint({
      useEslintrc: false,
      overrideConfig: config,
      baseConfig: null, // 不继承任何基础配置
    });

    // 3. 执行 lint
    const results = await cli.lintFiles([
      path.join(__dirname, 'fixtures/ts-import-nonexistent.ts'),
    ]);

    // 4. 调试输出
    console.log('Full ESLint Results:', JSON.stringify(results, null, 2));

    // 5. 验证错误
    const unresolvedErrors = results[0].messages.filter(
      (msg) => msg.ruleId === 'import/no-unresolved',
    );

    assert.ok(
      unresolvedErrors.length > 0,
      `Expected import/no-unresolved error, but got: ${
        results[0].messages.map((m) => m.ruleId).join(', ') || 'no errors'
      }`,
    );

    // 6. 验证错误内容
    const errorMessage = unresolvedErrors[0].message.toLowerCase();
    assert.ok(
      errorMessage.includes('non-existent-module') ||
        errorMessage.includes('cannot find module'),
      `Expected module not found error, but got: "${unresolvedErrors[0].message}"`,
    );
  });
});
