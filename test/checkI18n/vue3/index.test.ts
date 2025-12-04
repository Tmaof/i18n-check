import fs from 'fs/promises';
import { i18nCheck } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startTest(index: number) {
  it(`case ${index}`, async () => {
    const rootDir = path.resolve(__dirname, `case${index}`);
    const originFile = path.resolve(rootDir, 'origin.vue');
    const targetFile = path.resolve(rootDir, 'target.vue');
    await i18nCheck({
      rootDir,
      input: {
        includeFiles: ['**/origin.vue'],
        excludeFiles: [],
      },
      extractTextConf: {
        i18nRegexList: [
          /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
          /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
          /i18n\.t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
        ],
        ignoreTextRegexList: [
          // 忽略 console 语句中的 中文文本 不处理
          /console\.(log|warn|error)\s*\([^)]*?\);?/g,
        ],
      },
      wrapI18nConf: {
        enable: true,
        i18nT: 'i18n.t',
        isMarkTemplateText: true,
      },
      autoImportI18nConf: {
        enable: true,
        importCode: "import i18n from '@/i18n';",
      },
      returnResult: false,
    });
    const originContent = await fs.readFile(originFile, 'utf-8');
    const targetContent = await fs.readFile(targetFile, 'utf-8');
    expect(originContent).toBe(targetContent);
  });
}

function main() {
  describe(`测试 i18nCheck (Vue3)`, () => {
    for (let i = 1; i <= 2; i++) {
      startTest(i);
    }
  });
}

main();
