"use client";

import * as React from "react";
import { Search, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchResult } from "@/types/blog/search";
import { useSearchStore } from "@/lib/stores";
import { useUIStore } from "@/lib/stores/uiStore";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 简化的搜索模态框组件
 * 遵循 KISS 原则，只保留核心搜索功能
 */
export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const {
    searchQuery,
    searchResults,
    isLoading,
    searchError,
    setSearchQuery,
    setSearchError,
    performSearch,
    handleResultClick,
  } = useSearchStore();

  const { setIsSearchOpen } = useUIStore();

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // 聚焦搜索输入框
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // 实时搜索（防抖）
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      useSearchStore.getState().setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // 处理结果点击
  const handleResultClickWithClose = (result: SearchResult) => {
    handleResultClick(result);
    setIsSearchOpen(false);
    onOpenChange(false);
  };

  // 获取结果类型图标
  const getResultIcon = (type: 'post' | 'page') => {
    return <FileText className="w-4 h-4" />;
  };

  // 获取结果类型文本
  const getResultTypeText = (type: 'post' | 'page') => {
    switch (type) {
      case 'post':
        return '文章';
      case 'page':
        return '页面';
      default:
        return '其他';
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">搜索内容</DialogTitle>
          <DialogDescription>
            输入关键词搜索文章和页面的标题、内容、摘要和标签
          </DialogDescription>
        </DialogHeader>

        {/* 搜索输入框 */}
        <div className="p-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索文章标题、内容、摘要或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[400px] overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">搜索中...</p>
            </div>
          ) : searchError ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">搜索失败</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchError}
              </p>
              <button
                onClick={() => {
                  setSearchError(null);
                  performSearch();
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                重试
              </button>
            </div>
          ) : searchQuery ? (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    找到 {searchResults.length} 个结果
                  </p>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleResultClickWithClose(result)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getResultIcon(result.type)}
                            <span className="text-xs text-muted-foreground">
                              {getResultTypeText(result.type)}
                            </span>
                            {result.publishedAt && (
                              <span className="text-xs text-muted-foreground">
                                • {formatDate(result.publishedAt)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              • 评分: {result.score.toFixed(2)}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">
                            {result.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.excerpt}
                          </p>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {result.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">没有找到相关结果</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    尝试使用不同的关键词
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">输入关键词开始搜索</p>
              <p className="text-sm text-muted-foreground mt-1">
                支持搜索文章和页面的标题、内容、摘要和标签
              </p>
            </div>
          )}
        </div>

        {/* 底部快捷键提示 */}
        <div className="px-6 pb-6 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-secondary rounded text-xs">Esc</kbd>
                关闭
              </span>
            </div>
            <span>按 Enter 快速跳转</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}