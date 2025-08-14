"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Post, Tag } from "@/types/blog/post";
import {
  Clock,
  Calendar,
  ArrowRight,
  Tag as TagIcon,
  Star
} from "lucide-react";

/**
 * 文章列表项组件
 * 
 * 功能：在列表视图中展示单篇文章信息
 * 特点：采用纯文本卡片布局，简洁高效，支持响应式
 */
interface PostListItemProps {
  post: Post;
}

export function PostListItem({ post }: PostListItemProps) {
  // 格式化发布时间
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // 计算阅读时间
  const readTime = post.readTime || Math.ceil(post.content.length / 500);

  // 获取文章摘要
  const excerpt = post.excerpt || post.content.substring(0, 120) + '...';

  return (
    <article className="group relative py-6 first:pt-0 last:pb-0 border-b border-border last:border-b-0">
      <div className="space-y-4">
        {/* 文章标题和特色标记 */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-lg lg:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/posts/${post.slug}`} className="block">
                {post.title}
              </Link>
            </h3>
          </div>
          {/* 特色文章标记 */}
          {post.featured && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                TOP
              </Badge>
            </div>
          )}
        </div>

        {/* 文章摘要 */}
        <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
          {excerpt}
        </p>

        {/* 文章标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Topics</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* 发布时间 */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
            </div>

            {/* 阅读时间 */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* 右侧阅读更多链接 */}
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all"
          >
            Read More
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}