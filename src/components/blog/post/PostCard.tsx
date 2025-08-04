import Link from "next/link";
import Image from "next/image";
import { Post, Tag } from "@/types/blog/post";

/**
 * 文章卡片组件
 * @param {Post} post - 文章数据对象
 */
interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // 格式化发布时间
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 获取文章封面图URL
  const coverImage = post.media?.[0]?.url || 'https://via.placeholder.com/400x200/4f46e5/ffffff?text=Blog+Next';
  
  // 计算阅读时间
  const readTime = post.readTime || Math.ceil(post.content.length / 500);

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      {/* 文章封面图 */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* 文章内容 */}
      <div className="p-6 space-y-4">
        {/* 文章标题 */}
        <h3 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/posts/${post.slug}`} className="block">
            {post.title}
          </Link>
        </h3>
        
        {/* 文章摘要 */}
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>
        
        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* 发布时间 */}
            <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
              {formatDate(post.publishedAt || post.createdAt)}
            </time>
            
            {/* 阅读时间 */}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} 分钟
            </span>
          </div>
        </div>
        
        {/* 文章标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: Tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}