import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import glob from 'fast-glob';
import { copy } from 'fs-extra';
import { parallel, series, TaskFunction } from 'gulp';
import { rollup, type Plugin } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import {
  checkDistCjsRoot,
  checkDistEsRoot,
  checkDistTypesRoot,
  checkPackagePath,
  checkRoot,
} from '../path';
import { runTask, withTaskName } from '../utils/gulp';
import { run } from '../utils/process';
import { generateExternal } from '../utils/rollup';

/**
 * 在 i18n-check 目录下执行命令
 * @param command 命令
 * @returns
 */
function runCheckCommand(command: string) {
  return run(command, checkRoot);
}

/**
 * 执行 i18n-check 相关的 gulp 任务
 * @param taskName gulp 任务名
 * @returns
 */
function runCheckTask(taskName: string) {
  return runTask('build:check', taskName);
}

/**
 * 获取外部依赖列表
 * @param full
 * @returns
 */
function getExternal(full?: boolean) {
  return generateExternal(checkPackagePath, full);
}

/**
 * 排除文件
 */
const excludeFiles = [
  '!**/demo/**',
  '!**/node_modules/**',
  '!**/__tests__/**',
  '!**/mock/**',
  '!**/dist/**',
  '!**/gulpfile.ts',
  '!**/rollup.config.js',
  '!**/tsconfig.json',
  `!**/build/**`,
];

const commonPlugins: Plugin[] = [
  /**
   * https://www.npmjs.com/package/@rollup/plugin-node-resolve
   * 它使用 Node 解析算法定位模块，以便将第三方模块打包到你的 bundle 中。
   */
  nodeResolve(),
  /**
   * https://www.npmjs.com/package/@rollup/plugin-commonjs
   * 将 CommonJS 模块转换为 ES 模块。rollup 默认只支持 ES 模块，所以需要这个插件。
   */
  commonjs(),

  /**
   * https://www.npmjs.com/package/rollup-plugin-esbuild
   * 这个插件为你取代了 rollup-plugin-typescript2、@rollup/plugin-typescript 和 rollup-plugin-terser。
   */
  esbuild({ sourceMap: true }),
];

/**
 * 打包组件
 */
const buildModules = async () => {
  const input = await glob(['**/*.{js,ts,tsx}', ...excludeFiles], {
    cwd: checkRoot,
    absolute: true,
    onlyFiles: true,
  });

  const bundle = await rollup({
    input,
    external: getExternal(),
    plugins: commonPlugins,
  });

  const p1 = bundle.write({
    format: 'es',
    dir: checkDistEsRoot,
    /**
     * 它会保持原始模块的文件结构,不会将所有模块打包成一个文件,这对于库来说很有用，因为它允许用户按需导入特定模块
     */
    preserveModules: true,
    /** 源代码映射 */
    sourcemap: true,
    /** 输出文件名 */
    entryFileNames: '[name].mjs',
  });

  const p2 = bundle.write({
    format: 'cjs',
    dir: checkDistCjsRoot,
    // https://www.rollupjs.com/configuration-options/#output-exports
    exports: 'named',
    /**
     * 它会保持原始模块的文件结构,不会将所有模块打包成一个文件,这对于库来说很有用，因为它允许用户按需导入特定模块
     */
    preserveModules: true,
    /** 源代码映射 */
    sourcemap: true,
    /** 输出文件名 */
    entryFileNames: '[name].js',
  });

  await Promise.all([p1, p2]);
};

/**
 * 生成类型声明文件
 */
const generateTypesDefinitions = async () => {
  // Generate .d.ts files
  await runCheckCommand('pnpm run build:types');
};

/**
 * 复制类型声明文件 到 到组件目录
 * @param done 回调函数
 */
const copyTypesDefinitions: TaskFunction = (done) => {
  const task = parallel(
    () => copy(checkDistTypesRoot, checkDistEsRoot, { recursive: true }),
    () => copy(checkDistTypesRoot, checkDistCjsRoot, { recursive: true }),
  );
  return task(done);
};

/**
 * 删除 不需要的文件夹
 */
const deleteUnnecessaryFiles: TaskFunction = (done) => {
  const task = parallel(
    () => runCheckCommand('npx rimraf dist/types'),
    () => runCheckCommand('npx rimraf dist/tsconfig.types.tsbuildinfo'),
  );
  return task(done);
};

/**
 * 默认打包流程
 */
const defaultTask = series(
  withTaskName('清理dist', () => runCheckCommand('pnpm run clean')),
  parallel(
    runCheckTask('buildModules'),
    series(
      runCheckTask('generateTypesDefinitions'),
      runCheckTask('copyTypesDefinitions'),
    ),
  ),
  runCheckTask('deleteUnnecessaryFiles'),
);

export {
  buildModules,
  copyTypesDefinitions,
  deleteUnnecessaryFiles,
  generateTypesDefinitions,
};
export default defaultTask;
