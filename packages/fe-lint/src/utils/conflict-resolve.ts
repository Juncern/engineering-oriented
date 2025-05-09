import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import inquirer from 'inquirer';
import { PKG } from '../types';
import log from './log';
import { PKG_NAME } from './constants';

// 精确移除依赖
const packageNamesToRemove = [
  '@babel/eslint-parser',
  '@commitlint/cli',
  '@iceworks/spec',
  'babel-eslint',
  'eslint',
  'husky',
  'markdownlint',
  'prettier',
  'stylelint',
  'tslint',
];

// 按前缀移除依赖
const packageNamesToRemoveByPrefix = [
  '@commitlint/',
  '@typescript-eslint/',
  'eslint-',
  'stylelint-',
  'markdownlint-',
  'commitlint-',
];

/**
 * 待删除的无用配置
 * @param cwd
 */
const checkUselessConfig = (cwd: string): string[] => {
  return []
    .concat(glob.sync('.eslintrc.{yaml,yml,json}', { cwd }))
    .concat(glob.sync('.stylelintrc.{yaml,yml,json}', { cwd }))
    .concat(glob.sync('.markdownlint{rc,.{yaml,yml,json}}', { cwd }))
    .concat(glob.sync('.prettierrc.{cjs,config.js,config.cjs,yaml,yml,json,json5,toml}', { cwd }))
    .concat(glob.sync('tslint.{yaml,yml,json}', { cwd }))
    .concat(glob.sync('.kylerc.{yaml,yml,json}', { cwd }));
};

const checkRewriteConfig = (cwd: string) => {
  return glob
    .sync('**/*.ejs', { cwd: path.resolve(__dirname, '../config') })
    .map((name) => name.replace(/^_/, '.').replace(/\.ejs$/, ''))
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));
};

export default async function conflictResolve(cwd: string, isRewrite: boolean) {
  const pkgPath = path.resolve(cwd, 'package.json');
  const pkg: PKG = fs.existsSync(pkgPath) ? fs.readJSONSync(pkgPath) : {};
  const dependencies = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ];
  const willRemovePackages = dependencies.filter(
    (name) =>
      packageNamesToRemove.includes(name) ||
      packageNamesToRemoveByPrefix.some((prefix) => name.startsWith(prefix)),
  );
  const uselessConfig = checkUselessConfig(cwd);
  const rewriteConfig = checkRewriteConfig(cwd);
  const willChangeCount = willRemovePackages.length + uselessConfig.length + rewriteConfig.length;

  // 提示是否移除远配置
  if (willChangeCount) {
    log.warn(`检测到项目中存在可能与 ${PKG_NAME} 冲突的依赖和配置，为保证正常运行将`);

    if (willRemovePackages.length) {
      log.warn('删除以下依赖：');
      log.warn(JSON.stringify(willRemovePackages, null, 2));
    }

    if (uselessConfig.length) {
      log.warn('删除以下配置文件：');
      log.warn(JSON.stringify(uselessConfig, null, 2));
    }

    if (rewriteConfig.length) {
      log.warn('覆盖以下配置文件：');
      log.warn(JSON.stringify(rewriteConfig, null, 2));
    }

    if (typeof isRewrite === 'undefined') {
      const { isOverWrite } = await inquirer.prompt({
        type: 'confirm',
        name: 'isOverWrite',
        message: '请确认是否继续：',
        default: true,
      });
      if (!isOverWrite) process.exit(0);
    } else if (!isRewrite) {
      process.exit(0);
    }
  }

  // 删除配置文件
  for (const name of uselessConfig) {
    fs.removeSync(path.resolve(cwd, name));
  }

  // 修正 package.json
  delete pkg.eslintConfig;
  delete pkg.eslintIgnore;
  delete pkg.stylelint;
  for (const name of willRemovePackages) {
    delete (pkg.dependencies || {})[name];
    delete (pkg.devDependencies || {})[name];
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');

  return pkg;
}
