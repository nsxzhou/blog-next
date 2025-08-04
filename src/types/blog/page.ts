/**
 * 页面相关类型定义
 */

import { PageStatus } from '@/generated/prisma'

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  searchContent?: string
  status: PageStatus
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  authorId: string
  order: number
  template?: string
  featured: boolean
  author?: {
    id: string
    name: string
    email: string
  }
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

export interface CreatePageRequest {
  title: string
  slug: string
  content: string
  excerpt?: string
  status: PageStatus
  publishedAt?: Date
  order?: number
  template?: string
  featured?: boolean
}

export interface UpdatePageRequest {
  id: string
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  status?: PageStatus
  publishedAt?: Date
  order?: number
  template?: string
  featured?: boolean
}

export interface PageListQuery {
  page?: number
  pageSize?: number
  status?: PageStatus
  search?: string
  featured?: boolean
  authorId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'order'
  sortOrder?: 'asc' | 'desc'
}

export interface PageListResponse {
  pages: Page[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}