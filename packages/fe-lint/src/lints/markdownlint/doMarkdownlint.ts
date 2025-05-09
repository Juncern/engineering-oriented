import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import markdownlint, { LintError } from 'markdownlint';
import markdownlintRuleHelper from 'markdownlint-rule-helpers';
import { Config, PKG, ScanOptions } from '../../types';
import { formatMarkdownlintResults } from './formatMarkdownlintResults';
import { getMarkdownlintConfig } from './getMarkdownlintConfig';
import { MARKDOWN_LINT_FILE_EXT, MARKDOWN_LINT_IGNORE_PATTERN } from '../../utils/constants';

export interface DoMarkdownlintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

async function formatMarkdownFile(filename: string, errors: LintError[]) {
  const fixes = errors?.filter((error) => error.fixInfo);

  if (fixes?.length) {
    const originText = await fs.readFile(filename, 'utf-8');
    const fixedText = markdownlintRuleHelper.applyFixes(originText, fixes);
    if (fixedText !== originText) {
      await fs.writeFile(filename, fixedText, 'utf-8');
      return errors.filter((error) => !error.fixInfo);
    }
  }
  return errors;
}

export async function doMarkdownlint(options: DoMarkdownlintOptions) {
  let files: string[];
  if (options.files) {
    files = options.files.filter((name) => MARKDOWN_LINT_FILE_EXT.includes(path.extname(name)));
  } else {
    const pattern = path.join(
      options.include,
      `**/*.${MARKDOWN_LINT_FILE_EXT.map((ext) => ext.slice(1)).join(',')}`,
    );
    files = await fg(pattern, {
      cwd: options.cwd,
      ignore: MARKDOWN_LINT_IGNORE_PATTERN,
    });
  }
  const results = await markdownlint.promises.markdownlint({
    files,
    config: getMarkdownlintConfig(options, options.config),
  });
  // 修复
  if (options.fix) {
    await Promise.all(
      Object.keys(results)
        .filter((filename) => Object.prototype.hasOwnProperty.call(results, filename))
        .map((filename) => formatMarkdownFile(filename, results[filename])),
    );
  }
  return formatMarkdownlintResults(results, options.quiet);
}
