import { sync as commandExistsSync } from 'command-exists';

// npm 类型
const promise: Promise<'npm' | 'pnpm'> = new Promise((resolve) => {
  if (commandExistsSync('pnpm')) {
    resolve('pnpm');
  } else {
    resolve('npm');
  }
});

export default promise;
