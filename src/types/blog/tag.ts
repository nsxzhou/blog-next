/**
 * 标签相关类型定义
 */

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  createdAt: Date
  postCount?: number
}

export interface CreateTagRequest {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface UpdateTagRequest {
  id: string
  name?: string
  slug?: string
  description?: string
  color?: string
}

export interface TagListQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: 'createdAt' | 'name' | 'postCount'
  sortOrder?: 'asc' | 'desc'
}

export interface TagListResponse {
  tags: Tag[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}