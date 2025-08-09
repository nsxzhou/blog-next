/**
 * Markdown 文本处理工具函数
 * 遵循 KISS 原则，提供简单有效的文本提取功能
 */

/**
 * 从 Markdown 内容中提取纯文本用于搜索索引
 * 保留更多有用的文本内容，提高搜索准确性
 * @param markdown Markdown 格式的内容
 * @returns 提取的纯文本内容
 */
export function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    // 移除代码块
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // 处理标题，保留内容
    .replace(/#{1,6}\s+(.+)/g, '$1 ')
    // 处理粗体和斜体，保留内容
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // 处理链接，保留链接文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除其他Markdown标记
    .replace(/[-*+]\s+/g, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^\>\s+/gm, '')
    .replace(/^\|\s*.*\s*\|$/gm, '')
    .replace(/^\|[-:|\s]+\|$/gm, '')
    // 清理多余空白
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}