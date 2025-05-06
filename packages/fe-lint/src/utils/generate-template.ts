import fs from 'fs-extra';
import { glob } from 'glob';
import _ from 'lodash';
import path from 'path';
import ejs from 'ejs';
import {
  ESLINT_IGNORE_PATTERN,
  STYLELINT_FILE_EXT,
  STYLELINT_IGNORE_PATTERN,
  MARKDOWN_LINT_IGNORE_PATTERN,
} from './constants';

const mergeVSCodeConfig = (filepath: string, content: string) => {
  // 不需要 merge
  if (!fs.existsSync(filepath)) return content;

  try {
    const vscodeConfig = fs.readJSONSync(filepath);
    const newConfig = JSON.parse(content);
    return JSON.stringify(
      _.mergeWith(vscodeConfig, newConfig, (target, source) => {
        if (Array.isArray(target) && Array.isArray(source)) {
          return _.uniq([...target, ...source]);
        }
      }),
      null,
      2,
    );
  } catch (error) {
    return '';
  }
};

export default (cwd: string, data: Record<string, any>, vscode?: boolean) => {
  const templatePath = path.resolve(__dirname, '../config');
  const templates = glob.sync(`${vscode ? '_vscode' : '**'}/*.ejs`, { cwd: templatePath });
  for (const name of templates) {
    const filePath = path.resolve(cwd, name.replace(/^_/, '.').replace(/\.ejs$/, ''));
    let content = ejs.render(fs.readFileSync(path.resolve(templatePath, name), 'utf-8'), {
      eslintIgnores: ESLINT_IGNORE_PATTERN,
      stylelintExt: STYLELINT_FILE_EXT,
      stylelintIgnores: STYLELINT_IGNORE_PATTERN,
      markdownLintIgnores: MARKDOWN_LINT_IGNORE_PATTERN,
      ...data,
    });

    // 合并 vscode 配置
    if (/^_vscode/.test(name)) {
      content = mergeVSCodeConfig(filePath, content);
    }

    // 跳过空文件
    if (!content.trim()) continue;

    // 写入文件
    fs.outputFileSync(filePath, content);
  }
};
