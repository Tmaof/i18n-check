import fs from 'fs/promises';
import { i18nCheck } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startTest(index: number) {
  it(`case ${index}`, async () => {
    const rootDir = path.resolve(__dirname, `case${index}`);
    const originFile = path.resolve(rootDir, 'origin.tsx');
    const targetFile = path.resolve(rootDir, 'target.tsx');
    await i18nCheck({
      rootDir,
      input: {
        includeFiles: ['**/origin.{js,jsx,ts,tsx}'],
        excludeFiles: [],
      },
      extractTextConf: {
        i18nRegexList: [
          /t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
          /t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
          /t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
        ],
        ignoreTextRegexList: [
          // 忽略 console 语句中的 中文文本 不处理
          /console\.(log|warn|error)\s*\([^)]*?\);?/g,
        ],
      },
      wrapI18nConf: {
        enable: true,
        i18nT: 't',
        isMarkTemplateText: true,
      },
      autoImportI18nConf: {
        enable: true,
        importCode: "import { t } from 'i18next';",
      },
      returnResult: false,
    });
    const originContent = await fs.readFile(originFile, 'utf-8');
    const targetContent = await fs.readFile(targetFile, 'utf-8');
    expect(originContent).toBe(targetContent);
  });
}

function main() {
  describe(`测试 i18nCheck (React)`, () => {
    for (let i = 1; i <= 10; i++) {
      startTest(i);
    }
  });
}

main();
