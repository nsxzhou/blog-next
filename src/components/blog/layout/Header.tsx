"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/forms/Button";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/blog/search/SearchModal";
import { useUIStore } from "@/lib/stores";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  const { isSearchOpen, setIsSearchOpen } = useUIStore();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: pathname });
  };

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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo和主导航 */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="group flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  溺水寻舟
                </div>
              </Link>
              <nav className="hidden lg:flex items-center space-x-8">
                <Link 
                  href="/about" 
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105"
                >
                  关于
                </Link>
                <Link 
                  href="/archive" 
                  className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105"
                >
                  归档
                </Link>
              </nav>
            </div>
            
            {/* 右侧工具栏 */}
            <div className="flex items-center space-x-3">
              {/* 搜索按钮 */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 h-9 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 hover:scale-105"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">搜索</span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  /
                </kbd>
              </Button>
              
              {/* 认证相关按钮 */}
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              ) : session ? (
                <UserMenu />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignIn}
                  className="h-9 px-4 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-105"
                >
                  登录
                </Button>
              )}
              
              {/* 主题切换 */}
              <div className="ml-1">
                <ThemeToggle />
              </div>
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