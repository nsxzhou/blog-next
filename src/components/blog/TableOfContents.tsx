"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { extractHeadingsFromMarkdown, type TocItem } from '@/lib/utils/heading';

/**
 * 目录组件属性
 */
interface TableOfContentsProps {
  content: string;
  className?: string;
}

/**
 * 目录组件
 * 
 * 功能：从Markdown内容中提取标题生成目录，支持点击跳转和当前位置高亮
 * 特点：简洁的设计，流畅的滚动交互，避免代码块中注释的干扰
 */
export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 从markdown内容中提取标题
  useEffect(() => {
    const items = extractHeadingsFromMarkdown(content);
    setTocItems(items);
  }, [content]);

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -80% 0%'
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  // 平滑滚动到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed top-1/3 -translate-y-1/2 right-24 w-64", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">目录</h3>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-1">
        {tocItems.map(({ id, text, level }) => (
          <button
            key={id}
            onClick={() => scrollToHeading(id)}
            className={cn(
              "block w-full text-left text-sm transition-colors hover:text-primary",
              "py-1.5 px-2 rounded-md hover:bg-muted/50 truncate",
              {
                "text-primary bg-muted": activeId === id,
                "text-muted-foreground": activeId !== id,
                "pl-6": level === 2,
                "pl-10": level === 3,
                "pl-14": level === 4,
                "pl-18": level === 5,
                "pl-22": level === 6,
              }
            )}
            title={text}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}