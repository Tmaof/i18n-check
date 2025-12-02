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
