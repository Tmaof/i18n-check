import fs from 'fs/promises';
import { glob } from 'glob';
import { autoImportI18n } from './autoImportI18n';
import {
  extractTextFromContent,
  type ExtractTextRes,
  type TextItem,
} from './extractTextFromContent';
import { wrapI18n } from './wrapI18n';

export interface I18nCheckOptions {
  /** 根目录 */
  rootDir: string;
  /** 输入 */
  input: {
    /** 包含的文件 glob 表达式 */
    includeFiles: string[];
    /** 排除的文件 */
    excludeFiles: string[];
  };
  extractTextConf: {
    /** 匹配出 i18n.t() 包裹的文本的正则表达式 */
    i18nRegexList?: RegExp[];
    /** 需要忽略的文本的正则表达式 */
    ignoreTextRegexList?: RegExp[];
  };
  wrapI18nConf?: {
    /** 是否使用单引号包裹key */
    isSingleQuote?: boolean;
    /**
     * @default true
     * 是否执行包裹 i18n.t() 的操作
     */
    enable?: boolean;
    /**
     * @default 'i18n.t'
     * i18n.t() 的调用，例如 希望包裹后的文本为 i18n.t("硬件")，那i18nT就传入 i18n.t
     */
    i18nT?: string;
    /**
     * @default true
     * 像 const label = `文本 ${var1}` 这样的模版字符串不会被 i18n.t(`文本 ${var1}`) 包裹，需要手动标记处理，
     * 最好不要使用模版字符串，而使用 i18n.t('文本 {var1}', var1) 这样的方式，在搜索是否有翻译时，可以按照： “文本 {var1}” 这样的方式搜索。
     */
    isMarkTemplateText?: boolean;
    /**
     * 标记模版字符串的注释。
     * @default '\/** 此模版字符串中包含中文 *\/'
     */
    markTemplateTextComment?: string;
  };
  autoImportI18nConf?: {
    /**
     * @default true
     * 是否自动导入 i18n
     */
    enable?: boolean;
    /**
     * i18n 的导入代码。
     * @default 'import i18n from \'@/utils/i18n\';'
     */
    importCode?: string;
  };
  /**
   * @default false
   * 是否返回结果
   */
  returnResult?: boolean;
}

export interface I18nCheckRes {
  /** 被 i18n.t() 包裹的文本列表 */
  i18nTextItemList: {
    path: string;
    textItems: TextItem[];
  }[];
  /** 被 i18n.t() 包裹的文本的key列表 */
  i18nTextKeyList: string[];
  /** 模版字符串(且其中包含中文)列表 */
  templateTextItemList: {
    path: string;
    textItems: TextItem[];
  }[];
}

export interface ExtractRes {
  path: string;
  extracted: ExtractTextRes;
  content: string;
}

export interface PathContent {
  path: string;
  content: string;
}

function extractText(options: {
  pathContentList: PathContent[];
  extractTextConf: I18nCheckOptions['extractTextConf'];
}): ExtractRes[] {
  const { pathContentList, extractTextConf } = options || {};
  const extractTextList: ExtractRes[] = [];
  for (const { path, content } of pathContentList) {
    const extracted = extractTextFromContent({
      content,
      i18nRegexList: extractTextConf.i18nRegexList,
      ignoreTextRegexList: extractTextConf.ignoreTextRegexList,
    });
    extractTextList.push({
      path,
      extracted,
      content,
    });
  }
  return extractTextList;
}

function getCheckI18nRes(extractTextList: ExtractRes[]): I18nCheckRes {
  const res: I18nCheckRes = {
    i18nTextItemList: [],
    i18nTextKeyList: [],
    templateTextItemList: [],
  };

  res.i18nTextItemList = extractTextList
    .filter(({ extracted }) => extracted.i18nTextList.length > 0)
    .map(({ path, extracted }) => ({
      path,
      textItems: extracted.i18nTextList,
    }));
  res.i18nTextKeyList = Array.from(
    new Set(
      extractTextList.flatMap(({ extracted }) =>
        extracted.i18nTextList.map((item) => item.text),
      ),
    ),
  );
  res.templateTextItemList = extractTextList
    .filter(({ extracted }) => extracted.templateTextList.length > 0)
    .map(({ path, extracted }) => ({
      path,
      textItems: extracted.templateTextList,
    }));

  return res;
}

/**
 * 实现的主要功能：
 * - 检测代码中是否存在 中文文本 没有被 i18n.t() 包裹，如果存在， 可以自动添加 i18n.t() 包裹；
 * - 检测代码中是否有 i18n 的导入，如：import i18n from '@/utils/i18n'; ，如果没有，则可以自动导入
 * - 检测 i18n.t 翻译的文本是否是模版字符串，如：i18n.t(`文本文本 ${var1}`)，如果是 可以输出提示信息 提示进行手动确认是否有对应的翻译。
 * - 检测 i18n.t 的调用，获取其中的文本 key，并返回，你可以根据这些key进行翻译生成翻译配置。
 * @param options
 */
export async function i18nCheck(
  options: I18nCheckOptions,
): Promise<I18nCheckRes | undefined> {
  const { extractTextConf, wrapI18nConf, autoImportI18nConf, returnResult } =
    options || {};

  const fileList = await glob(options.input.includeFiles, {
    cwd: options.rootDir,
    absolute: true,
    ignore: options.input.excludeFiles,
  });

  let pathContentList: PathContent[] = [];
  for (const path of fileList) {
    const content = await fs.readFile(path, 'utf-8');
    pathContentList.push({
      path,
      content,
    });
  }

  // 匹配文本
  const extractTextList = extractText({
    pathContentList,
    extractTextConf,
  });

  // 包裹 i18n.t()
  if (wrapI18nConf?.enable) {
    pathContentList = wrapI18n({
      extractTextList,
      i18nT: wrapI18nConf?.i18nT,
      isMarkTemplateText: wrapI18nConf?.isMarkTemplateText,
      markTemplateTextComment: wrapI18nConf?.markTemplateTextComment,
      isSingleQuote: wrapI18nConf?.isSingleQuote,
    });
  }

  // 自动导入 i18n
  if (autoImportI18nConf?.enable) {
    pathContentList = autoImportI18n({
      pathContentList,
      importCode: autoImportI18nConf?.importCode,
      i18nT: wrapI18nConf?.i18nT,
    });
  }

  const isChange = wrapI18nConf?.enable || autoImportI18nConf?.enable;

  // 写入文件
  if (isChange) {
    for (const { path, content } of pathContentList) {
      await fs.writeFile(path, content);
    }
  }

  // 返回结果
  if (!returnResult) {
    return;
  }
  if (!isChange) {
    return getCheckI18nRes(extractTextList);
  }
  const nextExtractTextList = extractText({
    pathContentList,
    extractTextConf,
  });
  return getCheckI18nRes(nextExtractTextList);
}
