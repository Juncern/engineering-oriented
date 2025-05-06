import { execSync } from 'child_process';
import ora from 'ora';
import log from '../utils/log';
import npmType from '../utils/npm-type';
import { PKG_NAME, PKG_VERSION } from '../utils/constants';

// 检查最新版本
const checkLatestVersion = async () => {
  const npm = await npmType;
  const latestVersion = execSync(`${npm} view ${PKG_NAME} version`).toString('utf-8').trim();

  if (latestVersion === PKG_VERSION) return null;

  const compareArray = latestVersion.split('.').map(Number);
  const currentArray = PKG_VERSION.split('.').map(Number);

  // 依次比较版本号
  for (let i = 0; i < compareArray.length; i++) {
    if (compareArray[i] > currentArray[i]) {
      return latestVersion;
    }
  }
  return null;
};

/**
 * 检查包的版本
 * @param install - 自动安装最新包
 */
export default async (install = true) => {
  const checking = ora(`Checking ${PKG_NAME} version...`).start();

  try {
    const npm = await npmType;
    const latestVersion = await checkLatestVersion();
    checking.stop();

    if (latestVersion && install) {
      const update = ora(`Updating ${PKG_NAME} to ${latestVersion}...`).start();
      execSync(`${npm} install -g ${PKG_NAME}@latest`);
      update.succeed(`Updated ${PKG_NAME} to ${latestVersion}`);
    } else if (latestVersion) {
      log.warn(`New version ${latestVersion} available, please update manually`);
    } else {
      log.success(`Current version ${PKG_VERSION} is the latest`);
    }
  } catch (error) {
    checking.stop();
    log.error(error);
  }
};
