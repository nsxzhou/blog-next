"use client";

import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { generateHeadingIdForElement } from '@/lib/utils/heading';

/**
 * 文章内容组件属性
 */
interface PostContentProps {
  content: string;
  className?: string;
}

/**
 * 文章内容组件
 * 
 * 功能：渲染Markdown内容，支持代码高亮和自定义样式
 * 特点：优化的排版和视觉效果，自动生成标题ID用于目录跳转
 */
export function PostContent({ content, className }: PostContentProps) {
  // 自定义组件，为标题添加ID用于目录跳转
  const components: Components = {
    // 代码块样式优化 - 移除Card包装，使用更简洁的设计
    pre: ({ ...props }) => (
      <pre 
        {...props} 
        className="text-sm overflow-x-auto p-4 bg-muted/40 rounded-lg my-4 border border-border/50" 
      />
    ),
    
    // 内联代码样式
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code 
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-medium" 
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // 标题组件，添加ID用于目录跳转 - 优化间距
    h1: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h1 
          id={id} 
          className="scroll-mt-20 text-2xl font-bold tracking-tight mb-4 mt-6" 
          {...props}
        >
          {children}
        </h1>
      );
    },

    h2: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h2 
          id={id} 
          className="scroll-mt-20 text-xl font-semibold tracking-tight mb-3 mt-6" 
          {...props}
        >
          {children}
        </h2>
      );
    },

    h3: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h3 
          id={id} 
          className="scroll-mt-20 text-lg font-semibold tracking-tight mb-2 mt-4" 
          {...props}
        >
          {children}
        </h3>
      );
    },

    h4: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h4 
          id={id} 
          className="scroll-mt-20 text-base font-semibold tracking-tight mb-2 mt-4" 
          {...props}
        >
          {children}
        </h4>
      );
    },

    h5: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h5 
          id={id} 
          className="scroll-mt-20 text-sm font-semibold tracking-tight mb-2 mt-3" 
          {...props}
        >
          {children}
        </h5>
      );
    },

    h6: ({ children, ...props }) => {
      const id = generateHeadingIdForElement(String(children));
      return (
        <h6 
          id={id} 
          className="scroll-mt-20 text-xs font-semibold tracking-tight mb-2 mt-3" 
          {...props}
        >
          {children}
        </h6>
      );
    },

    // 段落样式优化 - 减少间距
    p: ({ children, ...props }) => (
      <p className="leading-7 mb-3 text-muted-foreground" {...props}>
        {children}
      </p>
    ),

    // 引用块样式 - 优化间距
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-4 border-primary/40 pl-6 my-4 italic text-muted-foreground/90"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // 列表样式 - 优化间距
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-3 space-y-1" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-3 space-y-1" {...props}>
        {children}
      </ol>
    ),

    // 表格样式 - 优化间距
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse border border-border rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),

    th: ({ children, ...props }) => (
      <th 
        className="border border-border bg-muted/30 px-4 py-2 text-left font-semibold" 
        {...props}
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无内容</p>
      </div>
    );
  }

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}