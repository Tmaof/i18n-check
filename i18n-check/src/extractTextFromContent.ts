export enum TextItemType {
  /** 字符串类型：单引号，双引号字符 */
  valueText = 'valueText',
  /** 模版字符串类型 */
  templateText = 'templateText',
  /** 没有被引号包裹的中文文本类型 */
  jsxText = 'jsxText',
  /** 注释，被忽略的文本类型 */
  noteText = 'noteText',
  /** i18n.t('xxx') 类型 */
  i18nText = 'i18nText',
}

export interface TextItem {
  /** 类型 */
  type: TextItemType;
  /** 匹配出来的完整文本 */
  fullText: string;
  /** 匹配出来的文本，不包含引号，如：无限制 */
  text: string;
  /** 是否是模板字符串 */
  isTemplate: boolean;
  /** 是否是模板字符串且有变量${xxx} */
  isTemplateHasVar: boolean;
  /** 行号 */
  row: number;
  /** 列号 */
  column: number;
  /** text 在 字符串中的 开始索引 */
  startIndex: number;
  /** text 在 字符串中的 结束索引 */
  endIndex: number;
  /** fullText 在 字符串中的 开始索引 */
  start: number;
  /** fullText 在 字符串中的 结束索引 */
  end: number;
  /** 是否被 i18n.t() 包裹 */
  isInI18n: boolean;
  /** 是否所有中文都在 i18n 中; 仅 字符串类型 有此属性 */
  isAllChineseInI18n?: boolean;
}

export interface i18nTextListType extends TextItem {
  type: TextItemType.i18nText;
}

export interface noteTextListType extends TextItem {
  type: TextItemType.noteText;
}

export interface templateTextListType extends TextItem {
  type: TextItemType.templateText;
}

export interface valueTextListType extends TextItem {
  type: TextItemType.valueText;
}

export interface jsxTextListType extends TextItem {
  type: TextItemType.jsxText;
}

export interface ExtractTextRes {
  i18nTextList: i18nTextListType[];

  noteTextList: noteTextListType[];

  templateTextList: templateTextListType[];

  valueTextList: valueTextListType[];

  jsxTextList: jsxTextListType[];
}

export type RangeList = { start: number; end: number }[];

/**
 * 从代码内容中匹配出所有需要的文本
 */
export function extractTextFromContent(options?: {
  content: string;
  i18nRegexList?: RegExp[];
  ignoreTextRegexList?: RegExp[];
  jsxChineseRegex?: RegExp;
  disableNextLineFlag?: string;
}): ExtractTextRes {
  const {
    i18nRegexList = [
      // 注意：我们用 [,)] 而不是 $，就是为了支持 i18n.t('xxx', ...) 这种多参数形式。
      /i18n\.t\s*\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
      /i18n\.t\s*\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
      /i18n\.t\s*\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
    ],
    content = '',
    ignoreTextRegexList = [],
    jsxChineseRegex = /[\u4e00-\u9fa5][-/\u4e00-\u9fa5a-zA-Z0-9\x20.;!?'"，。“”‘’（）【】、？！；]*[\u4e00-\u9fa5。]/g,
    disableNextLineFlag = 'i18n-disable-next-line',
  } = options || {};

  const disableNextLineFlagRows = getDisableNextLineFlagRows(
    content,
    disableNextLineFlag,
  );
  /** 禁用检查的行号列表 */
  const disableLineRows = disableNextLineFlagRows.map((row) => row + 1);

  // 1. 匹配注释文本，忽略的文本
  const { noteTextList, noteIndexSet } = matchNoteText(
    content,
    ignoreTextRegexList,
  );

  // 2. 匹配i18n文本
  const { i18nTextList, i18nIndexSet } = matchI18nText(content, i18nRegexList);

  // 3. 匹配模板字符串
  const { templateTextList, templateIndexSet } = matchTemplateText(
    content,
    noteIndexSet,
    i18nIndexSet,
    disableLineRows,
  );

  // 4. 匹配普通字符串
  const { valueTextList, valueIndexSet } = matchValueText(
    content,
    noteIndexSet,
    i18nIndexSet,
    disableLineRows,
  );

  // 5. 匹配JSX文本，没有被引号包裹的中文字符
  const jsxTextList = matchJsxText(
    content,
    [...noteIndexSet, ...valueIndexSet, ...templateIndexSet],
    i18nIndexSet,
    jsxChineseRegex,
    disableLineRows,
  );

  return {
    i18nTextList,
    noteTextList,
    templateTextList,
    valueTextList,
    jsxTextList,
  };
}

/**
 * 获取禁用下一行检查的标记的行号
 * @param content 内容
 * @param disableNextLineFlag 禁用下一行检查的标记
 * @returns 禁用下一行检查的标记的行号
 */
function getDisableNextLineFlagRows(
  content: string,
  disableNextLineFlag: string,
) {
  const rows: number[] = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(disableNextLineFlag)) {
      rows.push(i + 1);
    }
  }
  return rows;
}

