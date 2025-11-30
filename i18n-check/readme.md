# i18n-check

一个强大的国际化检查和处理工具，用于自动检测代码中的中文文本，并自动添加 `i18n.t()` 包裹，同时支持自动导入 i18n 模块。

## ✨ 特性

- 🔍 **智能检测**：自动检测代码中未被 `i18n.t()` 包裹的中文文本
- 🎯 **自动包裹**：自动为中文文本添加 `i18n.t()` 包裹
- 📦 **自动导入**：自动检测并导入 i18n 模块
- 🎨 **多种文本类型支持**：
  - 字符串文本（单引号、双引号）
  - 模板字符串
  - JSX 文本
- 🚫 **智能忽略**：自动忽略注释、枚举等不需要翻译的文本
- 📝 **模板字符串标记**：自动标记包含中文的模板字符串，提醒手动处理
- 🔑 **提取翻译 Key**：提取所有 `i18n.t()` 中的文本 key，用于生成翻译文件

## 📦 安装

```bash
npm install i18n-check
# 或
pnpm add i18n-check
# 或
yarn add i18n-check
```

## 🚀 快速开始

### 基本使用

```typescript
import { i18nCheck } from 'i18n-check';

await i18nCheck({
  rootDir: './src',
  input: {
    includeFiles: ['**/*.{js,jsx,ts,tsx}'],
    excludeFiles: ['**/*.test.ts', '**/*.spec.ts'],
  },
  extractTextConf: {
    i18nRegexList: [
      /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
      /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
    ],
  },
  wrapI18nConf: {
    enable: true,
    i18nT: 'i18n.t',
  },
  autoImportI18nConf: {
    enable: true,
    importCode: "import i18n from '@/utils/i18n';",
  },
});
```

### 完整示例

```typescript
import { i18nCheck } from 'i18n-check';
import path from 'path';

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

  // 是否返回结果
  returnResult: true,
});

if (result) {
  console.log('被 i18n.t 包裹的文本检测结果:', result.i18nTextItemList);
  console.log('所有 i18n.t() 中的文本 key:', result.i18nTextKeyList);
  console.log('模板字符串检测结果:', result.templateTextItemList);
}
```

## 📖 API 文档

### `i18nCheck(options: I18nCheckOptions): Promise<I18nCheckRes | undefined>`

主函数，执行国际化检查和处理。

#### 参数

##### `I18nCheckOptions`

| 属性                                   | 类型       | 必填 | 默认值                               | 说明                             |
| -------------------------------------- | ---------- | ---- | ------------------------------------ | -------------------------------- |
| `rootDir`                              | `string`   | ✅   | -                                    | 根目录路径                       |
| `input`                                | `object`   | ✅   | -                                    | 文件匹配配置                     |
| `input.includeFiles`                   | `string[]` | ✅   | -                                    | 包含的文件 glob 表达式           |
| `input.excludeFiles`                   | `string[]` | ✅   | -                                    | 排除的文件 glob 表达式           |
| `extractTextConf`                      | `object`   | ✅   | -                                    | 文本提取配置                     |
| `extractTextConf.i18nRegexList`        | `RegExp[]` | ❌   | `[]`                                 | 匹配 `i18n.t()` 的正则表达式列表 |
| `extractTextConf.ignoreTextRegexList`  | `RegExp[]` | ❌   | `[]`                                 | 需要忽略的文本正则表达式         |
| `wrapI18nConf`                         | `object`   | ❌   | -                                    | 包裹 i18n.t() 配置               |
| `wrapI18nConf.enable`                  | `boolean`  | ❌   | `true`                               | 是否启用自动包裹                 |
| `wrapI18nConf.i18nT`                   | `string`   | ❌   | `'i18n.t'`                           | i18n 调用方式                    |
| `wrapI18nConf.isSingleQuote`           | `boolean`  | ❌   | `true`                               | 是否使用单引号                   |
| `wrapI18nConf.isMarkTemplateText`      | `boolean`  | ❌   | `true`                               | 是否标记模板字符串               |
| `wrapI18nConf.markTemplateTextComment` | `string`   | ❌   | `'/** 此模版字符串中包含中文 */'`    | 标记注释                         |
| `autoImportI18nConf`                   | `object`   | ❌   | -                                    | 自动导入配置                     |
| `autoImportI18nConf.enable`            | `boolean`  | ❌   | `true`                               | 是否启用自动导入                 |
| `autoImportI18nConf.importCode`        | `string`   | ❌   | `"import i18n from '@/utils/i18n';"` | 导入语句                         |
| `returnResult`                         | `boolean`  | ❌   | `false`                              | 是否返回结果                     |

#### 返回值

##### `I18nCheckRes`

| 属性                   | 类型                                             | 说明                              |
| ---------------------- | ------------------------------------------------ | --------------------------------- |
| `i18nTextItemList`     | `Array<{ path: string; textItems: TextItem[] }>` | 被 `i18n.t()` 包裹的文本列表      |
| `i18nTextKeyList`      | `string[]`                                       | 被 `i18n.t()` 包裹的文本 key 列表 |
| `templateTextItemList` | `Array<{ path: string; textItems: TextItem[] }>` | 模板字符串（且其中包含中文）列表  |

## 🎯 使用场景

### 场景 1：自动包裹中文文本

```typescript
// 处理前
const title = '欢迎使用';

// 处理后
const title = i18n.t('欢迎使用');
```

### 场景 2：自动包裹 JSX 文本

```typescript
// 处理前
<div>欢迎使用</div>

// 处理后
<div>{ i18n.t('欢迎使用') }</div>
```

### 场景 3：自动导入 i18n

```typescript
// 处理前
const title = i18n.t('欢迎使用');

// 处理后
import i18n from '@/utils/i18n';
const title = i18n.t('欢迎使用');
```

### 场景 4：标记模板字符串

```typescript
// 处理前
const text = `文本 ${version}`;

// 处理后
/** 此模版字符串中包含中文 */ const text = `文本 ${version}`;
```

## 📝 注意事项

1. **模板字符串处理**：对于包含变量的模板字符串（如 `` `文本 ${var1}` ``），工具会自动添加注释标记。建议手动将其改为 `i18n.t('文本 {var1}', { var1 })` 的形式。

2. **手动检查**：自动包裹完成后，建议手动检查所有 `i18n.t()` 包裹是否符合预期，特别是：
   - 模板字符串的处理
   - 复杂表达式的处理
   - 动态文本的处理

3. **翻译 Key 提取**：使用 `returnResult: true` 可以获取所有翻译 key，用于生成翻译文件。

4. **文件备份**：建议在执行自动包裹前备份代码，或使用版本控制系统。

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
  returnResult: true, // 返回检查结果
});

// 根据结果手动处理
console.log('未包裹的文本:', result?.i18nTextItemList);
```

## 📚 相关导出

除了主函数 `i18nCheck`，库还导出了以下工具函数：

- `extractTextFromContent`: 从代码内容中提取文本
- `wrapI18n`: 包裹 i18n.t()
- `autoImportI18n`: 自动导入 i18n

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 👤 作者

maofu.tian

---

**注意**：此工具会直接修改源文件，使用前请确保已备份代码或使用版本控制系统。
