import { buildRoot } from '../path';
import { run } from './process';

import type { TaskFunction } from 'gulp';

/**
 * 给任务添加名称
 * @param name 名称
 * @param fn 任务
 */
export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name });

/**
 * 运行 gulp 任务
 * @param script 脚本
 * @param taskName gulp 任务名
 */
export const runTask = (script: string, taskName: string) =>
  withTaskName(`开始执行gulp任务：【${taskName}】`, () =>
    run(`pnpm run ${script} ${taskName}`, buildRoot),
  );
