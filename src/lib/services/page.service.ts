import prisma from '@/lib/db'
import { Page, PageListQuery, PageListResponse, CreatePageRequest, UpdatePageRequest } from '@/types/blog/page'
import { PageStatus } from '@/generated/prisma'

interface PageWhereInput {
  status?: PageStatus
  authorId?: string
  featured?: boolean
  OR?: Array<{
    title?: {
      contains: string
      mode: 'insensitive'
    }
    content?: {
      contains: string
      mode: 'insensitive'
    }
    excerpt?: {
      contains: string
      mode: 'insensitive'
    }
    searchContent?: {
      contains: string
      mode: 'insensitive'
    }
  }>
}

interface PageOrderByInput {
  [key: string]: 'asc' | 'desc'
}

interface PageUpdateData {
  title?: string
  content?: string
  excerpt?: string
  status?: PageStatus
  order?: number
  template?: string
  featured?: boolean
  searchContent?: string
}

export class PageService {
  static async getPageList(query: PageListQuery): Promise<PageListResponse> {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      featured,
      authorId,
      sortBy = 'order',
      sortOrder = 'asc'
    } = query

    const skip = (page - 1) * pageSize

    const where: PageWhereInput = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { searchContent: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (authorId) {
      where.authorId = authorId
    }

    const orderBy: PageOrderByInput = {}
    orderBy[sortBy] = sortOrder

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          media: {
            include: {
              media: true
            }
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.page.count({ where })
    ])

    const transformedPages = pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || undefined,
      searchContent: page.searchContent || undefined,
      status: page.status,
      publishedAt: page.publishedAt || undefined,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      authorId: page.authorId,
      order: page.order,
      template: page.template || undefined,
      featured: page.featured,
      author: page.author,
      media: page.media.map(pm => ({
        id: pm.media.id,
        filename: pm.media.filename,
        originalName: pm.media.originalName,
        path: pm.media.path,
        url: pm.media.url,
        mimeType: pm.media.mimeType,
        size: pm.media.size,
        alt: pm.media.alt || undefined,
        uploadedAt: pm.media.uploadedAt
      }))
    }))

    return {
      pages: transformedPages,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  static async getPageById(id: string): Promise<Page | null> {
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      }
    })

    if (!page) {
      return null
    }

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || undefined,
      searchContent: page.searchContent || undefined,
      status: page.status,
      publishedAt: page.publishedAt || undefined,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      authorId: page.authorId,
      order: page.order,
      template: page.template || undefined,
      featured: page.featured,
      author: page.author,
      media: page.media.map(pm => ({
        id: pm.media.id,
        filename: pm.media.filename,
        originalName: pm.media.originalName,
        path: pm.media.path,
        url: pm.media.url,
        mimeType: pm.media.mimeType,
        size: pm.media.size,
        alt: pm.media.alt || undefined,
        uploadedAt: pm.media.uploadedAt
      }))
    }
  }

  static async createPage(data: CreatePageRequest & { authorId: string }): Promise<Page> {
    const page = await prisma.page.create({
      data: {
        ...data,
        searchContent: this.extractTextFromMarkdown(data.content)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      }
    })

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || undefined,
      searchContent: page.searchContent || undefined,
      status: page.status,
      publishedAt: page.publishedAt || undefined,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      authorId: page.authorId,
      order: page.order,
      template: page.template || undefined,
      featured: page.featured,
      author: page.author,
      media: page.media.map(pm => ({
        id: pm.media.id,
        filename: pm.media.filename,
        originalName: pm.media.originalName,
        path: pm.media.path,
        url: pm.media.url,
        mimeType: pm.media.mimeType,
        size: pm.media.size,
        alt: pm.media.alt || undefined,
        uploadedAt: pm.media.uploadedAt
      }))
    }
  }

  static async updatePage(id: string, data: UpdatePageRequest): Promise<Page> {
    const existingPage = await prisma.page.findUnique({
      where: { id }
    })

    if (!existingPage) {
      throw new Error('页面不存在')
    }

    const updateData: PageUpdateData = { ...data }

    if (data.content) {
      updateData.searchContent = this.extractTextFromMarkdown(data.content)
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      }
    })

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || undefined,
      searchContent: page.searchContent || undefined,
      status: page.status,
      publishedAt: page.publishedAt || undefined,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      authorId: page.authorId,
      order: page.order,
      template: page.template || undefined,
      featured: page.featured,
      author: page.author,
      media: page.media.map(pm => ({
        id: pm.media.id,
        filename: pm.media.filename,
        originalName: pm.media.originalName,
        path: pm.media.path,
        url: pm.media.url,
        mimeType: pm.media.mimeType,
        size: pm.media.size,
        alt: pm.media.alt || undefined,
        uploadedAt: pm.media.uploadedAt
      }))
    }
  }

  static async deletePage(id: string): Promise<void> {
    const existingPage = await prisma.page.findUnique({
      where: { id }
    })

    if (!existingPage) {
      throw new Error('页面不存在')
    }

    await prisma.page.delete({
      where: { id }
    })
  }

  private static extractTextFromMarkdown(markdown: string): string {
    return markdown
      .replace(/#+\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
  }
}