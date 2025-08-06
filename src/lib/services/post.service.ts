import prisma from '@/lib/db'
import { Post, PostListQuery, PostListResponse, CreatePostRequest, UpdatePostRequest } from '@/types/blog/post'
import { PostStatus } from '@/generated/prisma'

interface PostWhereInput {
  status?: PostStatus
  tags?: {
    some: {
      tagId: string
    }
  }
  authorId?: string
  featured?: boolean
  OR?: Array<{
    title?: {
      contains: string
    }
    content?: {
      contains: string
    }
    excerpt?: {
      contains: string
    }
    searchContent?: {
      contains: string
    }
  }>
}

interface PostOrderByInput {
  [key: string]: 'asc' | 'desc'
}

interface PostUpdateData {
  title?: string
  content?: string
  excerpt?: string
  status?: PostStatus
  featured?: boolean
  searchContent?: string
  tags?: {
    create: Array<{
      tagId: string
    }>
  }
}

export class PostService {
  static async getPostList(query: PostListQuery): Promise<PostListResponse> {
    const {
      page = 1,
      pageSize = 10,
      status,
      tagId,
      search,
      featured,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    const skip = (page - 1) * pageSize

    const where: PostWhereInput = {}

    if (status) {
      where.status = status
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
        { searchContent: { contains: search } }
      ]
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (authorId) {
      where.authorId = authorId
    }

    const orderBy: PostOrderByInput = {}
    orderBy[sortBy] = sortOrder

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tags: {
            include: {
              tag: true
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
      prisma.post.count({ where })
    ])

    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      searchContent: post.searchContent || undefined,
      status: post.status,
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      featured: post.featured,
      viewCount: post.viewCount,
      readTime: post.readTime || undefined,
      author: post.author,
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        color: pt.tag.color || undefined,
        createdAt: pt.tag.createdAt
      })),
      media: post.media.map(pm => ({
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
      posts: transformedPosts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      }
    })

    if (!post) {
      return null
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      searchContent: post.searchContent || undefined,
      status: post.status,
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      featured: post.featured,
      viewCount: post.viewCount,
      readTime: post.readTime || undefined,
      author: post.author,
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        color: pt.tag.color || undefined,
        createdAt: pt.tag.createdAt
      })),
      media: post.media.map(pm => ({
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

  static async getPostBySlug(slug: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        media: {
          include: {
            media: true
          }
        }
      }
    })

    if (!post) {
      return null
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      searchContent: post.searchContent || undefined,
      status: post.status,
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      featured: post.featured,
      viewCount: post.viewCount,
      readTime: post.readTime || undefined,
      author: post.author,
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        color: pt.tag.color || undefined,
        createdAt: pt.tag.createdAt
      })),
      media: post.media.map(pm => ({
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

  static async createPost(data: CreatePostRequest & { authorId: string }): Promise<Post> {
    const { tagIds, ...postData } = data

    // 处理 publishedAt 字段的字符串到 Date 转换
    const processedData = {
      ...postData,
      publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
      searchContent: this.extractTextFromMarkdown(postData.content),
    }

    const post = await prisma.post.create({
      data: {
        ...processedData,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({
            tagId
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          include: {
            tag: true
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
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      searchContent: post.searchContent || undefined,
      status: post.status,
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      featured: post.featured,
      viewCount: post.viewCount,
      readTime: post.readTime || undefined,
      author: post.author,
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        color: pt.tag.color || undefined,
        createdAt: pt.tag.createdAt
      })),
      media: post.media.map(pm => ({
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

  static async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    const { tagIds, ...postData } = data

    // 处理 publishedAt 字段的字符串到 Date 转换
    const processedData = {
      ...postData,
      publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        tags: true
      }
    })

    if (!existingPost) {
      throw new Error('文章不存在')
    }

    const updateData: PostUpdateData = { ...processedData }

    if (postData.content) {
      updateData.searchContent = this.extractTextFromMarkdown(postData.content)
    }

    if (tagIds !== undefined) {
      await prisma.postTag.deleteMany({
        where: { postId: id }
      })

      updateData.tags = {
        create: tagIds.map(tagId => ({
          tagId
        }))
      }
    }

    const post = await prisma.post.update({
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
        tags: {
          include: {
            tag: true
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
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      searchContent: post.searchContent || undefined,
      status: post.status,
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      featured: post.featured,
      viewCount: post.viewCount,
      readTime: post.readTime || undefined,
      author: post.author,
      tags: post.tags.map(pt => ({
        id: pt.tag.id,
        name: pt.tag.name,
        slug: pt.tag.slug,
        description: pt.tag.description || undefined,
        color: pt.tag.color || undefined,
        createdAt: pt.tag.createdAt
      })),
      media: post.media.map(pm => ({
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

  static async deletePost(id: string): Promise<void> {
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      throw new Error('文章不存在')
    }

    await prisma.post.delete({
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