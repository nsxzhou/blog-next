"use client";

import * as React from "react";
import { Search, FileText, Tag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog/Dialog";
import { SearchResult } from "@/types/blog/search";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'post' | 'page' | 'tag'>('all');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);
  const [searchError, setSearchError] = React.useState<string | null>(null);
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

  // 执行搜索
  const performSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    try {
      const filterType = activeFilter === 'all' ? undefined : activeFilter;
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      });
      
      if (filterType) {
        params.append('type', filterType);
      }
      
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '搜索失败');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '搜索失败');
      }
      setSearchResults(data.data.results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchError(error instanceof Error ? error.message : '搜索失败');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter]);

  // 加载搜索建议
  const loadSearchSuggestions = async () => {
    try {
      const response = await fetch('/api/search/suggestions?limit=10');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '获取搜索建议失败');
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '获取搜索建议失败');
      }
      setSearchSuggestions(data.data.suggestions);
    } catch (error) {
      console.error('加载搜索建议失败:', error);
      setSearchSuggestions([]);
    }
  };

  // 加载热门搜索建议
  React.useEffect(() => {
    if (open) {
      loadSearchSuggestions();
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
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, activeFilter, performSearch]);

  // 处理搜索建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setActiveFilter('all');
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    // 导航到结果页面
    window.location.href = result.url;
    onOpenChange(false);
  };

  // 获取结果类型图标
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'page':
        return <FileText className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // 获取结果类型文本
  const getResultTypeText = (type: string) => {
    switch (type) {
      case 'post':
        return '文章';
      case 'page':
        return '页面';
      case 'tag':
        return '标签';
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
            输入关键词搜索文章、页面或标签
          </DialogDescription>
        </DialogHeader>

        {/* 搜索输入框 */}
        <div className="p-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索文章标题、内容或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 筛选选项 */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { key: 'all', label: '全部' },
              { key: 'post', label: '文章' },
              { key: 'page', label: '页面' },
              { key: 'tag', label: '标签' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as 'all' | 'post' | 'page' | 'tag')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {filter.label}
              </button>
            ))}
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
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getResultIcon(result.type)}
                            <span className="text-xs text-muted-foreground">
                              {getResultTypeText(result.type)}
                            </span>
                            {result.date && (
                              <span className="text-xs text-muted-foreground">
                                • {formatDate(result.date)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-foreground mb-1">
                            {result.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.excerpt}
                          </p>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
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
            <div className="space-y-6">
              <div className="text-center py-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">输入关键词开始搜索</p>
                <p className="text-sm text-muted-foreground mt-1">
                  支持搜索文章标题、内容和标签
                </p>
              </div>
              
              {/* 热门搜索建议 */}
              {searchSuggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">热门搜索</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-accent transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部快捷键提示 */}
        <div className="px-6 pb-6 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-secondary rounded text-xs">/</kbd>
                打开搜索
              </span>
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