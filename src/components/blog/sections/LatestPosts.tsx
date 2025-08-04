import { PostCard } from "@/components/blog/post/PostCard";
import { Post } from "@/types/blog/post";

/**
 * 最新文章展示组件
 * @param {Post[]} posts - 文章数据数组
 * @param {number} maxPosts - 最大展示文章数量，默认6篇
 */
interface LatestPostsProps {
  posts: Post[];
  maxPosts?: number;
}

export function LatestPosts({ posts, maxPosts = 6 }: LatestPostsProps) {
  // 只显示指定数量的最新文章
  const displayPosts = posts.slice(0, maxPosts);
  
  // 过滤已发布的文章
  const publishedPosts = displayPosts.filter(post => post.status === 'PUBLISHED');
  
  // 如果没有已发布的文章，显示占位内容
  if (publishedPosts.length === 0) {
    return (
      <section className="py-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">最新文章</h2>
          <p className="text-muted-foreground">暂无已发布的文章</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* 区域标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            最新文章
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            探索最新的技术文章和思考
          </p>
        </div>
        
        {/* 文章网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {publishedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* 查看更多按钮 */}
        {posts.length > maxPosts && (
          <div className="text-center">
            <a
              href="/posts"
              className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              查看更多文章
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}