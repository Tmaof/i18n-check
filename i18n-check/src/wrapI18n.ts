import {
  type ExtractTextRes,
  type TextItem,
  TextItemType,
} from './extractTextFromContent';

/**
 * 添加 i18n.t 包裹
 */
export function wrapI18n(options: {
  extractTextList: {
    path: string;
    extracted: ExtractTextRes;
    content: string;
  }[];
  i18nT?: string;
  isMarkTemplateText?: boolean;
  markTemplateTextComment?: string;
  isSingleQuote?: boolean;
}): { path: string; content: string }[] {
  const {
    extractTextList,
    i18nT,
    isMarkTemplateText,
    markTemplateTextComment,
    isSingleQuote,
  } = options || {};

  const result: { path: string; content: string }[] = [];

  for (const { path, extracted, content } of extractTextList) {
    const newContent = wrapTextWithI18n({
      content,
      extracted,
      i18nT,
      isMarkTemplateText,
      markTemplateTextComment,
      isSingleQuote,
    });

    result.push({
      path,
      content: newContent,
    });
  }
  return result;
}

/**
 * 功能：
 * -收集未包裹的文本：从三种文本列表中过滤出isInI18n为false的项，并添加类型标记
 * -位置排序：按照startIndex从小到大排序，确保替换顺序正确
 * -倒序替换：从后往前替换，避免替换过程中位置信息发生变化
 * -类型化替换：
 * valueText："中文" → i18n.t("中文")
 * templateText：`中文` → i18n.t(`中文`)
 * jsxText：中文 → { i18n.t('中文') }
 * @param content 代码内容
 * @param extracted 提取的文本信息
 * @param i18nT i18n的调用，例如 希望包裹后的文本为 i18n.t("中文")，那i18nT就传入 i18n.t
 * @returns 包裹后的代码内容
 */
export function wrapTextWithI18n(options: {
  content: string;
  extracted: ExtractTextRes;
  i18nT?: string;
  isMarkTemplateText?: boolean;
  markTemplateTextComment?: string;
  isSingleQuote?: boolean;
}): string {
  const {
    content,
    extracted,
    i18nT = 'i18n.t',
    isSingleQuote = true,
    isMarkTemplateText = true,
    markTemplateTextComment = '/** 此模版字符串中包含中文 */',
  } = options || {};
  // 收集所有未被 i18n 包裹的文本, 模板字符串在i18n.t 里面的加进来，需要标记处理
  const unwrappedItems: TextItem[] = [];

  // 处理三种类型的文本
  const lists = [
    extracted.valueTextList,
    extracted.templateTextList,
    extracted.jsxTextList,
  ];

  for (const list of lists) {
    list.forEach((item) => {
      if (item.type === TextItemType.templateText) {
        // 这种情况不需要处理：  `${i18n.t('中文')} <br /> <span></span>`
        // 这种要处理：i18n.t(`中文 ${xxx}`)
        if (!item.isInI18n && item.isAllChineseInI18n) {
          return;
        }
      } else if (item.isInI18n || item.isAllChineseInI18n) {
        return;
      }
      unwrappedItems.push(item);
    });
  }

  // 按位置排序
  unwrappedItems.sort((a, b) => a.start - b.start);

  // 倒序替换
  let newContent = content;
  for (let i = unwrappedItems.length - 1; i >= 0; i--) {
    const item = unwrappedItems[i];
    newContent = replaceItemWithI18n(newContent, item);
  }

  function replaceItemWithI18n(content: string, item: TextItem): string {
    const before = content.substring(0, item.start);
    const after = content.substring(item.end);
    const quote = isSingleQuote ? "'" : '"';

    switch (item.type) {
      case TextItemType.valueText:
        return replaceValueText();

      case TextItemType.templateText:
        if (isMarkTemplateText) {
          const overlap = getLongestOverlap(item.fullText, after);
          if (overlap) {
            return `${
              before
            }${markTemplateTextComment} ${item.fullText.replace(overlap, '')}${
              after
            }`;
          }
          return `${before}${markTemplateTextComment} ${item.fullText}${after}`;
        }
        return content;

      case TextItemType.jsxText:
        return `${before}{ ${i18nT}(${quote}${item.fullText}${quote}) }${after}`;

      default:
        return content;
    }

    function replaceValueText(): string {
      // 获取该行 和上一行 的内容，如果中文字符串 左边第一个非空白字符是 = 号，但是没有 声明变量的 let,const,var，那么就认为该字符是被赋值给了 jsx 的一个属性，包裹时使用：{ i18n.t() }
      const str = getContentByRows(item.row - 1, item.row, content);
      const i = str.lastIndexOf(item.fullText);
      let isEqualSign = false;
      let equalSignIndex = -1;
      for (let j = i - 1; j >= 0; j--) {
        const char = str[j];
        if (/\s/.test(char)) {
          continue;
        } else if (char === '=') {
          isEqualSign = true;
          equalSignIndex = j;
          break;
        } else {
          break;
        }
      }
      if (isEqualSign) {
        const left = str.substring(0, equalSignIndex);
        if (!/let|const|var/.test(left)) {
          return `${before}{ ${i18nT}(${quote}${item.text}${quote}) }${after}`;
        }
      }

      return `${before}${i18nT}(${quote}${item.text}${quote})${after}`;
    }
  }

  return newContent;
}

/**
 * 获取指定行号之间的内容
 * @param startRow 开始行号
 * @param endRow 结束行号
 * @param content
 * @returns 指定行号之间的内容
 */
export function getContentByRows(
  startRow: number,
  endRow: number,
  content: string,
): string {
  const lines = content.split('\n');
  let result = '';
  for (let i = startRow; i <= endRow; i++) {
    result += `${lines[i - 1]}\n`;
  }
  return result;
}

/**
 * 获取字符串1的结尾与字符串2的开头之间的最长公共重叠部分
 * @param str1 前一个字符串
 * @param str2 后一个字符串
 * @returns 最长公共重叠子串（若无则返回空字符串）
 */
export function getLongestOverlap(str1: string, str2: string): string {
  const maxOverlap = Math.min(str1.length, str2.length);

  // 从最大可能长度开始尝试
  for (let len = maxOverlap; len > 0; len--) {
    const suffix = str1.slice(-len); // str1 的最后 len 个字符
    const prefix = str2.slice(0, len); // str2 的前 len 个字符
    if (suffix === prefix) {
      return suffix;
    }
  }

  return ''; // 无重叠
}
