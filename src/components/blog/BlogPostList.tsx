'use client'

import { usePostList } from '@/lib/hooks/usePosts'
import { PostListItem } from '@/components/blog/post/PostListItem'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PostListQuery } from '@/types/blog/post'

interface BlogPostListProps {
  query?: PostListQuery
  className?: string
}

/**
 * 博客文章列表组件
 * 使用 TanStack Query 进行数据获取和状态管理
 */
export function BlogPostList({ query = {}, className = '' }: BlogPostListProps) {
  const { data, isLoading, error, isError } = usePostList(query)

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-4 py-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : '加载文章列表失败'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data?.posts || data.posts.length === 0) {
    return (
      <div className={`text-center py-12 text-muted-foreground ${className}`}>
        <p>暂无文章</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {data.posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </div>
  )
}