import { notFound } from 'next/navigation';
import { PostService } from '@/lib/services/post.service';
import { PostDetailClient } from '@/components/blog/PostDetailClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/client';
import { prefetchHelpers } from '@/lib/query/client';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 文章详情页面 - 服务端组件
 * 
 * 职责：
 * 1. 在服务端获取文章数据
 * 2. 预取 TanStack Query 数据
 * 3. 将数据传递给客户端组件
 * 4. 处理 SEO 和初始渲染
 * 
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  // 获取 QueryClient 实例
  const queryClient = getQueryClient();
  
  try {
    // 在服务端预取文章数据
    await prefetchHelpers.prefetchPostBySlug(slug);
    
    // 获取文章数据用于 SEO 和初始渲染
    const post = await PostService.getPostBySlug(slug);
    
    if (!post) {
      notFound();
    }

    // 脱水查询状态
    const dehydratedState = dehydrate(queryClient);

    return (
      <HydrationBoundary state={dehydratedState}>
        <PostDetailClient 
          slug={slug}
          initialPost={post}
        />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('文章页面加载失败:', error);
    notFound();
  }
}