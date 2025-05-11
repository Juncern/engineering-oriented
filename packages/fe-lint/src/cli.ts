#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import glob from 'glob';
import spawn from 'cross-spawn';
import { execSync } from 'child_process';

import init from './actions/init';
import update from './actions/update';
import scan from './actions/scan';
import log from './utils/log';
import printReport from './utils/print-report';
import npmType from './utils/npm-type';
import { getCommitFiles, getAmendFiles } from './utils/git';
import generateTemplate from './utils/generate-template';
import { PKG_NAME, PKG_VERSION } from './utils/constants';

const cwd = process.cwd();

const installDepsIfThereNo = async () => {
  const lintConfigFiles = [].concat(
    glob.sync('.eslintrc.{yaml,yml,json}', { cwd }),
    glob.sync('.stylelintrc.{yaml,yml,json}', { cwd }),
    glob.sync('.markdownlint.{yaml,yml,json}', { cwd }),
  );
  const nodeModulesPath = path.resolve(cwd, 'node_modules');

  if (!fs.existsSync(nodeModulesPath) && lintConfigFiles.length > 0) {
    const npm = await npmType;
    log.info(`使用项目 Lint 配置，检测到项目未安装依赖，将进行安装（执行 ${npm} install）`);
    execSync(`cd ${cwd} && ${npm} install`, { stdio: 'inherit' });
  }
};

program
  .version(PKG_VERSION, '-v, --version')
  .description(
    `${PKG_NAME} 是一个用于管理前端项目 Lint 配置的工具。提供简单的 CLI 和 Node.js API，让项目能够一键接入、一键扫描、一键修复、一键升级，并为项目配置 git commit 卡点，降低项目实施规范的成本`,
  );

program
  .command('init')
  .description('一键接入：为项目初始化规范工具和配置，可以根据项目类型和需求进行定制')
  .option('--vscode', '写入.vscode/settings.json配置')
  .action(async (cmd) => {
    if (cmd.vscode) {
      const configPath = path.resolve(cwd, 'fe-lint.config.js');
      generateTemplate(cwd, require(configPath), true);
    } else {
      await init({
        cwd,
        checkVersionUpdate: true,
      });
    }
  });

program
  .command('update')
  .description(`更新 ${PKG_NAME} 至最新版本`)
  .action(() => update(true));

program
  .command('scan')
  .description('一键扫描：对项目进行代码规范问题扫描')
  .option('-q, --quiet', '仅报告错误信息 - 默认：false')
  .option('-o, --output-report', '输出扫描出的规范问题日志')
  .option('-i, --include <dirpath>', '指定要进行规范扫描的目录')
  .option('--no-ignore', '忽略 eslint 的 ignore 配置文件和 ignore 规则')
  .action(async (cmd) => {
    await installDepsIfThereNo();

    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码检查`);

    const { results, errorCount, warningCount, runErrors } = await scan({
      cwd,
      fix: false,
      include: cmd.include || cwd,
      quiet: Boolean(cmd.quiet),
      outputReport: Boolean(cmd.outputReport),
      ignore: cmd.ignore, // 对应 --no-ignore
    });
    let type = 'succeed';
    if (errorCount > 0 || warningCount > 0) {
      type = 'fail';
    } else if (runErrors.length > 0) {
      type = 'warn';
    }

    checking[type](`执行 ${PKG_NAME} 代码检查完成`);
    if (results.length > 0) {
      printReport(results, false);
    }

    // 输出 lint 运行错误
    runErrors.forEach((error) => {
      console.log(error);
    });
  });

program
  .command('fix')
  .description('一键修复：自动修复项目的代码规范问题')
  .option('-i, --include <dirpath>', '指定要进行修复扫描的目录')
  .option('--no-ignore', '忽略 eslint 的 ignore 配置文件和 ignore 规则')
  .action(async (cmd) => {
    await installDepsIfThereNo();

    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码修复`);

    const { results } = await scan({
      cwd,
      fix: true,
      include: cmd.include || cwd,
      ignore: cmd.ignore, // 对应 --no-ignore
    });

    checking.succeed(`执行 ${PKG_NAME} 代码修复完成`);
    if (results.length > 0) {
      printReport(results, true);
    }
  });

program
  .command('commit-msg-scan')
  .description('commit  message 检查：git commit 时检查 commit message 是否符合规范')
  .action(async () => {
    const result = spawn.sync('commitlint', ['-E', 'HUSKY_GIT_PARAMS'], {
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      process.exit(result.status);
    }
  });

program
  .command('pre-commit-scan')
  .description('pre-commit 检查：git commit 前检查代码是否符合规范')
  .action(async (cmd) => {
    await installDepsIfThereNo();

    // git add 检查
    const files = getAmendFiles();
    if (files) {
      log.warn(`[${PKG_NAME}] change not staged for commit: \n${files}\nPlease`);
    }

    const checking = ora();
    checking.start(`执行 ${PKG_NAME} 代码提交检查`);

    const { results, errorCount, warningCount } = await scan({
      cwd,
      include: cwd,
      quiet: !cmd.strict,
      files: await getCommitFiles(),
    });

    if (errorCount > 0 || (cmd.strict && warningCount > 0)) {
      checking.fail(`执行 ${PKG_NAME} 代码提交检查失败`);
      printReport(results, false);
      process.exitCode = 1;
    } else {
      checking.succeed(`执行 ${PKG_NAME} 代码提交检查完成`);
    }
  });

program.parse(process.argv);
