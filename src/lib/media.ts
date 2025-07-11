import { prisma } from '@/lib/prisma'
import { Media, MediaType } from '@prisma/client'

export interface MediaWithUser extends Media {
  uploader: {
    id: string
    name: string
    email: string
  }
}

export interface MediaQueryParams {
  type?: MediaType
  search?: string
  userId?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'size' | 'filename'
  sortOrder?: 'asc' | 'desc'
}

// 创建媒体记录
export async function createMedia(data: {
  filename: string
  url: string
  type: MediaType
  size: number
  mimeType: string
  width?: number
  height?: number
  userId: string
  metadata?: any
}) {
  return prisma.media.create({
    data: {
      filename: data.filename,
      url: data.url,
      type: data.type,
      size: data.size,
      mimeType: data.mimeType,
      width: data.width,
      height: data.height,
      uploaderId: data.userId,
      metadata: data.metadata || {}
    }
  })
}

// 获取媒体列表
export async function getMediaList(params: MediaQueryParams = {}) {
  const {
    type,
    search,
    userId,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params

  const where: any = {}

  if (type) {
    where.type = type
  }

  if (userId) {
    where.uploadedById = userId
  }

  if (search) {
    where.OR = [
      { filename: { contains: search, mode: 'insensitive' } },
      { metadata: { path: ['alt'], string_contains: search } }
    ]
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.media.count({ where })
  ])

  return {
    media,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }
}

// 获取单个媒体
export async function getMediaById(id: string): Promise<MediaWithUser | null> {
  return prisma.media.findUnique({
    where: { id },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

// 更新媒体信息
export async function updateMedia(
  id: string,
  data: {
    filename?: string
    metadata?: any
  }
) {
  return prisma.media.update({
    where: { id },
    data
  })
}

// 删除媒体
export async function deleteMedia(id: string) {
  return prisma.media.delete({
    where: { id }
  })
}

// 批量删除媒体
export async function deleteMediaBatch(ids: string[]) {
  return prisma.media.deleteMany({
    where: {
      id: { in: ids }
    }
  })
}

// 获取媒体统计
export async function getMediaStats(userId?: string) {
  const where = userId ? { uploaderId: userId } : {}

  const [totalCount, totalSize, byType] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.aggregate({
      where,
      _sum: { size: true }
    }),
    prisma.media.groupBy({
      by: ['type'],
      where,
      _count: true,
      _sum: { size: true }
    })
  ])

  return {
    totalCount,
    totalSize: totalSize._sum.size || 0,
    byType: byType.map(item => ({
      type: item.type,
      count: item._count,
      size: item._sum.size || 0
    }))
  }
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

// 获取媒体类型
export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'OTHER'
  return 'DOCUMENT'
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证文件类型
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2)
      return mimeType.startsWith(prefix + '/')
    }
    return mimeType === type
  })
}

// 获取图片尺寸（仅在浏览器端使用）
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}