import { getHandleMode, HandleMode } from './utils/getHandleMode';
export function autoImportI18n(options: {
  pathContentList: { path: string; content: string }[];
  importCode?: string;
  i18nT?: string;
}) {
  const { pathContentList, importCode, i18nT } = options || {};
  const resList = [];
  for (const { path, content } of pathContentList) {
    const handleMode = getHandleMode(path);
    const newContent = importI18n({
      content,
      importCode,
      i18nT,
      handleMode,
    });
    resList.push({
      path,
      content: newContent,
    });
  }
  return resList;
}

export function importI18n(options: {
  content: string;
  importCode?: string;
  i18nT?: string;
  handleMode?: HandleMode;
}): string {
  const {
    content,
    importCode = "import i18n from '@/utils/i18n';",
    i18nT = 'i18n.t',
    handleMode,
  } = options || {};
  const i18nTRegex = createI18nTRegex(i18nT);
  if (!i18nTRegex.test(content)) {
    return content;
  }
  if (content.includes(importCode)) {
    return content;
  }

  switch (handleMode) {
    case HandleMode.vue:{
      const [{ end }] = findScriptOpeningTags(content);
      const before = content.substring(0, end);
      const after = content.substring(end);
      return `${before}\n${importCode}${after}`;
    }
    default:
      return `${importCode}\n${content}`;
  }
}

// 匹配由变量提供的函数名，例如 xxx()
function createI18nTRegex(functionName: string): RegExp {
  // 转义特殊字符，防止正则注入
  const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 匹配函数调用: xxx('...') 或 xxx("...")
  return new RegExp(
    `[={\\s]${escapedName}\\s*\\(\\s*['"]((?:[^'"\\\\\\n\\r]|\\\\.)*?)['"]\\s*[,)]`,
  );
}

interface ScriptTagMatch {
  start: number; // '<' 的索引
  end: number; // '>' 之后的索引（即标签闭合后的第一个字符位置）
  fullTag: string; // 完整的 opening tag，如 '<script setup lang="ts">'
}

/**
 * 从字符串中查找 <script> 或 <script setup lang="ts"> 开始标签的位置
 * @param content 源字符串（如 SFC 单文件组件内容）
 * @returns 匹配结果数组（通常只取第一个），若未找到则返回空数组
 */
function findScriptOpeningTags(content: string): ScriptTagMatch[] {
  const matches: ScriptTagMatch[] = [];
  const regex = /<script(?:\s[^>]*)?>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = start + match[0].length; // '>' 后一位
    const fullTag = match[0];

    // 可选：只保留我们关心的 script 标签（比如排除 type="text/template" 等）
    // 这里按需求保留所有 <script...> 标签

    matches.push({
      start,
      end,
      fullTag,
    });
  }

  return matches;
}
