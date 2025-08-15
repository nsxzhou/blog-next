'use client'

import { usePostBySlug } from '@/lib/hooks/usePosts'
import { BlogLayout } from '@/components/blog/layout/BlogLayout'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { PostContent } from '@/components/blog/PostContent'
import { ViewTracker } from '@/components/blog/ViewTracker'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Calendar, User, Eye, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Post } from '@/types/blog/post'

interface PostDetailClientProps {
  slug: string
  initialPost?: Post | null
}

/**
 * 客户端文章详情组件
 * 使用 TanStack Query 进行数据获取和状态管理
 */
export function PostDetailClient({ slug, initialPost }: PostDetailClientProps) {
  const { data: post, isLoading, error, isError } = usePostBySlug(slug, !initialPost)

  // 使用初始数据或查询数据
  const displayPost = initialPost || post

  // 加载状态：只有在没有初始数据且正在加载时才显示
  if (!initialPost && isLoading) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </BlogLayout>
    )
  }

  // 错误状态：只有在没有初始数据且发生错误时才显示
  if (!initialPost && isError) {
    return (
      <BlogLayout>
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : '加载文章失败'}
            </AlertDescription>
          </Alert>
        </div>
      </BlogLayout>
    )
  }

  // 没有数据且没有初始数据
  if (!displayPost) {
    notFound()
  }

  return (
    <BlogLayout>
      {/* 浏览量追踪组件 - 确保只调用一次 */}
      <ViewTracker postId={displayPost.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          <article className="max-w-none">
            {/* 文章头部信息 */}
            <header className="mb-6 space-y-4">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {displayPost.title}
              </h1>
      
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {displayPost.publishedAt ? (
                      new Date(displayPost.publishedAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    ) : (
                      '未发布'
                    )}
                  </span>
                </div>
        
                {displayPost.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{displayPost.author.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{displayPost.viewCount} 次浏览</span>
                </div>
              </div>
      
              {/* 状态和特色标识 */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={displayPost.status === 'PUBLISHED' ? 'default' : 'secondary'}
                  className={displayPost.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : ''
                  }
                >
                  {displayPost.status === 'PUBLISHED' ? '已发布' : '草稿'}
                </Badge>

                {displayPost.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    TOP
                  </Badge>
                )}
              </div>
      
              {/* 标签 */}
              {displayPost.tags && displayPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {displayPost.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      className="flex items-center gap-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* 文章摘要 */}
            {displayPost.excerpt && (
              <div className="mb-6 border-l-4 border-l-primary/40 bg-muted/20 rounded-r-lg">
                <div className="py-4 px-6">
                  <p className="text-muted-foreground italic leading-7">
                    {displayPost.excerpt}
                  </p>
                </div>
              </div>
            )}

            {/* 文章内容 */}
            <div className="mt-6">
              <PostContent content={displayPost.content || ''} />
            </div>
          </article>
        </div>

        {/* 右侧目录 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            {displayPost.content && (
              <TableOfContents 
                content={displayPost.content} 
                className="hidden lg:block"
              />
            )}
          </div>
        </div>
      </div>
    </BlogLayout>
  )
}