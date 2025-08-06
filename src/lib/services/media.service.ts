import prisma from '@/lib/db'

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

export interface MediaListQuery {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MediaListResponse {
  media: Media[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CreateMediaRequest {
  filename: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  alt?: string
}

export interface UpdateMediaRequest {
  alt?: string
}

interface MediaWhereInput {
  OR?: Array<{
    filename?: {
      contains: string
    }
    originalName?: {
      contains: string
    }
    alt?: {
      contains: string
    }
  }>
  mimeType?: {
    startsWith: string
  }
}

interface MediaOrderByInput {
  [key: string]: 'asc' | 'desc'
}

export class MediaService {
  static async getMediaList(query: MediaListQuery): Promise<MediaListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      type,
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = query

    const skip = (page - 1) * pageSize

    const where: MediaWhereInput = {}

    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { originalName: { contains: search } },
        { alt: { contains: search } }
      ]
    }

    if (type) {
      where.mimeType = { startsWith: type }
    }

    const orderBy: MediaOrderByInput = {}
    orderBy[sortBy] = sortOrder

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.media.count({ where })
    ])

    const transformedMedia = media.map(item => ({
      id: item.id,
      filename: item.filename,
      originalName: item.originalName,
      path: item.path,
      url: item.url,
      mimeType: item.mimeType,
      size: item.size,
      alt: item.alt || undefined,
      uploadedAt: item.uploadedAt
    }))

    return {
      media: transformedMedia,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  static async getMediaById(id: string): Promise<Media | null> {
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (!media) {
      return null
    }

    return {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      path: media.path,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      alt: media.alt || undefined,
      uploadedAt: media.uploadedAt
    }
  }

  static async createMedia(data: CreateMediaRequest): Promise<Media> {
    const media = await prisma.media.create({
      data
    })

    return {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      path: media.path,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      alt: media.alt || undefined,
      uploadedAt: media.uploadedAt
    }
  }

  static async updateMedia(id: string, data: UpdateMediaRequest): Promise<Media> {
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    })

    if (!existingMedia) {
      throw new Error('媒体文件不存在')
    }

    const media = await prisma.media.update({
      where: { id },
      data
    })

    return {
      id: media.id,
      filename: media.filename,
      originalName: media.originalName,
      path: media.path,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      alt: media.alt || undefined,
      uploadedAt: media.uploadedAt
    }
  }

  static async deleteMedia(id: string): Promise<void> {
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    })

    if (!existingMedia) {
      throw new Error('媒体文件不存在')
    }

    await prisma.media.delete({
      where: { id }
    })
  }

  static async getMediaStats() {
    const [total, byType, totalSize] = await Promise.all([
      prisma.media.count(),
      prisma.media.groupBy({
        by: ['mimeType'],
        _count: { mimeType: true },
        _sum: { size: true }
      }),
      prisma.media.aggregate({ _sum: { size: true } })
    ])

    const typeStats = byType.reduce((acc, item) => {
      const type = item.mimeType.split('/')[0]
      if (!acc[type]) {
        acc[type] = { count: 0, size: 0 }
      }
      acc[type].count += item._count.mimeType
      acc[type].size += item._sum.size || 0
      return acc
    }, {} as Record<string, { count: number; size: number }>)

    return {
      total,
      totalSize: totalSize._sum.size || 0,
      byType: typeStats
    }
  }

  static async getRecentMedia(limit: number = 10): Promise<Media[]> {
    const media = await prisma.media.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: limit
    })

    return media.map(item => ({
      id: item.id,
      filename: item.filename,
      originalName: item.originalName,
      path: item.path,
      url: item.url,
      mimeType: item.mimeType,
      size: item.size,
      alt: item.alt || undefined,
      uploadedAt: item.uploadedAt
    }))
  }
}