/**
 * 媒体管理相关类型定义
 */

// 媒体基础信息接口
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

// 媒体查询参数接口
export interface MediaListQuery {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 媒体查询响应接口
export interface MediaListResponse {
  media: Media[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 创建媒体请求接口
export interface CreateMediaRequest {
  filename: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  alt?: string
}

// 更新媒体请求接口
export interface UpdateMediaRequest {
  alt?: string
}

// 文件上传响应接口
export interface UploadResponse {
  media: Media
  message: string
}

// 媒体统计信息接口
export interface MediaStats {
  total: number
  totalSize: number
  byType: Record<string, { count: number; size: number }>
}

// 媒体文件类型枚举
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}

// 支持的文件类型配置
export interface MediaTypeConfig {
  extensions: string[]
  mimeTypes: string[]
  maxSize: number
}

// 媒体配置接口
export interface MediaConfig {
  maxFileSize: number
  allowedTypes: Record<MediaType, MediaTypeConfig>
  uploadPath: string
  publicUrl: string
}