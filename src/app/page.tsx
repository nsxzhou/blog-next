"use client";

import { BlogLayout } from "@/components/blog/layout/BlogLayout";
import { HeroSection } from "@/components/blog/sections/HeroSection";
import { LatestPosts } from "@/components/blog/sections/LatestPosts";
import { Post } from "@/types/blog/post";
import { PostStatus } from "@/generated/prisma";

/**
 * 首页组件
 * 
 * 功能：整合所有首页功能模块，提供完整的首页体验
 * 特点：包含英雄区域、最新文章、功能特性展示等模块
 */
export default function Home() {
  // 暂时使用静态数据，后续可替换为实际数据获取
  const mockPosts: Post[] = [
    {
      id: "1",
      title: "Next.js 15 新特性详解",
      slug: "nextjs-15-features",
      content: "深入探讨 Next.js 15 带来的新功能，包括改进的性能、新的 API 和开发体验优化。",
      excerpt: "深入探讨 Next.js 15 带来的新功能，包括改进的性能、新的 API 和开发体验优化。",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2024-01-15"),
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      authorId: "1",
      featured: false,
      viewCount: 0,
      readTime: 5,
      tags: [
        { id: "1", name: "Next.js", slug: "nextjs", createdAt: new Date() },
        { id: "2", name: "React", slug: "react", createdAt: new Date() }
      ]
    },
    {
      id: "2",
      title: "Tailwind CSS v4 最佳实践",
      slug: "tailwind-css-v4",
      content: "了解 Tailwind CSS v4 的新特性和最佳实践，提升你的开发效率。",
      excerpt: "了解 Tailwind CSS v4 的新特性和最佳实践，提升你的开发效率。",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2024-01-12"),
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-12"),
      authorId: "1",
      featured: false,
      viewCount: 0,
      readTime: 8,
      tags: [
        { id: "3", name: "CSS", slug: "css", createdAt: new Date() },
        { id: "4", name: "Tailwind", slug: "tailwind", createdAt: new Date() }
      ]
    },
    {
      id: "3",
      title: "TypeScript 类型系统深度解析",
      slug: "typescript-types",
      content: "深入理解 TypeScript 的类型系统，掌握高级类型技巧和最佳实践。",
      excerpt: "深入理解 TypeScript 的类型系统，掌握高级类型技巧和最佳实践。",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date("2024-01-10"),
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      authorId: "1",
      featured: false,
      viewCount: 0,
      readTime: 12,
      tags: [
        { id: "5", name: "TypeScript", slug: "typescript", createdAt: new Date() },
        { id: "6", name: "前端", slug: "frontend", createdAt: new Date() }
      ]
    }
  ];

  return (
    <BlogLayout>
      {/* 英雄区域 */}
      <HeroSection />
      
      {/* 最新文章 */}
      <LatestPosts posts={mockPosts} />
    
    </BlogLayout>
  );
}
