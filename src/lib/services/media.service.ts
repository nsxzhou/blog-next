import prisma from '@/lib/db'
import { 
  Media, 
  MediaListQuery, 
  MediaListResponse, 
  CreateMediaRequest, 
  UpdateMediaRequest, 
  MediaStats 
} from '@/types/blog/media'

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

/**
 * 媒体管理服务类
 * 提供媒体文件的CRUD操作和相关功能
 */
export class MediaService {
  /**
   * 获取媒体文件列表
   * @param query 查询参数
   * @returns 分页的媒体文件列表
   */
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

    if (type && type !== 'all') {
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

  /**
   * 根据ID获取媒体文件详情
   * @param id 媒体文件ID
   * @returns 媒体文件详情或null
   */
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

  /**
   * 创建新的媒体文件记录
   * @param data 媒体文件数据
   * @returns 创建的媒体文件记录
   */
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

  /**
   * 更新媒体文件信息
   * @param id 媒体文件ID
   * @param data 更新数据
   * @returns 更新后的媒体文件记录
   */
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

  /**
   * 删除媒体文件记录
   * @param id 媒体文件ID
   * @throws Error 如果媒体文件不存在
   */
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

  /**
   * 获取媒体文件统计信息
   * @returns 媒体文件统计数据
   */
  static async getMediaStats(): Promise<MediaStats> {
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

  /**
   * 获取最近上传的媒体文件
   * @param limit 返回数量限制，默认10个
   * @returns 最近上传的媒体文件列表
   */
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

  /**
   * 批量删除媒体文件记录
   * @param ids 媒体文件ID数组
   * @returns 删除的记录数量
   */
  static async batchDeleteMedia(ids: string[]): Promise<number> {
    const result = await prisma.media.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return result.count
  }

  /**
   * 检查媒体文件是否正在使用
   * @param id 媒体文件ID
   * @returns 是否正在使用及关联的内容信息
   */
  static async checkMediaUsage(id: string) {
    const contentMedia = await prisma.contentMedia.findMany({
      where: { mediaId: id },
      include: {
        post: {
          select: { id: true, title: true }
        },
        page: {
          select: { id: true, title: true }
        }
      }
    })

    const usedInPosts = contentMedia.filter(cm => cm.post).map(cm => cm.post)
    const usedInPages = contentMedia.filter(cm => cm.page).map(cm => cm.page)

    return {
      inUse: contentMedia.length > 0,
      posts: usedInPosts,
      pages: usedInPages,
      totalUsage: contentMedia.length
    }
  }
}