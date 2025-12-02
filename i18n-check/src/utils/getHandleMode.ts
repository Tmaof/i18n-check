/**
 * 从文件路径中提取文件扩展名（不带点）
 * @param filePath 文件路径，如 'src/App.tsx' 或 './components/Hello.vue'
 * @returns 扩展名小写字符串（如 'tsx', 'vue'），若无扩展名则返回空字符串
 */
function getFileExtension(filePath: string): string {
  // 处理以 . 开头的隐藏文件（如 .gitignore），它们没有真正的扩展名
  if (filePath.startsWith('.')) {
    return '';
  }

  const lastDotIndex = filePath.lastIndexOf('.');
  const lastSlashIndex = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\'),
  );

  // 如果有点，且点在最后一个路径分隔符之后，则认为是扩展名
  if (lastDotIndex > lastSlashIndex && lastDotIndex < filePath.length - 1) {
    return filePath.slice(lastDotIndex + 1).toLowerCase();
  }

  return '';
}

export enum HandleMode {
  vue = 'vue',
  jsx = 'jsx',
  jsTs = 'js-ts',
  unknown = 'unknown',
}

/**
 * 获取文件的处理模式
 * @param filePath 文件路径
 * @returns 处理模式
 * - vue: vue 文件
 * - jsx: jsx 文件
 * - js-ts: js 或 ts 文件
 * - unknown: 未知文件
 */
export function getHandleMode(filePath: string): HandleMode {
  const extension = getFileExtension(filePath);
  if (extension === 'vue') {
    return HandleMode.vue;
  }
  if (['js', 'ts'].includes(extension)) {
    return HandleMode.jsTs;
  }
  if (['tsx', 'jsx'].includes(extension)) {
    return HandleMode.jsx;
  }
  return HandleMode.unknown;
}
