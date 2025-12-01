/* eslint-disable no-console */
import chalk from 'chalk';
import fs from 'fs/promises';
import { callOpenAI, CallOpenAIConfig } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type TranslateResult = Record<
  string,
  {
    zh: string;
    en: string;
  }
>;

/**
 * 生成用户提示词
 * @param textList 需要翻译的文本列表
 * @returns 用户提示词
 */
async function generateUserPrompt(textList: string[]) {
  const filePath = path.resolve(__dirname, './aiTranslatePrompt.md');
  let prompt = await fs.readFile(filePath, 'utf-8');
  prompt = prompt.replace('【待翻译的列表】', `[\n${textList.join(',\n')}\n]`);
  return prompt;
}

/**
 * 调用 LLM API 进行翻译
 * @param textList 需要翻译的文本列表
 * @returns 翻译结果
 */
export async function translateI18n(textList: string[], apiKey: string) {
  console.warn(chalk.green('开始翻译...\n'));
  console.warn(chalk.green(`共需要翻译 ${textList.length} 个文本...\n`));
  const taskTimeTxt = chalk.green('翻译任务执行时间：');
  console.time(taskTimeTxt);

  const config: CallOpenAIConfig<string, TranslateResult>['aiConfig'] = {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-v3.2',
    temperature: 0.3,
    maxTokens: 4000,
    apiKey,
    systemPrompt:
      '你是一个专业的翻译专家，会严格按照格式要求进行翻译并只返回JSON结果，不会返回多余内容。结果格式为：{ [key: string]: { zh: string, en: string } }',
    generateUserPrompt,
  };

  const { resList, errList, resListOfKeepIndex } = await callOpenAI<
    string,
    TranslateResult
  >({
    argList: textList,
    aiConfig: config,
    batchSize: 100,
  });

  console.warn(
    chalk.green(
      `翻译任务执行完成，共 ${resListOfKeepIndex.length} 个任务，其中 ${resList.length} 个任务翻译成功， ${errList.length} 个任务翻译失败\n`,
    ),
  );

  console.timeEnd(taskTimeTxt);

  const translateResult: TranslateResult = {};
  for (const res of resList) {
    Object.assign(translateResult, res);
  }

  return translateResult;
}
