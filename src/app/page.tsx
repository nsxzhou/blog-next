import { BlogLayout } from "@/components/blog/layout/BlogLayout";
import { HeroSection } from "@/components/blog/sections/HeroSection";
import { PostsList } from "@/components/blog/sections/LatestPosts";
import { PostService } from "@/lib/services/post.service";
import { PostStatus } from "@/generated/prisma";
import { cache } from "react";

/**
 * 缓存文章数据获取
 * 使用 React.cache 缓存数据获取结果，避免重复请求
 */
const getPostsData = cache(async (page: number, pageSize: number) => {
  try {
    const data = await PostService.getPostList({
      page,
      pageSize,
      status: PostStatus.PUBLISHED,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    return data;
  } catch (error) {
    console.error('获取文章数据失败:', error);
    return {
      posts: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }
});

/**
 * 首页组件
 * 
 * 功能：展示英雄区域和文章列表，支持分页
 * 特点：极简设计，专注内容展示
 */
interface HomePageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  // 获取分页参数，默认为第1页，每页12篇文章
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page || '1');
  const pageSize = 12;
  
  // 获取文章数据
  const postsData = await getPostsData(currentPage, pageSize);

  return (
    <BlogLayout>
      {/* 英雄区域 */}
      <HeroSection />
      
      {/* 文章列表 */}
      <PostsList 
        posts={postsData.posts}
        currentPage={currentPage}
        totalPages={postsData.totalPages}
      />
    </BlogLayout>
  );
}
