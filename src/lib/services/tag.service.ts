import prisma from '@/lib/db'
import { Tag, TagListQuery, TagListResponse, CreateTagRequest, UpdateTagRequest } from '@/types/blog/tag'

interface TagCreateRequest {
  name: string
  slug: string
  description?: string
  color?: string
}

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
    // 检查 slug 是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { slug: data.slug }
    })

    let finalSlug = data.slug
    
    // 如果 slug 已存在，添加后缀确保唯一性
    if (existingTag) {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 7)
      finalSlug = `${data.slug}-${timestamp}-${random}`
    }

    const tag = await prisma.tag.create({
      data: {
        ...data,
        slug: finalSlug
      },
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

    let finalSlug = data.slug || existingTag.slug
    
    // 如果要更新 slug，检查是否已存在
    if (data.slug && data.slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug: data.slug }
      })
      
      if (slugExists) {
        const timestamp = Date.now().toString(36)
        const random = Math.random().toString(36).substring(2, 7)
        finalSlug = `${data.slug}-${timestamp}-${random}`
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...data,
        slug: finalSlug
      },
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

  static async findOrCreateTags(tagRequests: TagCreateRequest[]): Promise<Tag[]> {
    const results: Tag[] = []
    
    for (const tagRequest of tagRequests) {
      // 查找现有标签
      const existingTag = await prisma.tag.findFirst({
        where: {
          OR: [
            { name: tagRequest.name },
            { slug: tagRequest.slug }
          ]
        }
      })

      if (existingTag) {
        // 标签已存在，直接添加到结果
        results.push({
          id: existingTag.id,
          name: existingTag.name,
          slug: existingTag.slug,
          description: existingTag.description || undefined,
          color: existingTag.color || undefined,
          createdAt: existingTag.createdAt,
          postCount: 0
        })
      } else {
        // 创建新标签
        let finalSlug = tagRequest.slug
        
        // 检查 slug 是否已存在（可能与其他标签冲突）
        const slugExists = await prisma.tag.findUnique({
          where: { slug: finalSlug }
        })
        
        if (slugExists) {
          const timestamp = Date.now().toString(36)
          const random = Math.random().toString(36).substring(2, 7)
          finalSlug = `${tagRequest.slug}-${timestamp}-${random}`
        }

        const newTag = await prisma.tag.create({
          data: {
            name: tagRequest.name,
            slug: finalSlug,
            description: tagRequest.description,
            color: tagRequest.color
          },
          include: {
            _count: {
              select: {
                posts: true
              }
            }
          }
        })

        results.push({
          id: newTag.id,
          name: newTag.name,
          slug: newTag.slug,
          description: newTag.description || undefined,
          color: newTag.color || undefined,
          createdAt: newTag.createdAt,
          postCount: newTag._count.posts
        })
      }
    }

    return results
  }
}