/**
 * 匹配注释文本，忽略的文本
 */
export function matchNoteText(
  content: string,
  ignoreTextRegexList: RegExp[] = [],
): {
  noteTextList: ExtractTextRes['noteTextList'];
  noteIndexSet: RangeList;
} {
  const noteTextList: ExtractTextRes['noteTextList'] = [];
  const noteIndexSet: RangeList = [];

  // 单行注释正则
  const singleLineNoteRegex = /\/\/([^\n]*)/g;
  // 多行注释正则
  const multiLineNoteRegex = /\/\*[\s\S]*?\*\//g;
  // 匹配 HTML/Vue 模板中的注释文本内容
  const htmlNoteRegex = /<!--[\s\S]*?-->/g;
  // 枚举文本正则，枚举中的中文需要忽略
  const enumTextRegex = /(?:export\s+)?enum\s+\w+\s*\{[^}]*\}/g;
  // 忽略：value === '是' ，中的文本不翻译
  const equalsTextRegex = [
    /===\s*'[^']*'/g,
    /===\s*"[^"]*"/g,
    /!==\s*'[^']*'/g,
    /!==\s*"[^"]*"/g,
    /==\s*'[^']*'/g,
    /==\s*"[^"]*"/g,
    /!=\s*'[^']*'/g,
    /!=\s*"[^"]*"/g,
  ];

  const list = [
    singleLineNoteRegex,
    multiLineNoteRegex,
    htmlNoteRegex,
    enumTextRegex,
    ...equalsTextRegex,
    ...ignoreTextRegexList,
  ];

  for (const regex of list) {
    helper(regex);
  }
  function helper(regex: RegExp) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const fullMatch = match[0];

      if (fullMatch) {
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;
        const { row, column } = getPosition(content, startIndex);

        noteTextList.push({
          type: TextItemType.noteText,
          fullText: fullMatch, // 包含注释符号的完整文本
          text: fullMatch, // 包含注释符号的完整文本
          isTemplate: false,
          isTemplateHasVar: false,
          row,
          column,
          startIndex,
          endIndex,
          start: startIndex,
          end: endIndex,
          isInI18n: false,
        });

        // 记录注释的索引范围
        noteIndexSet.push({ start: startIndex, end: endIndex });
      }
    }
  }

  return { noteTextList, noteIndexSet };
}

/**
 * 匹配i18n.t()文本
 */
export function matchI18nText(
  content: string,
  i18nRegexList: RegExp[],
): {
  i18nTextList: ExtractTextRes['i18nTextList'];
  i18nIndexSet: RangeList;
} {
  const i18nTextList: ExtractTextRes['i18nTextList'] = [];
  const i18nIndexSet: RangeList = [];

  // 匹配 i18n.t('text') 或 i18n.t(`text`) 或 i18n.t("text")
  for (const i18nRegex of i18nRegexList) {
    helper(i18nRegex);
  }
  function helper(i18nRegex: RegExp) {
    let match;
    while ((match = i18nRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      let keyContent = match[1];
      // 如果 keyContent 为空，则 尝试 匹配出 keyContent，如：i18n.t('key') 中的 key
      if (!keyContent) {
        const regexList = [
          /\(\s*'((?:[^'\\\n\r]|\\.)*?)'\s*[,)]/g,
          /\(\s*"((?:[^"\\\n\r]|\\.)*?)"\s*[,)]/g,
          /\(\s*`((?:[^`\\\n\r]|\\.)*?)`\s*[,)]/g,
        ];
        for (const regex of regexList) {
          const match = regex.exec(fullMatch);
          if (match) {
            keyContent = match[1];
            break;
          }
        }
      }

      if (keyContent) {
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;
        const textStartIndex = startIndex + fullMatch.indexOf(keyContent);
        const textEndIndex = textStartIndex + keyContent.length;
        const { row, column } = getPosition(content, textStartIndex);

        const isTemplate =
          content[textStartIndex - 1] === '`' &&
          content[textEndIndex + 1] === '`';
        const isTemplateHasVar = isTemplate && /\$\{.*?\}/.test(fullMatch);

        i18nTextList.push({
          type: TextItemType.i18nText,
          fullText: fullMatch,
          text: keyContent,
          isTemplate,
          isTemplateHasVar,
          row,
          column,
          startIndex: textStartIndex,
          endIndex: textEndIndex,
          start: startIndex,
          end: endIndex,
          isInI18n: true,
        });

        // 记录i18n文本的索引范围
        // i18nIndexSet.push({ start: textStartIndex, end: textEndIndex });
        i18nIndexSet.push({ start: startIndex, end: endIndex });
      }
    }
  }

  return { i18nTextList, i18nIndexSet };
}

