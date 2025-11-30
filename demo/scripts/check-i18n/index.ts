import chalk from 'chalk';

import { i18nCheck } from 'i18n-check';
import { commonConf } from './config';

/**
 * 第一步：
 * 给 srcDir 目录下的中文文本 包裹 i18n.t()。
 * 执行完成后，需要 手动检查 包裹的 i18n.t() 是否符合预期，不符合预期的进行手动修改。
 * 对于 模版字符串的形式，如： `${var1} 模版字符串`，需要写成 i18n.t('{var1} 模版字符串', { var1: '值1'}) 这样的方式。
 */
async function wrapI18n() {
  console.warn(chalk.green('🚩 开始包裹 i18n.t()...\n'));
  await i18nCheck({
    ...commonConf,
    wrapI18nConf: {
      enable: true,
      i18nT: 'i18n.t',
      isMarkTemplateText: true,
    },
    autoImportI18nConf: {
      enable: true,
      importCode: "import i18n from '@/utils/i18n';",
    },
    returnResult: false,
  });
  console.warn(chalk.green('包裹 i18n.t() 完成\n'));
  console.warn(
    chalk.yellow(
      '提示：请手动检查 包裹的 i18n.t() 是否符合预期，不符合预期的进行手动修改。确认所有i18n.t()符合预期后再进行翻译操作。\n',
    ),
  );
  console.warn(
    chalk.yellow(
      '提示：对于 模版字符串的形式，如： `${var1} 模版字符串`，需要写成 i18n.t("{var1} 模版字符串", { var1: "值1"}) 这样的方式。\n',
    ),
  );
}

/**
 * 实现的主要功能：
 * - 检测代码中是否存在 中文文本 没有被 i18n.t() 包裹，如果存在， 可以自动添加 i18n.t() 包裹；
 * - 检测代码中是否有 i18n 的导入，如：import i18n from '@/utils/i18n'; ，如果没有，则可以自动导入
 * - 检测 i18n.t 翻译的文本是否是模版字符串，如：i18n.t(`文本 ${var1}`)，如果是 可以输出提示信息 提示进行手动确认是否有对应的翻译。
 * - 检测 i18n.t 的调用，获取其中的文本 key，进行翻译，生成翻译文件。
 * 使用：
 * 根据需要，修改 commonConf 中的 srcDir 为需要检测的目录，然后执行 tsx scripts/check-i18n/index.ts <wrapI18n | addI18nTranslate>
 * @param options
 */
async function main() {
  // console.log('process.argv:', process.argv);
  const args = process.argv.slice(2); // 跳过 node 和脚本路径

  if (args.length < 1) {
    console.error(
      chalk.red(
        '用法: tsx scripts/check-i18n/index.ts <wrapI18n | addI18nTranslate>',
      ),
    );
    process.exit(1);
  }

  const type = args[0];
  console.warn(
    chalk.green(`🚩 开始执行：${type}...\n工作目录为：`),
    commonConf.rootDir,
  );
  if (type === 'wrapI18n') {
    await wrapI18n();
  } else if (type === 'addI18nTranslate') {
    // TODO: 添加 i18n 翻译
    //   await addI18nTranslate();
  } else {
    console.error(chalk.red('可用类型: wrapI18n, addI18nTranslate'));
    process.exit(1);
  }
  console.warn(
    chalk.green(`${type} 执行完成\n工作目录为：`),
    commonConf.rootDir,
  );
}

main();
