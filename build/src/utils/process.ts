import chalk from 'chalk';
import { spawn } from 'child_process';
import consola from 'consola';
import { projRoot } from '../path';

/**
 * 执行命令
 * @param command 命令
 * @param cwd 工作目录 默认是项目根目录
 */
export const run = async (command: string, cwd = projRoot) =>
  new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    consola.info(`运行命令: ${chalk.green(`${cmd} ${args.join(' ')}`)}`);
    const app = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    /**
     * 关闭
     */
    const onProcessExit = () => app.kill('SIGHUP');

    app.on('close', (code) => {
      process.removeListener('exit', onProcessExit);

      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`命令执行失败. \n 命令: ${command} \n 错误码: ${code}`),
        );
      }
    });
    process.on('exit', onProcessExit);
  });
