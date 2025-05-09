import path from 'path';
import fs from 'fs-extra';
import { PKG, ScanOptions, ScanReport, Config, ScanResult } from '../types';

export default async (options: ScanOptions): Promise<ScanReport> => {
  const { cwd, fix, outputReport, config: scanConfig } = options;

  const readConfigFile = (pth: string) => {
    const localPath = path.resolve(cwd, pth);
    return fs.existsSync(localPath) ? require(localPath) : {};
  };
  const pkg: PKG = readConfigFile('package.json');
  const config: Config = scanConfig || readConfigFile('fe-lint.config.js');
  const runErrors: Error[] = [];
  const results: ScanResult[] = [];

  // prettier
  if (fix && config.enablePrettier !== false) {
    // await doPrettier(options)
  }

  // eslint
  if (config.enableESLint !== false) {
    try {
      // const eslintResults = await doESLint({ ...optioins, config, pkg });
      // results = [...results, ...eslintResults];
    } catch (error) {
      runErrors.push(error);
    }
  }

  // stylelint
  if (config.enableStylelint !== false) {
    try {
      // const stylelintResults = await doStylelint({...optioins, config, pkg });
      // results = [...results,...stylelintResults];
    } catch (error) {
      runErrors.push(error);
    }
  }

  // markdownlint
  if (config.enableMarkdownlint !== false) {
    try {
      // const markdownlintResults = await doMarkdownlint({...optioins, config, pkg });
      // results = [...results,...markdownlintResults];
    } catch (error) {
      runErrors.push(error);
    }
  }

  // 生成报告文件
  if (outputReport) {
    const reportPath = path.resolve(process.cwd(), './fe-lint-report.json');
    fs.outputFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  }

  return {
    results,
    errorCount: results.reduce((count, { errorCount }) => count + errorCount, 0),
    warningCount: results.reduce((count, { warningCount }) => count + warningCount, 0),
    runErrors,
  };
};
