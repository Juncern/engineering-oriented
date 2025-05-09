import markdownLintConfig from '@juncern/markdownlint-config';
import glob from 'glob';
import markdownlint from 'markdownlint';
import path from 'path';
import { Config, ScanOptions } from '../../types';

type LintOptions = markdownlint.Options & {
  fix?: boolean;
};

/**
 * 获取 markdownlint 配置
 * @param opts 扫描选项
 * @param config 配置
 * @returns markdownlint 配置
 */
export const getMarkdownlintConfig = (opts: ScanOptions, config: Config): LintOptions => {
  const { cwd } = opts;
  const lintConfig: LintOptions = {
    fix: Boolean(opts.fix),
    resultVersion: 3,
  };

  if (config.markdownlintOptions) {
    // 如果用户传入了 markdownlintOptions 的配置，那么就使用用户的配置
    Object.assign(lintConfig, config.markdownlintOptions);
  } else {
    // 查询项目根目录下是否存在 markdownlint 配置文件
    const lintConfigFiles = glob.sync('.markdownlint{rc,.{yaml,yml,json}}', { cwd });
    if (lintConfigFiles.length > 0) {
      // 如果存在，那么就使用项目根目录下的配置文件
      lintConfig.config = markdownlint.readConfigSync(path.resolve(cwd, lintConfigFiles[0]));
    } else {
      // 如果不存在，那么就使用默认的配置
      lintConfig.config = markdownLintConfig;
    }
  }

  return lintConfig;
}
