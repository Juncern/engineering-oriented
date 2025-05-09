import glob from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';
import { ScanOptions } from '../../types';
import { PRETTIER_FILE_EXT, PRETTIER_IGNORE_PATTERN } from '../../utils/constants';

const formatFile = async (filepath: string) => {
  const text = await fs.readFile(filepath, 'utf-8');
  const options = await prettier.resolveConfig(filepath);
  const formatted = prettier.format(text, { ...options, filepath });
  await fs.writeFile(filepath, formatted, 'utf-8');
};

export const doPrettier = async (options: ScanOptions) => {
  const { cwd, include } = options;

  let files: string[] = [];
  if (options.files) {
    files = options.files.filter((name) => PRETTIER_FILE_EXT.includes(path.extname(name)));
  } else {
    const pattern = path.join(
      include,
      `**/*.${PRETTIER_FILE_EXT.map((ext) => ext.slice(1)).join(',')}`,
    );
    files = await glob(pattern, {
      cwd,
      ignore: PRETTIER_IGNORE_PATTERN,
    });
  }
  await Promise.all(files.map(formatFile));
};
