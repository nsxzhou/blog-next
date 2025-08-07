import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Post, Tag } from "@/types/blog/post";
import {
  Clock,
  Calendar,
  ArrowRight,
  Tag as TagIcon
} from "lucide-react";
import coverImage  from "../../../../public/wallhaven-exm8xk.jpg"

/**
 * 文章列表项组件
 * 
 * 功能：在列表视图中展示单篇文章信息
 * 特点：采用水平布局，左侧缩略图，右侧内容详情，支持响应式
 */
interface PostListItemProps {
  post: Post;
  showImage?: boolean;
}

export function PostListItem({ post, showImage = true }: PostListItemProps) {
  // 格式化发布时间
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // 获取文章封面图URL
  //const coverImage = '/public/wallhaven-exm8xk.jpg';

  // 计算阅读时间
  const readTime = post.readTime || Math.ceil(post.content.length / 500);

  // 获取文章摘要
  const excerpt = post.excerpt || post.content.substring(0, 120) + '...';

  return (
    <article className="group relative py-8 first:pt-0 last:pb-0">
      <div className="grid md:grid-cols-12 gap-0 md:gap-8">
        {/* 左侧缩略图区域 */}
        {showImage && (
          <div className="md:col-span-4 lg:col-span-3">
            <div className="relative h-48 md:h-36 lg:h-40 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          </div>
        )}

        {/* 右侧内容区域 */}
        <div className={`${showImage ? 'md:col-span-8 lg:col-span-9' : 'md:col-span-12'} mt-6 md:mt-0`}>
          <div className="flex flex-col h-full justify-between space-y-4">
            {/* 文章主要内容 */}
            <div className="space-y-3">
              {/* 文章标题 */}
              <h3 className="text-xl lg:text-2xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                <Link href={`/posts/${post.slug}`} className="block">
                  {post.title}
                </Link>
              </h3>

              {/* 文章摘要 */}
              <p className="text-muted-foreground line-clamp-2 lg:line-clamp-3 leading-relaxed text-sm lg:text-base">
                {excerpt}
              </p>
            </div>

            {/* 文章标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag: Tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 文章元信息和操作 */}
            <div className="flex items-center justify-between pt-2">
              {/* 左侧元信息 */}
              <div className="flex items-center gap-4 text-xs lg:text-sm text-muted-foreground">
                {/* 发布时间 */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
                    {formatDate(post.publishedAt || post.createdAt)}
                  </time>
                </div>

                {/* 阅读时间 */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} min read </span>
                </div>
              </div>

              {/* 右侧阅读更多链接 */}
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Read More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>


    </article>
  );
}