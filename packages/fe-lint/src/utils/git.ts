import execa from 'execa';

/**
 * 获取此次 commit 修改的文件列表
 * @param options
 * @returns
 */
export const getCommitFiles = async (options: execa.Options = {}): Promise<string[]> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff',
        '--staged', // 比较 暂缓区 与 last commit 的差别
        '--diff-filter=ACMR', // 只显示 added、copied、modified、renamed
        '--name-only', // 只显示更改文件的名称
        '--ignore-submodules',
      ],
      {
        ...options,
        all: true,
        cwd: options.cwd || process.cwd(),
      },
    );

    return stdout ? stdout.split(/\s/).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
};

/**
 * 获取未 add 的文件列表
 * @param options
 * @returns
 */
export const getAmendFiles = async (options: execa.Options = {}): Promise<string> => {
  try {
    const { stdout } = await execa(
      'git',
      [
        'diff', // 比较 工作区 与 缓存区 的差别
        '--name-only', // 只显示更改文件的名称
      ],
      {
        ...options,
        all: true,
        cwd: options.cwd || process.cwd(),
      },
    );

    return stdout;
  } catch (error) {
    return '';
  }
};
