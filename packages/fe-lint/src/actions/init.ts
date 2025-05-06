import inquirer from 'inquirer';
import fs from 'fs-extra';
import { PKG_NAME, PROJECT_TYPES } from '../utils/constants';
import npmType from '../utils/npm-type';
import { InitOptions, PKG } from '../types';
import update from './update';
import log from '../utils/log';
import path from 'path';
import conflictResolve from '../utils/conflict-resolve';
import spawn from 'cross-spawn';
import generateTemplate from '../utils/generate-template';

let step = 0;

// 选择项目语言和框架类型
const chooseESlintType = async (): Promise<string> => {
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: `Step ${++step}: 请选择项目的语言（JS/TS）和框架（React/Vue）类型：`,
    choices: PROJECT_TYPES,
  });
  return type;
};

// 选择是否启用 stylelint
const chooseEnableStylelint = async (defaultValue: boolean): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}: 是否需要使用 stylelint（若没有样式文件则不需要）：`,
    default: defaultValue,
  });

  return enable;
};

// 选择是否启用 markdownlint
const chooseEnableMarkdownlint = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}: 是否需要使用 markdownlint（若没有 markdown 文件则不需要）：`,
    default: true,
  });
  return enable;
};

// 选择是否启用 prettier
const chooseEnablePrettier = async (): Promise<boolean> => {
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}: 是否需要使用 prettier（若没有代码文件则不需要）：`,
    default: true,
  });
  return enable;
};

export default async (options: InitOptions) => {
  const cwd = options.cwd || process.cwd();
  const isTest = process.env.NODE_ENV === 'test';
  const config: Record<string, any> = {};
  const { checkVersionUpdate = false, disableInstallDependencies = false } = options;
  const pkgPath = path.resolve(cwd, 'package.json');
  let pkg: PKG = fs.existsSync(pkgPath) ? fs.readJSONSync(pkgPath) : {};

  // 版本检查
  if (!isTest && checkVersionUpdate) {
    await update(false);
  }

  // 初始化 `enableESLint`，默认为 true ，无需让用户选择
  if (typeof options.enableESLint === 'boolean') {
    config.enableESLint = options.enableESLint;
  } else {
    config.enableESLint = true;
  }

  // 初始化 `eslintType`
  if (options.eslintType && PROJECT_TYPES.find((choice) => choice.value === options.eslintType)) {
    config.eslintType = options.eslintType;
  } else {
    config.eslintType = await chooseESlintType();
  }

  // 初始化 `enableStylelint`
  if (typeof options.enableStylelint === 'boolean') {
    config.enableStylelint = options.enableStylelint;
  } else {
    config.enableStylelint = await chooseEnableStylelint(!/node/.test(config.eslintType));
  }

  // 初始化 `enableMarkdownlint`
  if (typeof options.enableMarkdownlint === 'boolean') {
    config.enableMarkdownlint = options.enableMarkdownlint;
  } else {
    config.enableMarkdownlint = await chooseEnableMarkdownlint();
  }

  // 初始化 `enablePrettier`
  if (typeof options.enablePrettier === 'boolean') {
    config.enablePrettier = options.enablePrettier;
  } else {
    config.enablePrettier = await chooseEnablePrettier();
  }

  if (!isTest) {
    log.info(`Step ${++step}: 检查并处理项目中可能存在的依赖和配置冲突`);
    await conflictResolve(cwd, options.rewriteLintConfig);
    log.info(`Step ${step}: 已完成项目依赖和配置冲突检查处理 :)`);

    if(!disableInstallDependencies){
      log.info(`Step ${++step}. 安装依赖`);
      const npm = await npmType;
      spawn.sync(
        npm,
        ['i', '-D', PKG_NAME],
        { stdio: 'inherit', cwd },
      );
      log.success(`Step ${step}. 安装依赖成功 :D`);
    }
  }

  // 更新 package.json
  pkg = fs.existsSync(pkgPath)? fs.readJSONSync(pkgPath) : {};
  // 在 package.json 中写入 scripts 字段
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts[`${PKG_NAME}-scan`]) {
    pkg.scripts[`${PKG_NAME}-scan`] = `${PKG_NAME} scan`;
  }
  if (!pkg.scripts[`${PKG_NAME}-fix`]) {
    pkg.scripts[`${PKG_NAME}-fix`] = `${PKG_NAME} fix`;
  }

  // 配置 commit 卡点
  log.info(`Step ${++step}: 配置 git commit 卡点`);
  pkg.husky = pkg.husky || {};
  pkg.husky.hooks = pkg.husky.hooks || {};
  pkg.husky.hooks['pre-commit'] = `${PKG_NAME} commit-file-scan`;
  pkg.husky.hooks['commit-msg'] = `${PKG_NAME} commit-msg-scan`;
  fs.writeJSONSync(pkgPath, JSON.stringify(pkg, null, 2));
  log.success(`Step ${step}: 配置 git commit 卡点完成 :)`);

  // 写入配置文件
  log.info(`Step ${++step}: 写入配置文件`);
  generateTemplate(cwd, config);
  log.success(`Step ${step}: 写入配置文件完成 :)`);

  // 完成信息
  const logs = [`${PKG_NAME} 初始化完成 🎉`].join('\r\n');
  log.success(logs);
};
