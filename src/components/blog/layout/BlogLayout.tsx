"use client";

import { Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchParamsHandler } from "./SearchParamsHandler";

interface BlogLayoutProps {
  children: React.ReactNode;
}

/**
 * 博客布局组件
 * 
 * 功能：提供博客应用的整体布局结构
 * 特点：现代化设计、优化的间距、良好的响应式支持
 */
export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background antialiased">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
    </div>
  );
}