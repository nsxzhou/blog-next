/**
 * 文章相关类型定义
 */

import { PostStatus } from '@/generated/prisma'

export { PostStatus }

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  searchContent?: string
  status: PostStatus
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  authorId: string
  featured: boolean
  viewCount: number
  readTime?: number
  author?: {
    id: string
    name: string
    email: string
  }
  tags?: Tag[]
  media?: Media[]
}

export interface Media {
  id: string
  filename: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  alt?: string
  uploadedAt: Date
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  createdAt: Date
}

export interface CreatePostRequest {
  title: string
  slug: string
  content: string
  excerpt?: string
  status: PostStatus
  publishedAt?: Date
  featured?: boolean
  readTime?: number
  tagIds?: string[]
}

export interface UpdatePostRequest {
  id: string
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  status?: PostStatus
  publishedAt?: Date
  featured?: boolean
  readTime?: number
  tagIds?: string[]
}

export interface PostListQuery {
  page?: number
  pageSize?: number
  status?: PostStatus
  tagId?: string
  search?: string
  featured?: boolean
  authorId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount'
  sortOrder?: 'asc' | 'desc'
}

export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}