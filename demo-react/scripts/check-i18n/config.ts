import path from 'path';
import { I18nCheckOptions } from 'i18n-check';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 公共配置 */
export const commonConf: Pick<
  I18nCheckOptions,
  'rootDir' | 'input' | 'extractTextConf'
> = (() => {
  /** 需要检测的目录，根据需要进行修改 */
  const srcDir = path.resolve(__dirname, '../../', 'src');
  /** 包含的文件 glob 表达式 */
  const includeFiles = ['**/*.{js,jsx,ts,tsx}'];
  /** 排除的文件 glob 表达式 */
  const excludeFiles = [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.d.ts',
    '**/i18n/**',
    '**/assets/**',
    '**/types/**',
    '**/apiTypes.ts',
    '**/types.ts',
    '**/styles.ts',
    '**/style.ts',
    '**/geo/**',
  ];

  /** 匹配出 i18n.t() 包裹的文本的正则表达式 */
  const i18nRegexList = [
    /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
    /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
    /i18n\.t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
    /i18n\.tc\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
    /i18n\.tc\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
    /i18n\.tc\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
  ];

  /** 需要忽略的文本的正则表达式 */
  const ignoreTextRegexList = [
    // 忽略 console 语句中的 中文文本 不处理
    /console\.(log|warn|error)\s*\([^)]*?\);?/g,
  ];

  return {
    rootDir: srcDir,
    input: {
      includeFiles,
      excludeFiles,
    },
    extractTextConf: {
      i18nRegexList,
      ignoreTextRegexList,
    },
  };
})();
