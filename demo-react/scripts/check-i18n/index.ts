import chalk from 'chalk';

import crypto from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { glob } from 'glob';
import { i18nCheck } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
import { commonConf } from './config';
import { translateI18n, TranslateResult } from './translate';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputTempDir = path.resolve(__dirname, 'temp');
const i18nLocalesDir = path.resolve(__dirname, '../../', 'src/i18n/locales');
const translationFilePath = path.resolve(i18nLocalesDir, 'translates.json');

if (!fs.existsSync(outputTempDir)) {
  await fsPromises.mkdir(outputTempDir, { recursive: true });
}

function shortMd5(str: string, len = 8) {
  const fullMd5 = crypto.createHash('md5').update(str, 'utf8').digest('hex');
  return fullMd5.substring(0, len); // 取前 len 位
}

/**
 *  获取已经存在的翻译结果
 */
async function getExistTranslateResult() {
  const filePathList = await glob(['**/*translateResult.json'], {
    cwd: outputTempDir,
    absolute: true,
  });

  filePathList.push(translationFilePath);

  // console.log('filePathList:', filePathList);
  const translateResult: TranslateResult = {};
  for (const filePath of filePathList) {
    const fileContent = await fsPromises.readFile(filePath, 'utf-8');
    const obj = JSON.parse(fileContent);
    Object.assign(translateResult, obj);
  }

  return translateResult;
}

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
      i18nT: 't',
      isMarkTemplateText: true,
    },
    autoImportI18nConf: {
      enable: true,
      importCode: "import { t } from 'i18next';",
    },
    isWriteFile: true,
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
 * 第二步：
 * 获取所有的 i18n.t('key') 中的 key，得到一个 i18nTextKeyList，
 * 根据 i18nTextKeyList 中的key进行翻译，生成翻译文件。
 */
async function addI18nTranslate() {
  console.warn(chalk.green('🚩 开始检查 i18n 文本...\n'));
  const res = await i18nCheck({
    ...commonConf,
    wrapI18nConf: {
      enable: false,
    },
    autoImportI18nConf: {
      enable: false,
    },
  });

  if (!res.i18nTextKeyList.length) {
    console.error(
      chalk.red('没有检测到 i18n.t() 引用，请检查代码中是否有 i18n.t() 引用。'),
    );
    return;
  }
  const hash = shortMd5(commonConf.rootDir);
  // await fsPromises.writeFile(path.resolve(outputTempDir, `${hash}-i18nTextItemList.json`), JSON.stringify(res.i18nTextItemList, null, 2));
  const textKeyListSavePath = path.resolve(
    outputTempDir,
    `${hash}-i18nTextKeyList.json`,
  );
  await fsPromises.writeFile(
    textKeyListSavePath,
    JSON.stringify(res.i18nTextKeyList, null, 2),
  );
  console.warn(chalk.green('i18n.t 检测结果已保存到：'), textKeyListSavePath);

  // 检查 是否有包含中文的模版字符串。
  console.warn(chalk.green('🚩 开始检查是否有包含中文的模版字符串 ...\n'));
  const templateTextKeyList: string[] = [];
  for (const item of res.templateTextItemList) {
    item.textItems.forEach((textItem) => {
      if (!textItem.isAllChineseInI18n) {
        templateTextKeyList.push(textItem.text);
      }
    });
  }
  if (templateTextKeyList.length) {
    console.warn(
      chalk.yellow(
        `${templateTextKeyList.length} 个文本是包含中文的模版字符串。\n`,
      ),
    );
    const templateTextKeyListSavePath = path.resolve(
      outputTempDir,
      `${hash}-templateTextKeyList.json`,
    );
    await fsPromises.writeFile(
      templateTextKeyListSavePath,
      JSON.stringify(templateTextKeyList, null, 2),
    );
    console.warn(chalk.green('结果已经保存到：'), templateTextKeyListSavePath);
    console.warn(
      chalk.yellow(
        '提示：i18n.t(key) 中的key不应是可变的，请修改后再进行翻译\n',
      ),
    );
    process.exit(1);
  }

  // 利用已经存在的翻译
  console.warn(
    chalk.green('🚩 开始获取已经存在的翻译结果，并合并到最终的结果中...\n'),
  );
  const existTranslateResult = await getExistTranslateResult();
  /** 最终的结果 */
  const finalTranslateResult: TranslateResult = {};
  const needTranslateTextKeyList: string[] = [];
  for (const key of res.i18nTextKeyList) {
    if (existTranslateResult[key]) {
      finalTranslateResult[key] = existTranslateResult[key];
    } else {
      needTranslateTextKeyList.push(key);
    }
  }
  console.warn(
    chalk.green(
      `共 ${res.i18nTextKeyList.length} 个文本，${needTranslateTextKeyList.length} 个需要翻译，其余已经存在对应翻译直接利用\n`,
    ),
  );

  console.warn(chalk.green('🚩 检查 i18n 文本完成，开始翻译...\n'));
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(
      chalk.red('LLM API Key 未配置。请使用 环境变量 API_KEY=xxxxx 配置。'),
    );
    process.exit(1);
  }
  const translateResult = await translateI18n(needTranslateTextKeyList, apiKey);
  Object.assign(finalTranslateResult, translateResult);

  const translateResultPath = path.resolve(
    outputTempDir,
    `${hash}-translateResult.json`,
  );
  await fsPromises.writeFile(
    translateResultPath,
    JSON.stringify(finalTranslateResult, null, 2),
  );
  console.warn(chalk.green('完整翻译结果已保存到：'), translateResultPath);

  // 检查 res.i18nTextKeyList 中的文本，是否有遗漏的没翻译。
  console.warn(chalk.green('🚩 开始检查是否有遗漏的没翻译的文本...\n'));
  const missingTranslateTextKeyList: string[] = [];
  for (const key of res.i18nTextKeyList) {
    if (!finalTranslateResult[key]) {
      missingTranslateTextKeyList.push(key);
    }
  }
  if (missingTranslateTextKeyList.length) {
    console.warn(
      chalk.red(
        `有 ${missingTranslateTextKeyList.length} 个文本 遗漏没翻译，请手动检查\n`,
      ),
    );
    const filePath = path.resolve(
      outputTempDir,
      `${hash}-missingTranslateTextKeyList.json`,
    );
    await fsPromises.writeFile(
      filePath,
      JSON.stringify(missingTranslateTextKeyList, null, 2),
    );
    console.warn(chalk.yellow('遗漏的没翻译的文本已保存到：'), filePath);
    return process.exit(1);
  }
  console.warn(chalk.green('没有遗漏的没翻译的文本\n'));

  // 生成翻译文件
  console.warn(chalk.green('🚩 开始生成翻译文件...\n'));
  await fsPromises.writeFile(
    translationFilePath,
    JSON.stringify(finalTranslateResult, null, 2),
  );
  console.warn(chalk.green('翻译文件已保存到：'), translationFilePath);
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

  const [type] = args;
  console.warn(
    chalk.green(`🚩 开始执行：${type}...\n工作目录为：`),
    commonConf.rootDir,
  );
  if (type === 'wrapI18n') {
    await wrapI18n();
  } else if (type === 'addI18nTranslate') {
    await addI18nTranslate();
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
