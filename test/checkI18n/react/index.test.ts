import fs from 'fs/promises';
import { i18nCheck } from 'i18n-check';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TestI18nTextKeyListRes {
  origin: string[];
  target: string[];
}

const testI18nTextKeyListRes: Record<string, TestI18nTextKeyListRes> = {
  case1: {
    origin: [],
    target: ['账号密码错误尝试', '次'],
  },
  case2: {
    origin: ['测试测试'],
    target: ['测试测试'],
  },
  case3: {
    origin: ['测试测试'],
    target: ['测试测试'],
  },
  case4: {
    origin: ['{{param}}不能为空'],
    target: ['{{param}}不能为空', '角色'],
  },
  case5: {
    origin: [
      '键值对（key-value）结构，例如：{"ip" :"1.1.1.1","user_id " :"1"}',
    ],
    target: [
      '键值对（key-value）结构，例如：{"ip" :"1.1.1.1","user_id " :"1"}',
    ],
  },
  case6: {
    origin: [],
    target: ['成功激活/关闭，开、关。'],
  },
  case7: {
    origin: [],
    target: [],
  },
  case8: {
    origin: [],
    target: [],
  },
  case9: {
    origin: [],
    target: [],
  },
  case10: {
    origin: ['攻击数量', '中文 ${xxx}'],
    target: ['攻击数量'],
  },
  case11: {
    origin: [],
    target: [],
  },
  case12: {
    origin: [],
    target: [],
  },
  case13: {
    origin: [],
    target: [],
  },
  case14: {
    origin: [],
    target: ['成功执行 50 个动作'],
  },
  case15: {
    origin: [],
    target: ['成功执行 50 个动作，失败 2   、3 个'],
  },
  case16: {
    origin: [],
    target: [],
  },
  case17: {
    origin: [],
    target: [],
  },
  case18: {
    origin: [],
    target: ['这行应该被处理'],
  },
  case19: {
    origin: [
      '生成',
      '当前 WAF 攻击总数为 {total}{param1}。{param2}{param3}',
      '（含未知地理位置攻击{count}）',
      '中国攻击总数为 {total}',
      '其他国家攻击总数为 {total}',
    ],
    target: [
      '全局规则',
      '应用自定义规则',
      '生成',
      '当前 WAF 攻击总数为 {total}{param1}。{param2}{param3}',
      '（含未知地理位置攻击{count}）',
      '中国攻击总数为 {total}',
      '其他国家攻击总数为 {total}',
    ],
  },
};

function testWrapI18n(index: number) {
  it(`case ${index}`, async () => {
    const rootDir = path.resolve(__dirname, `case${index}`);
    const targetFile = path.resolve(rootDir, 'target.tsx');
    const res = await i18nCheck({
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
      isWriteFile: false,
    });
    const content = res.pathContentList[0].content;
    const targetContent = await fs.readFile(targetFile, 'utf-8');
    expect(content).toBe(targetContent);
  });
}

function testI18nTextKeyList(index: number) {
  it(`case ${index}`, async () => {
    const rootDir = path.resolve(__dirname, `case${index}`);
    const commonConf = {
      rootDir,
      input: {
        includeFiles: [],
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
        enable: false,
        isMarkTemplateText: false,
      },
      autoImportI18nConf: {
        enable: false,
      },
      isWriteFile: false,
    };
    // 测试 origin 文件
    const res = await i18nCheck({
      ...commonConf,
      input: {
        ...commonConf.input,
        includeFiles: ['**/origin.{js,jsx,ts,tsx}'],
      },
    });
    const i18nTextKeyList = res.i18nTextKeyList;
    const caseRes = testI18nTextKeyListRes[
      `case${index}`
    ] as TestI18nTextKeyListRes;
    const targetKeyList = new Set(caseRes.origin || []);
    expect(new Set(i18nTextKeyList)).toEqual(targetKeyList);

    // 测试 target 文件
    const res2 = await i18nCheck({
      ...commonConf,
      input: {
        ...commonConf.input,
        includeFiles: ['**/target.{js,jsx,ts,tsx}'],
      },
    });
    const i18nTextKeyList2 = res2.i18nTextKeyList;
    const targetKeyList2 = new Set(caseRes.target || []);
    expect(new Set(i18nTextKeyList2)).toEqual(targetKeyList2);
  });
}

function main() {
  describe('[React] 测试 i18nCheck', () => {
    describe(`测试包裹 i18n.t 是否正确`, () => {
      for (let i = 1; i <= 19; i++) {
        testWrapI18n(i);
      }
    });

    describe(`测试返回的 i18nTextKeyList 是否正确`, () => {
      for (let i = 1; i <= 19; i++) {
        testI18nTextKeyList(i);
      }
    });
  });
}

main();
