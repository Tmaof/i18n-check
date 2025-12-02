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
