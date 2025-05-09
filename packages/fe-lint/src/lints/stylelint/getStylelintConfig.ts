import { LinterOptions } from 'stylelint';
import { Config, PKG, ScanOptions } from '../../types';
import { glob } from 'fast-glob';
import { STYLELINT_IGNORE_PATTERN } from '../../utils/constants';

/**
 * 获取 stylelint 配置
 * @param options 扫描选项
 * @param pkg 项目配置
 * @param config 项目配置
 * @returns  stylelint 配置
 */
export function getStylelintConfig(options: ScanOptions, pkg: PKG, config: Config): LinterOptions {
  const { cwd, fix } = options;
  if (config.enableStylelint === false) {
    return {} as any;
  }

  const lintConfig: any = {
    fix: Boolean(fix),
    allowEmptyInput: true,
  };

  if (config.stylelintOptions) {
    // 如果用户传入了 stylelintOptions 的配置，那么就使用用户的配置
    Object.assign(lintConfig, config.stylelintOptions);
  } else {
    // 根据扫描目录下有无lintrc文件，若无则使用默认的 lint 配置
    const lintConfigFiles = glob.sync('.stylelintrc.{yaml,yml,json}', { cwd });
    if (lintConfigFiles.length > 0) {
      // 如果存在，那么就使用项目根目录下的配置文件
      lintConfig.configFile = lintConfigFiles[0];
    } else if (!pkg.stylelint) {
      lintConfig.config = {
        extends: '@juncern/stylelint-config',
      };
    }

    // 根据扫描目录下有无 lintignore 文件，若无则使用默认的 ignore 配置
    const lintIgnoreFiles = glob.sync('.stylelintignore', { cwd });
    if (lintIgnoreFiles.length > 0) {
      lintConfig.ignorePath = lintIgnoreFiles[0];
    } else {
      lintConfig.ignorePattern = STYLELINT_IGNORE_PATTERN;
    }
  }

  return lintConfig;
}
