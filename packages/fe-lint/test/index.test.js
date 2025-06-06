const path = require('path');
const fs = require('fs-extra');
const feLint = require('../lib/index');

const { init } = feLint;

describe('init', () => {
  const templatePath = path.resolve(__dirname, './fixtures/template/init');
  const outputPath = path.resolve(__dirname, './fixtures/template/temp');

  beforeEach(() => {
    fs.copySync(templatePath, outputPath);
    fs.renameSync(`${outputPath}/_vscode`, `${outputPath}/.vscode`);
  });

  test('node api init should work as expected', async () => {
    await init({
      cwd: outputPath,
      checkVersionUpdate: false,
      eslintType: 'index',
      enableStylelint: true,
      enableMarkdownlint: true,
      enablePrettier: true,
    });

    const pkg = require(`${outputPath}/package.json`);
    const settings = require(`${outputPath}/.vscode/settings.json`);

    expect(settings['editor.defaultFormatter']).toBe('esbenp.prettier-vscode');
    expect(settings['eslint.validate'].includes('233')).toBeTruthy();
    expect(settings.test).toBeTruthy();
  });

  afterEach(() => {
    fs.removeSync(outputPath);
  });
});
