import { BlogLayout } from "@/components/blog/layout/BlogLayout";
import { HeroSection } from "@/components/blog/sections/HeroSection";
import { LatestPosts } from "@/components/blog/sections/LatestPosts";
import { PostService } from "@/lib/services/post.service";
import { PostStatus } from "@/generated/prisma";
import { cache } from "react";

/**
 * 缓存最新文章数据获取
 * 使用 React.cache 缓存数据获取结果，避免重复请求
 */
const getLatestPosts = cache(async () => {
  try {
    const data = await PostService.getPostList({
      page: 1,
      pageSize: 6,
      status: PostStatus.PUBLISHED,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    return data;
  } catch (error) {
    console.error('获取最新文章失败:', error);
    return {
      posts: [],
      total: 0,
      page: 1,
      pageSize: 6,
      totalPages: 0
    };
  }
});

/**
 * 首页组件
 * 
 * 功能：整合所有首页功能模块，提供完整的首页体验
 * 特点：包含英雄区域、最新文章、功能特性展示等模块
 */
export default async function Home() {
  // 获取最新文章数据
  const latestPostsData = await getLatestPosts();

  return (
    <BlogLayout>
      {/* 英雄区域 */}
      <HeroSection />
      
      {/* 最新文章 */}
      <LatestPosts posts={latestPostsData.posts} />
    
    </BlogLayout>
  );
}
