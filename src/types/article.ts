// 文章相关的类型定义
import { Post, User, Tag, PostStatus } from '@prisma/client'

// 完整的文章类型（包含关联数据）
export interface PostWithRelations extends Post {
  author: User
  tags: Array<{
    tag: Tag
  }>
  _count?: {
    likes: number
    analytics: number
  }
}

// 文章列表项类型
export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  status: PostStatus
  viewCount: number
  likeCount: number
  wordCount: number
  readingTime: number | null
  isFeatured: boolean
  publishedAt: Date | null
  createdAt: Date
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
      color: string | null
    }
  }>
}

// 文章详情类型
export interface PostDetail extends PostWithRelations {
  // 导航相关
  prevPost?: {
    id: string
    title: string
    slug: string
  }
  nextPost?: {
    id: string
    title: string
    slug: string
  }
  // 相关文章
  relatedPosts?: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    featuredImage: string | null
    publishedAt: Date | null
    author: {
      name: string
    }
  }>
}

// 创建/更新文章的输入类型
export interface PostInput {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status?: PostStatus
  metaKeywords?: string
  metaDescription?: string
  isFeatured?: boolean
  tagIds?: string[]
}

// 文章查询参数
export interface PostQueryParams {
  status?: PostStatus
  authorId?: string
  tagSlug?: string
  isFeatured?: boolean
  search?: string
  page?: number
  limit?: number
  orderBy?: 'publishedAt' | 'viewCount' | 'likeCount'
  order?: 'asc' | 'desc'
}

// 文章统计数据
export interface PostStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
  avgReadingTime: number
  postsByStatus: {
    draft: number
    published: number
    archived: number
  }
}

// 为了向后兼容，保留Article类型作为别名
export type Article = PostWithRelations
export type ArticleListItem = PostListItem

// 辅助函数：计算阅读时间
export function calculateReadingTime(wordCount: number): number {
  // 假设平均阅读速度为每分钟200字
  return Math.ceil(wordCount / 200)
}

// 辅助函数：格式化日期
export function formatPostDate(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 辅助函数：格式化阅读时间
export function formatReadingTime(minutes: number | null): string {
  if (!minutes) return ''
  return `${minutes} 分钟阅读`
}