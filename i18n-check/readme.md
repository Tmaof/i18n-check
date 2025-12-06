# i18n-check

一个国际化检查和处理工具，用于自动检测代码中的中文文本，并自动添加 `i18n.t()` 包裹，同时支持自动导入 i18n 模块和AI翻译处理。

## Demo

下面是使用该工具的一些demo项目：

| 框架  | 项目地址                                                             |
| ----- | -------------------------------------------------------------------- |
| React | [仓库地址](https://github.com/Tmaof/i18n-check/tree/main/demo-react) |
| Vue   | [仓库地址](https://github.com/Tmaof/i18n-check/tree/main/demo-vue3)  |

## ✨ 特性

- 🔍 **检测中文文本**：自动检测代码中未被 `i18n.t()` 包裹的中文文本
  - 字符串文本（单引号、双引号）
  - 模板字符串
  - JSX 文本
- 🎯 **自动包裹**：自动为中文文本添加 `i18n.t()` 包裹
- 📦 **自动导入**：自动检测并导入 i18n 模块
- 🚫 **智能忽略**：自动忽略注释、枚举等不需要翻译的文本
- 📝 **模板字符串标记**：自动标记包含中文的模板字符串，提醒手动处理
- 🔑 **提取翻译 Key**：提取所有 `i18n.t()` 中的文本 key，用于生成翻译文件
- 🤖 **AI 批量翻译**：支持调用 LLM API 进行批量翻译处理，支持分批和并发控制

## 📦 安装

```bash
npm install i18n-check
# 或
pnpm add i18n-check
# 或
yarn add i18n-check
```

## 🚀 快速开始

```typescript
import { i18nCheck } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const result = await i18nCheck({
  // 根目录
  rootDir: path.resolve(__dirname, './src'),

  // 文件匹配配置
  input: {
    // 包含的文件
    includeFiles: ['**/*.{js,jsx,ts,tsx}'],
    // 排除的文件
    excludeFiles: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts', '**/i18n/**'],
  },

  // 文本提取配置
  extractTextConf: {
    // 匹配 i18n.t() 的正则表达式列表
    i18nRegexList: [
      /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
      /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
      /i18n\.t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
    ],
    // 需要忽略的文本正则表达式
    ignoreTextRegexList: [/console\.(log|warn|error)\s*\([^)]*?\);?/g],
  },

  // 包裹 i18n.t() 配置
  wrapI18nConf: {
    enable: true, // 是否启用自动包裹
    i18nT: 'i18n.t', // i18n 调用方式
    isSingleQuote: true, // 是否使用单引号
    isMarkTemplateText: true, // 是否标记模板字符串
    markTemplateTextComment: '/** 此模版字符串中包含中文 */', // 标记注释
  },

  // 自动导入 i18n 配置
  autoImportI18nConf: {
    enable: true, // 是否启用自动导入
    importCode: "import i18n from '@/utils/i18n';", // 导入语句
  },

  // 是否写入文件
  isWriteFile: false, // 是否将包裹和导入操作写入原文件
});

console.log('处理后的文件内容列表:', result.pathContentList);
console.log('被 i18n.t 包裹的文本检测结果:', result.i18nTextItemList);
console.log('所有 i18n.t() 中的文本 key:', result.i18nTextKeyList);
console.log('模板字符串检测结果:', result.templateTextItemList);
```

## 🎯 使用场景

### 场景 1：自动包裹中文文本

例子1：

```typescript
// 处理前
const title = '欢迎使用';

// 处理后
const title = i18n.t('欢迎使用');
```

例子2：

```typescript
// 处理前
<div>欢迎使用</div>

// 处理后
<div>{ i18n.t('欢迎使用') }</div>
```

### 场景 2：标记模板字符串

```typescript
// 处理前
const text = `文本 ${version}`;

// 处理后
/** 此模版字符串中包含中文 */ const text = `文本 ${version}`;
```

### 场景 3：自动导入 i18n

```typescript
// 处理前
const title = i18n.t('欢迎使用');

// 处理后
import i18n from '@/utils/i18n';
const title = i18n.t('欢迎使用');
```

### 场景 4：AI 批量翻译

```typescript
import { callOpenAI } from 'i18n-check';

// 批量翻译文本列表
const textList = ['欢迎使用', '登录', '退出'];

const result = await callOpenAI({
  argList: textList,
  batchSize: 50, // 每批处理 50 条
  maxConcurrent: 10, // 最大并发数 10
  aiConfig: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 2000,
    apiKey: process.env.OPENAI_API_KEY!,
    systemPrompt: '你是一个专业的翻译助手，请将中文翻译成英文。',
    generateUserPrompt: (textList) => {
      return `请将以下中文文本翻译成英文，返回 JSON 格式：\n${JSON.stringify(textList, null, 2)}`;
    },
  },
});

console.log('翻译结果:', result.resList);
```

## 📝 注意事项

1. **模板字符串处理**：对于包含变量的模板字符串（如 `` `文本 ${var1}` ``），工具会自动添加注释标记。建议手动将其改为 `i18n.t('文本 {var1}', { var1 })` 的形式。

2. **手动检查**：自动包裹完成后，建议手动检查所有 `i18n.t()` 包裹是否符合预期，特别是：
   - 模板字符串的处理
   - 复杂表达式的处理
   - 动态文本的处理

3. **翻译 Key 提取**：函数返回值中包含 `i18nTextKeyList`，可以获取所有翻译 key，用于生成翻译文件。

4. **文件备份**：建议在执行自动包裹前备份代码，或使用版本控制系统。

## ⚠️ 已知限制

该工具基于正则匹配进行内容处理，以下情况无法正常包裹 `i18n.t()`，需要在处理完成后手动进行检查和修正：

### 例子 1：函数参数默认值中的对象属性

**原内容：**

```typescript
export const ActiveDeactivateButtons = ({
  activeText = '激活',
  deactivateText = '退出',
  onActivate,
  onDeactivate
}: {
  activeText?: string;
  deactivateText?: string;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  return (
    <div>
    </div>
  );
};
```

**处理后（错误）：**

```typescript
export const ActiveDeactivateButtons = ({
  activeText = i18n.t('激活'),
  deactivateText = { i18n.t('退出') },  // ❌ 错误：不应该有花括号
  onActivate,
  onDeactivate
}: {
  activeText?: string;
  deactivateText?: string;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  return (
    <div>
    </div>
  );
};
```

**正确结果应为：**

```typescript
export const ActiveDeactivateButtons = ({
  activeText = i18n.t('激活'),
  deactivateText = i18n.t('退出'),  // ✅ 正确
  onActivate,
  onDeactivate
}: {
  activeText?: string;
  deactivateText?: string;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  return (
    <div>
    </div>
  );
};
```

### 例子 2：条件语句中的赋值

**原内容：**

```typescript
let title = '';
if (true) {
  title = '哈哈哈';
}
```

**处理后（错误）：**

```typescript
let title = '';
if(true){
  title = { i18n.t('哈哈哈') }  // ❌ 错误：不应该有花括号
}
```

**正确结果应为：**

```typescript
let title = '';
if (true) {
  title = i18n.t('哈哈哈'); // ✅ 正确
}
```

### 例子 3：JSX 文本在字符串中

**原内容：**

```tsx
<div className="code-line indent">
  <span className="code-property">name</span>:{' '}
  <span className="code-string">'开发者'</span>,
</div>
```

**处理后（错误）：**

```tsx
<div className="code-line indent">
  <span className="code-property">name</span>:{' '}
  <span className="code-string">t('开发者')</span>, // ❌
  错误：不应该直接调用函数
</div>
```

**正确结果应为：**

```tsx
<div className="code-line indent">
  <span className="code-property">name</span>:{' '}
  <span className="code-string">{i18n.t('开发者')}</span>, // ✅ 正确：需要使用
  JSX 表达式
</div>
```

## 📖 API 文档

### `i18nCheck(options: I18nCheckOptions): Promise<I18nCheckRes>`

主函数，执行国际化检查和处理。

#### 参数

##### `I18nCheckOptions`

| 属性                                   | 类型       | 必填 | 默认值                               | 说明                                       |
| -------------------------------------- | ---------- | ---- | ------------------------------------ | ------------------------------------------ |
| `rootDir`                              | `string`   | ✅   | -                                    | 根目录路径                                 |
| `input`                                | `object`   | ✅   | -                                    | 文件匹配配置                               |
| `input.includeFiles`                   | `string[]` | ✅   | -                                    | 包含的文件 glob 表达式                     |
| `input.excludeFiles`                   | `string[]` | ✅   | -                                    | 排除的文件 glob 表达式                     |
| `extractTextConf`                      | `object`   | ✅   | -                                    | 文本提取配置                               |
| `extractTextConf.i18nRegexList`        | `RegExp[]` | ❌   | 见下                                 | 匹配 `i18n.t()` 的正则表达式列表           |
| `extractTextConf.jsxChineseRegex`      | `RegExp`   | ❌   | 见下                                 | 匹配出没有被引号包裹的中文字符的正则表达式 |
| `extractTextConf.ignoreTextRegexList`  | `RegExp[]` | ❌   | `[]`                                 | 需要忽略的文本正则表达式                   |
| `wrapI18nConf`                         | `object`   | ❌   | -                                    | 包裹 i18n.t() 配置                         |
| `wrapI18nConf.enable`                  | `boolean`  | ❌   | `true`                               | 是否启用自动包裹                           |
| `wrapI18nConf.i18nT`                   | `string`   | ❌   | `'i18n.t'`                           | i18n 调用方式                              |
| `wrapI18nConf.isSingleQuote`           | `boolean`  | ❌   | `true`                               | 是否使用单引号                             |
| `wrapI18nConf.isMarkTemplateText`      | `boolean`  | ❌   | `true`                               | 是否标记模板字符串                         |
| `wrapI18nConf.markTemplateTextComment` | `string`   | ❌   | `'/** 此模版字符串中包含中文 */'`    | 标记注释                                   |
| `autoImportI18nConf`                   | `object`   | ❌   | -                                    | 自动导入配置                               |
| `autoImportI18nConf.enable`            | `boolean`  | ❌   | `true`                               | 是否启用自动导入                           |
| `autoImportI18nConf.importCode`        | `string`   | ❌   | `"import i18n from '@/utils/i18n';"` | 导入语句                                   |
| `isWriteFile`                          | `boolean`  | ❌   | `false`                              | 包裹操作和自动导入操作是否写入原文件       |

- `extractTextConf.i18nRegexList` 的默认值：

```
[
  // 注意：我们用 [,)] 而不是 $，就是为了支持 i18n.t('xxx', ...) 这种多参数形式。
  /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
  /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
  /i18n\.t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
]
```

- `extractTextConf.jsxChineseRegex` 的默认值：

```
/[\u4e00-\u9fa5][\u4e00-\u9fa5a-zA-Z.，？！“”‘’；、,;!?'"（）【】/-]*[\u4e00-\u9fa5。]/g
```

#### 返回值

##### `I18nCheckRes`

| 属性                   | 类型                                             | 说明                                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| `pathContentList`      | `Array<{ path: string; content: string }>`       | 处理后的文件内容列表                     |
| `i18nTextItemList`     | `Array<{ path: string; textItems: TextItem[] }>` | 被 `i18n.t()` 包裹的文本列表             |
| `i18nTextKeyList`      | `string[]`                                       | 被 `i18n.t()` 包裹的文本 key 列表        |
| `templateTextItemList` | `Array<{ path: string; textItems: TextItem[] }>` | 模板字符串（且其中包含中文）列表         |
| `extractList`          | `ExtractRes[]`                                   | 对文件内容进行文本 匹配提取 后的结果列表 |

### `callOpenAISingle<R>(config: CallOpenAISingleConfig<R>): Promise<R>`

调用 LLM API 进行单次处理。

#### 参数

##### `CallOpenAISingleConfig<R>`

| 属性                 | 类型                               | 必填 | 默认值                      | 说明                                      |
| -------------------- | ---------------------------------- | ---- | --------------------------- | ----------------------------------------- |
| `baseURL`            | `string`                           | ✅   | -                           | LLM API 的基础 URL                        |
| `model`              | `string`                           | ✅   | -                           | 使用的模型名称                            |
| `temperature`        | `number`                           | ✅   | -                           | 控制生成文本的随机性（0-1，值越高越随机） |
| `maxTokens`          | `number`                           | ✅   | -                           | 生成的最大 token 数                       |
| `userPrompt`         | `string`                           | ✅   | -                           | 用户提示词                                |
| `systemPrompt`       | `string`                           | ✅   | -                           | 系统提示词                                |
| `apiKey`             | `string`                           | ✅   | -                           | API Key                                   |
| `timeout`            | `number`                           | ❌   | `120000`                    | 超时时间（毫秒）                          |
| `resolveLLMResponse` | `(response: LLMResponseBody) => R` | ❌   | `defaultResolveLLMResponse` | 解析 LLM 响应的函数                       |

#### 返回值

返回解析后的结果，类型为 `R`。

### `callOpenAI<T, R>(config: CallOpenAIConfig<T, R>): Promise<{ resList: R[]; errList: Error[]; resListOfKeepIndex: (R | Error)[] }>`

调用 LLM API 进行批量处理，支持分批和并发控制。

#### 参数

##### `CallOpenAIConfig<T, R>`

| 属性                          | 类型                                                    | 必填 | 默认值 | 说明                 |
| ----------------------------- | ------------------------------------------------------- | ---- | ------ | -------------------- |
| `argList`                     | `T[]`                                                   | ✅   | -      | 待处理的参数列表     |
| `aiConfig`                    | `Omit<CallOpenAISingleConfig<R>, 'userPrompt'> & {...}` | ✅   | -      | AI 配置              |
| `aiConfig.generateUserPrompt` | `(shardedArgList: T[]) => string \| Promise<string>`    | ✅   | -      | 生成用户提示词的函数 |
| `batchSize`                   | `number`                                                | ❌   | `50`   | 每批处理的数量       |
| `maxConcurrent`               | `number`                                                | ❌   | `10`   | 最大并发数           |

#### 返回值

| 属性                 | 类型             | 说明                         |
| -------------------- | ---------------- | ---------------------------- |
| `resList`            | `R[]`            | 成功的结果列表（按完成顺序） |
| `errList`            | `Error[]`        | 错误列表                     |
| `resListOfKeepIndex` | `(R \| Error)[]` | 保持原始索引的结果列表       |

### `multiRequest<T, R>(argList: T[], task: Function, maxNum?: number): Promise<{ resList: R[]; errList: Error[]; resListOfKeepIndex: (R \| Error)[] }>`

并发处理工具函数，用于控制并发数量。

#### 参数

| 属性      | 类型                                                                       | 必填 | 默认值 | 说明             |
| --------- | -------------------------------------------------------------------------- | ---- | ------ | ---------------- |
| `argList` | `T[]`                                                                      | ✅   | -      | 待处理的参数列表 |
| `task`    | `(arg: T, index: number, count: number, total: number) => R \| Promise<R>` | ✅   | -      | 处理任务的函数   |
| `maxNum`  | `number`                                                                   | ❌   | `5`    | 最大并发数       |

#### 返回值

与 `callOpenAI` 相同。

## 🔧 高级用法

### 自定义 i18n 调用方式

```typescript
await i18nCheck({
  // ... 其他配置
  wrapI18nConf: {
    enable: true,
    i18nT: 't', // 如果使用 t('text') 而不是 i18n.t('text')
  },
});
```

### 自定义导入语句

```typescript
await i18nCheck({
  // ... 其他配置
  autoImportI18nConf: {
    enable: true,
    importCode: "import { t } from 'i18next';",
  },
});
```

### 只检查不修改

```typescript
const result = await i18nCheck({
  // ... 其他配置
  wrapI18nConf: {
    enable: false, // 不自动包裹
  },
  autoImportI18nConf: {
    enable: false, // 不自动导入
  },
  isWriteFile: false, // 不写入文件，只返回检查结果
});

// 根据结果手动处理
console.log('i18n.t 包裹的文本:', result.i18nTextItemList);
console.log('处理后的文件内容:', result.pathContentList);
```

### AI 批量翻译

#### 单次调用

```typescript
import { callOpenAISingle } from 'i18n-check';

const result = await callOpenAISingle({
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.3,
  maxTokens: 2000,
  apiKey: process.env.OPENAI_API_KEY!,
  systemPrompt: '你是一个专业的翻译助手。',
  userPrompt: '请将"欢迎使用"翻译成英文',
  timeout: 120000, // 超时时间（毫秒）
});

console.log('翻译结果:', result);
```

#### 批量调用（推荐）

```typescript
import { callOpenAI } from 'i18n-check';

const textList = ['欢迎使用', '登录', '退出'];

const result = await callOpenAI({
  argList: textList,
  batchSize: 50, // 每批处理数量
  maxConcurrent: 10, // 最大并发数
  aiConfig: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 2000,
    apiKey: process.env.OPENAI_API_KEY!,
    systemPrompt: '你是一个专业的翻译助手，请将中文翻译成英文。',
    generateUserPrompt: (shardedArgList) => {
      return `请将以下中文文本翻译成英文，返回 JSON 格式数组：\n${JSON.stringify(shardedArgList, null, 2)}`;
    },
    // 自定义响应解析（可选）
    resolveLLMResponse: (response) => {
      const content = response.choices[0].message.content.trim();
      // 解析 JSON 并返回
      return JSON.parse(content);
    },
  },
});

// 处理结果
console.log('成功结果:', result.resList);
console.log('错误列表:', result.errList);
console.log('保持索引的结果:', result.resListOfKeepIndex);
```

## 📚 相关导出

除了主函数 `i18nCheck`，库还导出了以下工具函数：

- `extractTextFromContent`: 从代码内容中提取文本
- `wrapI18n`: 包裹 i18n.t()
- `autoImportI18n`: 自动导入 i18n
- `callOpenAISingle`: 调用 LLM API 进行单次处理
- `callOpenAI`: 调用 LLM API 进行批量处理（支持分批和并发）
- `multiRequest`: 并发处理工具函数
- `defaultResolveLLMResponse`: 默认解析 LLM 响应（提取 JSON 内容）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📋 更新日志

版本更新记录请查看 [CHANGELOG.md](https://github.com/Tmaof/i18n-check/blob/fa9de68bdfdded62827e88a95842e89b6338686e/i18n-check/CHANGELOG.md)。

## 📄 许可证

MIT

---

**注意**：此工具会直接修改源文件，使用前请确保已备份代码或使用版本控制系统。