/**
 * 匹配模板字符串
 */
export function matchTemplateText(
  content: string,
  noteIndexSet: RangeList,
  i18nIndexSet: RangeList,
  disableLineRows: number[],
): {
  templateTextList: ExtractTextRes['templateTextList'];
  templateIndexSet: RangeList;
} {
  const templateTextList: ExtractTextRes['templateTextList'] = [];
  const templateIndexSet: RangeList = [];

  // 匹配模板字符串
  const templateMatches = extractTemplateLiterals(content);
  for (const templateMatch of templateMatches) {
    const {
      content: fullMatch,
      start: startIndex,
      end: endIndex,
    } = templateMatch;
    const textContent = fullMatch.slice(1, -1); // 去掉开头的 ` 和结尾的 `

    const { isContains, indexList } = containsChinese(fullMatch);
    if (textContent && isContains) {
      const textStartIndex = startIndex + 1; // 跳过开始的 `
      const textEndIndex = endIndex - 1; // 跳过结束的 `
      const { row, column } = getPosition(content, textStartIndex);

      if (disableLineRows.includes(row)) {
        continue;
      }

      if (isInRange(textStartIndex, textEndIndex, noteIndexSet)) {
        continue;
      }

      // 检查是否所有中文都在 i18n 中
      let isAllChineseInI18n = true;
      for (const index of indexList) {
        const chineseIndex = startIndex + index;
        if (!isInRange(chineseIndex, chineseIndex, i18nIndexSet)) {
          isAllChineseInI18n = false;
          break;
        }
      }

      const isInI18n = isInRange(startIndex, endIndex, i18nIndexSet);

      templateTextList.push({
        type: TextItemType.templateText,
        fullText: fullMatch,
        isTemplate: true,
        text: textContent,
        isInI18n,
        isAllChineseInI18n,
        row,
        column,
        startIndex: textStartIndex,
        endIndex: textEndIndex,
        isTemplateHasVar: /\$\{.*?\}/.test(textContent),
        start: startIndex,
        end: endIndex,
      });

      templateIndexSet.push({ start: startIndex, end: endIndex });
    }
  }

  return {
    templateTextList,
    templateIndexSet,
  };
}

/**
 * 匹配普通字符串
 */
export function matchValueText(
  content: string,
  noteIndexSet: RangeList,
  i18nIndexSet: RangeList,
  disableLineRows: number[],
): {
  valueTextList: ExtractTextRes['valueTextList'];
  valueIndexSet: RangeList;
} {
  const valueTextList: ExtractTextRes['valueTextList'] = [];
  const valueIndexSet: RangeList = [];

  // 匹配单引号字符串
  const singleQuoteRegex = /'([^'\n\r\\]*)'/g;
  // 匹配双引号字符串
  const doubleQuoteRegex = /"([^"\n\r\\]*)"/g;

  const list = [singleQuoteRegex, doubleQuoteRegex];

  for (const regex of list) {
    helper(regex);
  }

  function helper(regex: RegExp) {
    let match;

    while ((match = regex.exec(content)) !== null) {
      const fullMatch = match[0];
      const textContent = match[1];

      const { isContains, indexList } = containsChinese(fullMatch);
      if (textContent && isContains) {
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;
        const textStartIndex = startIndex + 1; // 跳过开始的 '
        const textEndIndex = endIndex - 1; // 跳过结束的 '
        const { row, column } = getPosition(content, textStartIndex);

        if (disableLineRows.includes(row)) {
          continue;
        }

        if (isInRange(textStartIndex, textEndIndex, noteIndexSet)) {
          continue;
        }

        // 检查是否所有中文都在 i18n 中
        let isAllChineseInI18n = true;
        for (const index of indexList) {
          const chineseIndex = startIndex + index;
          if (!isInRange(chineseIndex, chineseIndex, i18nIndexSet)) {
            isAllChineseInI18n = false;
            break;
          }
        }

        const isInI18n = isInRange(startIndex, endIndex, i18nIndexSet);

        valueTextList.push({
          type: TextItemType.valueText,
          fullText: fullMatch,
          isTemplate: false,
          isTemplateHasVar: false,
          text: textContent,
          isInI18n,
          isAllChineseInI18n,
          row,
          column,
          startIndex: textStartIndex,
          endIndex: textEndIndex,
          start: startIndex,
          end: endIndex,
        });

        valueIndexSet.push({ start: startIndex, end: endIndex });
      }
    }
  }

  return {
    valueTextList,
    valueIndexSet,
  };
}

/**
 * 匹配JSX文本（没有被引号包裹的中文字符）
 */
