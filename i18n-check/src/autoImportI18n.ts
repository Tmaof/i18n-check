export function autoImportI18n(options: {
  pathContentList: { path: string; content: string }[];
  importCode?: string;
  i18nT?: string;
}) {
  const { pathContentList, importCode, i18nT } = options || {};
  const resList = [];
  for (const { path, content } of pathContentList) {
    const newContent = importI18n({
      content,
      importCode,
      i18nT,
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
}): string {
  const {
    content,
    importCode = "import i18n from '@/utils/i18n';",
    i18nT = 'i18n.t',
  } = options || {};
  const i18nTRegex = createI18nTRegex(i18nT);
  if (!i18nTRegex.test(content)) {
    return content;
  }
  if (content.includes(importCode)) {
    return content;
  }
  return `${importCode}\n${content}`;
}

// 匹配由变量提供的函数名，例如 xxx()
function createI18nTRegex(functionName: string): RegExp {
  // 转义特殊字符，防止正则注入
  const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 匹配函数调用: xxx('...') 或 xxx("...")
  return new RegExp(`[={\\s]${escapedName}\\s*\\(\\s*['"]((?:[^'"\\\\\\n\\r]|\\\\.)*?)['"]\\s*[,)]`);
}
