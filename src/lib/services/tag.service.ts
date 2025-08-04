import prisma from '@/lib/db'
import { Tag, TagListQuery, TagListResponse, CreateTagRequest, UpdateTagRequest } from '@/types/blog/tag'

interface TagWhereInput {
  OR?: Array<{
    name?: {
      contains: string
    }
    description?: {
      contains: string
    }
  }>
}

interface TagOrderByWithCount {
  posts?: {
    _count: 'asc' | 'desc'
  }
  name?: 'asc' | 'desc'
  createdAt?: 'asc' | 'desc'
}

export class TagService {
  static async getTagList(query: TagListQuery): Promise<TagListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    const skip = (page - 1) * pageSize

    const where: TagWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const orderBy: TagOrderByWithCount = {}

    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder
        break
      case 'postCount':
        orderBy.posts = { _count: sortOrder }
        break
      default:
        orderBy.createdAt = sortOrder
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.tag.count({ where })
    ])

    const transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }))

    return {
      tags: transformedTags,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  static async getTagById(id: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return null
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }
  }

  static async createTag(data: CreateTagRequest): Promise<Tag> {
    const tag = await prisma.tag.create({
      data,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }
  }

  static async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      throw new Error('标签不存在')
    }

    const tag = await prisma.tag.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }
  }

  static async deleteTag(id: string): Promise<void> {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!existingTag) {
      throw new Error('标签不存在')
    }

    await prisma.tag.delete({
      where: { id }
    })
  }

  static async getTagBySlug(slug: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!tag) {
      return null
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }
  }

  static async getAllTags(): Promise<Tag[]> {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      color: tag.color || undefined,
      createdAt: tag.createdAt,
      postCount: tag._count.posts
    }))
  }
}