export function matchJsxText(
  content: string,
  excludeIndexSet: RangeList,
  i18nIndexSet: RangeList,
  jsxChineseRegex: RegExp,
  disableLineRows: number[],
): ExtractTextRes['jsxTextList'] {
  const jsxTextList: ExtractTextRes['jsxTextList'] = [];

  // 匹配 一段连续的中文的文本，提取所有“以中文为主”的连续文本段，允许其中包含常见标点、英文、数字、路径符号等
  // const chineseRegex =  /[\u4e00-\u9fa5][\u4e00-\u9fa5\w\s]*[\u4e00-\u9fa5]|[\u4e00-\u9fa5]/g;

  let match;
  while ((match = jsxChineseRegex.exec(content)) !== null) {
    const textContent = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + textContent.length;
    const { row, column } = getPosition(content, startIndex);

    if (disableLineRows.includes(row)) {
      continue;
    }

    // 检查是否在注释中
    // 检查是否在字符串中（单引号、双引号、模板字符串）
    if (isInRange(startIndex, endIndex, excludeIndexSet)) {
      continue;
    }

    const isInI18n = isInRange(startIndex, endIndex, i18nIndexSet);

    jsxTextList.push({
      type: TextItemType.jsxText,
      fullText: textContent,
      isTemplate: false,
      isTemplateHasVar: false,
      text: textContent,
      isInI18n,
      row,
      column,
      startIndex,
      endIndex,
      start: startIndex,
      end: endIndex,
    });
  }

  return jsxTextList;
}

/**
 * 根据索引获取行号和列号
 */
export function getPosition(
  content: string,
  index: number,
): { row: number; column: number } {
  const lines = content.substring(0, index).split('\n');
  const row = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { row, column };
}

/**
 * 检查给定的索引范围是否在指定的范围集合内
 */
export function isInRange(
  start: number,
  end: number,
  rangeSet: RangeList,
): boolean {
  for (const range of rangeSet) {
    if (start >= range.start && end <= range.end) {
      return true;
    }
  }
  return false;
}

/**
 * 检查是否包含中文字符，并返回中文在字符串中的位置
 */
export function containsChinese(text: string): {
  isContains: boolean;
  indexList: number[];
} {
  const indexList: number[] = [];
  const regex = /[\u4e00-\u9fa5]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    indexList.push(match.index);
  }
  return {
    isContains: indexList.length > 0,
    indexList,
  };
}

export interface TemplateMatch {
  content: string; // 完整的模板字符串内容（含反引号）
  start: number; // 在原文中的起始索引（含开头的 `）
  end: number; // 在原文中的结束索引（含结尾的 `）
}

/**
 * 能正确提取所有最外层的模板字符串（包括内部有嵌套模板字符串的情况）
 * @param code 代码字符串
 * @returns 模板字符串匹配结果
 */
// eslint-disable-next-line
export function extractTemplateLiterals(code: string): TemplateMatch[] {
  const matches: TemplateMatch[] = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === '`') {
      const start = i;
      i++; // skip opening `
      let depth = 1; // 当前模板字符串嵌套深度（用于处理表达式中的嵌套模板字面量）

      while (i < code.length && depth > 0) {
        // 处理转义字符（虽然反引号不能被转义，但保留通用性）
        if (code[i] === '\\' && i + 1 < code.length) {
          i += 2;
          continue;
        }

        // 遇到反引号：尝试闭合当前层
        if (code[i] === '`') {
          i++; // consume the closing `
          depth--;
          if (depth === 0) {
            const end = i; // end 是闭合反引号之后的位置
            matches.push({
              content: code.slice(start, end),
              start,
              end,
            });
          }
          continue;
        }

        // 遇到插值 ${...}
        if (code[i] === '$' && i + 1 < code.length && code[i + 1] === '{') {
          i += 2; // skip ${
          let braceCount = 1;

          // 在插值表达式内部解析，直到匹配到对应的 }
          while (i < code.length && braceCount > 0) {
            // 跳过转义
            // eslint-disable-next-line
            if (code[i] === '\\' && i + 1 < code.length) {
              i += 2;
              continue;
            }

            // 如果遇到字符串字面量，跳过整个字符串（避免误判内部的 { } 或 `）
            // eslint-disable-next-line
            if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
              const quote = code[i];
              i++;
              // eslint-disable-next-line
              while (i < code.length) {
                // eslint-disable-next-line
                if (code[i] === '\\') {
                  i += 2;
                  continue;
                }
                // eslint-disable-next-line
                if (code[i] === quote) {
                  i++;
                  break;
                }
                i++;
              }
              continue;
            }

            // 匹配花括号层级
            // eslint-disable-next-line
            if (code[i] === '{') {
              braceCount++;
            } else if (code[i] === '}') {
              braceCount--;
            }
            i++;
          }
          continue;
        }

        i++;
      }
    } else {
      i++;
    }
  }

  return matches;
}
