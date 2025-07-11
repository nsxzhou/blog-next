// 媒体文件相关的类型定义
import { Media, User } from '@prisma/client'

// 媒体文件类型（包含关联数据）
export interface MediaWithRelations extends Media {
  uploader: User
}

// 媒体文件列表项
export interface MediaListItem {
  id: string
  filename: string
  url: string
  cdnUrl: string | null
  thumbnailUrl: string | null
  mimeType: string | null
  size: number | null
  width: number | null
  height: number | null
  altText: string | null
  folder: string | null
  createdAt: Date
  uploader: {
    id: string
    name: string
  }
}

// 上传媒体文件的输入类型
export interface MediaUploadInput {
  file: File
  folder?: string
  altText?: string
}

// 更新媒体文件的输入类型
export interface MediaUpdateInput {
  filename?: string
  altText?: string
  folder?: string
}

// 媒体查询参数
export interface MediaQueryParams {
  uploaderId?: string
  folder?: string
  mimeType?: string
  search?: string
  page?: number
  limit?: number
  orderBy?: 'createdAt' | 'size' | 'filename'
  order?: 'asc' | 'desc'
}

// 媒体统计数据
export interface MediaStats {
  totalFiles: number
  totalSize: number
  filesByType: {
    images: number
    videos: number
    documents: number
    others: number
  }
  sizeByType: {
    images: number
    videos: number
    documents: number
    others: number
  }
  recentUploads: MediaListItem[]
}

// 媒体文件夹
export interface MediaFolder {
  name: string
  path: string
  fileCount: number
  totalSize: number
  createdAt?: Date
  updatedAt?: Date
}