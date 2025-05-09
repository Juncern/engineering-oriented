import { ESLint } from 'eslint';
import { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT } from '../../utils/constants';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

export function getESLintConfig(options: ScanOptions, pkg: PKG, config: Config): ESLint.Options {
  const { cwd, fix, ignore } = options;
  const lintConfig: ESLint.Options = {
    cwd,
    fix,
    ignore,
    extensions: ESLINT_FILE_EXT,
    errorOnUnmatchedPattern: false,
  };

  if (config.eslintOptions) {
    // 若用户传入了 eslintOptions，则使用用户传入的配置
    Object.assign(lintConfig, config.eslintOptions);
  } else {
    // 扫描目录下有无lintrc文件，若无则使用默认的 lint 配置
    const lintConfigFiles = glob.sync('.eslintrc.{yaml,yml,json}', { cwd });
    if (lintConfigFiles.length) {
      lintConfig.useEslintrc = true;
    } else if (!pkg.eslintConfig) {
      lintConfig.resolvePluginsRelativeTo = path.resolve(__dirname, '../../');
      lintConfig.useEslintrc = false;
      lintConfig.baseConfig = {
        extends: [
          'plugin:fe-lint/recommended', // TODO
          // ESLint 不管格式问题，直接使用 Prettier 进行格式化
          ...(config.enablePrettier ? ['prettier'] : []),
        ],
      };
    }

    // 根据扫描目录下有无 lintignore 文件，若无则使用默认的 ignore 配置
    const lintIgnoreFile = path.resolve(cwd, '.eslintignore');
    if (!fs.existsSync(lintIgnoreFile) && !pkg.eslintIgnore) {
      lintConfig.ignorePath = path.resolve(__dirname, '../../config/_eslintignore.ejs');
    }
  }

  return lintConfig;
}
