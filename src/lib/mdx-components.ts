/**
 * MDX 组件配置
 * 集成 Fumadocs UI 组件系统，提供统一的 MDX 内容渲染体验
 */

import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Cards, Card } from 'fumadocs-ui/components/card';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { 
  File, 
  Folder, 
  Files 
} from 'fumadocs-ui/components/files';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

/**
 * 自定义 MDX 组件配置
 * 扩展 Fumadocs 默认组件，添加博客特定的自定义组件
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    // 使用 Fumadocs 默认组件作为基础
    ...defaultMdxComponents,
    
    // 卡片组件
    Cards,
    Card,
    
    // 文件树组件
    File,
    Folder,
    Files,
    
    // 标签页组件
    Tab,
    Tabs,
    
    // 内联目录组件
    InlineTOC,
    
    // 合并用户自定义组件
    ...components,
  };
}

/**
 * 导出 useMDXComponents 以兼容 Next.js MDX
 */
export const useMDXComponents = getMDXComponents;