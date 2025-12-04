import axios, { type AxiosResponse } from 'axios';
import chalk from 'chalk';

export interface LLMRequestBody {
  model: string;
  messages: Message[];
  max_tokens: number;
  temperature: number;
  [key: string]: unknown;
}

interface Message {
  role: string;
  content: string;
}

export interface LLMResponseBody {
  id: string;
  object: string;
  created: number;
  choices: Choice[];
  usage: Usage;
}

interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CallOpenAISingleConfig<R> {
  baseURL: string;
  /** 使用的模型名称 */
  model: string;
  /** 控制生成文本的随机性（0-1，值越高越随机） */
  temperature: number;
  /** 生成的最大 token 数 */
  maxTokens: number;
  userPrompt: string;
  systemPrompt: string;
  /**
   * @default 120000
   * 超时时间，单位：毫秒，默认 120000
   */
  timeout?: number;
  apiKey: string;
  /** 解析 LLM 响应，返回结果 */
  resolveLLMResponse?: (response: LLMResponseBody) => R;
}

/** 默认解析 LLM 响应，返回结果 */
export function defaultResolveLLMResponse<R>(response: LLMResponseBody): R {
  const content = response.choices[0].message.content.trim();

  // 提取 JSON 内容（处理可能的 markdown 代码块）
  let jsonStr = content;
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    [jsonStr] = jsonMatch;
  } else {
    // 尝试匹配不带 json 标记的代码块
    const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      [jsonStr] = codeMatch;
    }
  }

  const result = JSON.parse(jsonStr);
  return result;
}

/**
 * 调用 LLM API 进行单次处理
 */
export async function callOpenAISingle<R>(
  config: CallOpenAISingleConfig<R>,
): Promise<R> {
  const {
    apiKey,
    timeout = 120000,
    resolveLLMResponse = defaultResolveLLMResponse,
    baseURL,
    systemPrompt,
    userPrompt,
    maxTokens,
    ...resetConfig
  } = config;

  if (!apiKey) {
    throw new Error('LLM API Key 未配置。');
  }

  try {
    const response = await axios.post<
      LLMRequestBody,
      AxiosResponse<LLMResponseBody>
    >(
      `${baseURL}/chat/completions`,
      {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        ...resetConfig,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout,
      },
    );

    return resolveLLMResponse(response.data);
    // eslint-disable-next-line
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `LLM API 调用失败: ${error.response.status} ${
          error.response.statusText
        }\n${JSON.stringify(error.response.data, null, 2)}`,
      );
    } else if (error.request) {
      throw new Error('LLM API 请求失败: 无响应。请检查网络连接和 API 地址。');
    } else {
      throw new Error(`LLM API 调用错误: ${error.message}`);
    }
  }
}

/**
 * 并发处理
 * @param argList 参数列表
 * @param  task 接收参数，执行任务的函数
 * @param maxNum 并发限制数量
 * @returns
 */
export function multiRequest<T, R>(
  argList: T[],
  task: (arg: T, index: number, count: number, total: number) => R | Promise<R>,
  maxNum = 5,
): Promise<{
  resList: R[];
  errList: Error[];
  resListOfKeepIndex: (R | Error)[];
}> {
  return new Promise((resolve) => {
    /** 下一个需要执行的任务的参数位置 */
    let index = 0;
    /** 记录已经完成的任务数量 */
    let count = 0;
    /** 结果列表 */
    const resList: R[] = [];
    const resListOfKeepIndex: (R | Error)[] = [];
    const errList: Error[] = [];

    /**
     * 开启一条任务线：
     * 执行 一个任务，当该 任务执行完毕，再尝试执行下一个任务
     */
    const request = () => {
      if (index >= argList.length) {
        // 没有任务了，不执行
        return;
      }
      /** 记录当前任务使用的参数索引，方便保存结果 */
      const curIndex = index;
      index++; // 任务参数索引加一

      const arg = argList[curIndex];
      // 执行任务
      const promise = Promise.resolve(arg).then((arg) =>
        task(arg, curIndex, count, argList.length),
      ); // task 可能不是异步的，这里统一一下
      promise
        .then((res) => {
          // 保存结果
          resListOfKeepIndex[curIndex] = res;
          resList.push(res);
        })
        .catch((err) => {
          // 错误处理，可以按照需要修改
          resListOfKeepIndex[curIndex] = new Error(err);
          errList.push(err);
        })
        .finally(() => {
          // 判断 是否所有任务执行完毕
          count++;
          if (count === argList.length) {
            return resolve({
              resList,
              errList,
              resListOfKeepIndex,
            });
          }
          // 再尝试执行下一个任务
          request();
        });
    };

    // 根据变量控制并发数
    maxNum = Math.min(maxNum, argList.length);
    for (let i = 0; i < maxNum; i++) {
      request();
    }
  });
}

export interface CallOpenAIConfig<T, R> {
  argList: T[];
  aiConfig: Omit<CallOpenAISingleConfig<R>, 'userPrompt'> & {
    /** 传入分批处理后的参数列表，返回用户提示词 */
    generateUserPrompt: (shardedArgList: T[]) => string | Promise<string>;
    [key: string]: unknown;
  };
  /** 将 argList 分批处理，每批的大小 */
  batchSize?: number;
  /** 并发数 */
  maxConcurrent?: number;
}

/**
 * 调用 LLM API 进行批量处理
 */
export async function callOpenAI<T, R>(
  config: CallOpenAIConfig<T, R>,
): Promise<{
  resList: R[];
  errList: Error[];
  resListOfKeepIndex: (R | Error)[];
}> {
  const { argList, aiConfig, batchSize = 50, maxConcurrent = 10 } = config;
  if (argList.length === 0) {
    return {
      resList: [],
      errList: [],
      resListOfKeepIndex: [],
    };
  }
  // 分批处理
  const batches: T[][] = [];
  for (let i = 0; i < argList.length; i += batchSize) {
    batches.push(argList.slice(i, i + batchSize));
  }

  console.warn(chalk.green(`将分 ${batches.length} 个任务进行处理...\n`));

  async function task(item: T[], index: number) {
    console.warn(chalk.green(`开始处理索引为 ${index} 的任务\n`));
    const userPrompt = await aiConfig.generateUserPrompt(item);
    const res = await callOpenAISingle<R>({
      ...aiConfig,
      userPrompt,
    });
    return res;
  }

  const res = await multiRequest<T[], R>(batches, task, maxConcurrent); // 并发数为 10

  return res;
}
