/**
 * 标题处理工具函数
 * 
 * 功能：统一处理 Markdown 标题的提取和 ID 生成
 * 解决：代码块中注释被识别为标题的问题，确保 ID 生成的一致性
 */

/**
 * 目录项接口
 */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 生成标题的唯一 ID
 * 
 * @param text 标题文本
 * @param existingIds 已存在的 ID 集合，用于避免重复
 * @returns 唯一的 ID 字符串
 */
export function generateHeadingId(text: string, existingIds?: Set<string>): string {
  // 基础 ID 生成：去除特殊字符，保留中英文数字，空格转为连字符
  const baseId = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, ''); // 去除首尾的连字符

  if (!baseId) {
    return 'heading';
  }

  // 如果没有提供已存在的 ID 集合，直接返回基础 ID
  if (!existingIds) {
    return baseId;
  }

  // 处理重复 ID，添加数字后缀
  if (!existingIds.has(baseId)) {
    existingIds.add(baseId);
    return baseId;
  }

  let counter = 2;
  let uniqueId = `${baseId}-${counter}`;
  while (existingIds.has(uniqueId)) {
    counter++;
    uniqueId = `${baseId}-${counter}`;
  }
  
  existingIds.add(uniqueId);
  return uniqueId;
}

/**
 * 从 Markdown 内容中提取标题，避免代码块干扰
 * 
 * @param content Markdown 内容
 * @returns 标题列表
 */
export function extractHeadingsFromMarkdown(content: string): TocItem[] {
  if (!content) return [];

  // 先移除代码块，避免代码块中的注释被识别为标题
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
  const contentWithoutCodeBlocks = content.replace(codeBlockRegex, '');

  // 提取标题的正则表达式，只匹配行首的标题
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];
  const existingIds = new Set<string>();
  let match;

  while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // 跳过空标题
    if (!text) continue;

    const id = generateHeadingId(text, existingIds);
    items.push({ id, text, level });
  }

  return items;
}

/**
 * 为 React 组件中的标题元素生成 ID
 * 这个函数用于 PostContent 组件中，确保与目录生成的 ID 一致
 * 
 * @param text 标题文本
 * @returns ID 字符串
 */
export function generateHeadingIdForElement(text: string): string {
  return generateHeadingId(text);
}