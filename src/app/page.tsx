import { BlogLayout } from "@/components/blog/layout/BlogLayout";
import { HeroSection } from "@/components/blog/sections/HeroSection";
import { PostsList } from "@/components/blog/sections/LatestPosts";
import { PostService } from "@/lib/services/post.service";
import { PostStatus } from "@/generated/prisma";

/**
 * 获取文章数据
 * 获取并排序文章数据，支持分页
 */
const getPostsData = async (page: number, pageSize: number) => {
  try {
    // 获取所有已发布的文章
    const data = await PostService.getPostList({
      page: 1, // 先获取所有文章进行排序
      pageSize: 1000, // 使用较大的数字确保获取所有文章
      status: PostStatus.PUBLISHED,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // 按特色文章优先、创建时间降序排序
    const sortedPosts = data.posts.sort((a, b) => {
      // 首先按 featured 字段排序（true 在前）
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      // 然后按创建时间降序排序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 应用分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total: data.total,
      page,
      pageSize,
      totalPages: Math.ceil(data.total / pageSize)
    };
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
};

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
