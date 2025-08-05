"use client";

import * as React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/forms/Button";
import { Search, Settings } from "lucide-react";
import { SearchModal } from "@/components/blog/search/SearchModal";
import { useUIStore } from "@/lib/stores";

export function Header() {
  const { isSearchOpen, setIsSearchOpen } = useUIStore();

  // 处理键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 按下 / 键打开搜索（排除输入框中的情况）
      if (event.key === '/' && event.target !== document.activeElement) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo和主导航 */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold">
                Blog Next
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                  首页
                </Link>
                <Link href="/posts" className="text-sm font-medium transition-colors hover:text-primary">
                  文章
                </Link>
                <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                  关于
                </Link>
              </nav>
            </div>
            
            {/* 右侧工具栏 */}
            <div className="flex items-center space-x-4">
              {/* 搜索按钮 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">搜索</span>
              </Button>
              
              {/* 管理入口 */}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">管理</span>
                </Link>
              </Button>
              
              {/* 主题切换 */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 搜索模态框 */}
      <SearchModal 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen}
      />
    </>
  );
}