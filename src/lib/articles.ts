import { prisma } from '@/lib/prisma'
import { 
  PostWithRelations, 
  PostListItem, 
  PostDetail, 
  PostQueryParams,
  PostStats,
  calculateReadingTime
} from '@/types/article'
import { PostStatus, Prisma } from '@prisma/client'
import { cache } from 'react'

// 获取文章列表
export const getArticles = cache(async (params?: PostQueryParams): Promise<PostListItem[]> => {
  const {
    status = PostStatus.PUBLISHED,
    authorId,
    tagSlug,
    isFeatured,
    search,
    page = 1,
    limit = 10,
    orderBy = 'publishedAt',
    order = 'desc'
  } = params || {}

  // 构建查询条件
  const where: Prisma.PostWhereInput = {
    status,
    ...(authorId && { authorId }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(tagSlug && {
      tags: {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      }
    }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      ]
    })
  }

  // 构建排序条件
  const orderByClause: Prisma.PostOrderByWithRelationInput = {
    [orderBy]: order
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: orderByClause,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      status: true,
      viewCount: true,
      likeCount: true,
      wordCount: true,
      readingTime: true,
      isFeatured: true,
      publishedAt: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        }
      }
    }
  })

  return posts
})

// 根据slug获取文章详情
export const getArticleBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          likes: true,
          analytics: true
        }
      }
    }
  })

  if (!post) return null

  // 获取上一篇和下一篇文章
  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: {
          lt: post.publishedAt || post.createdAt
        }
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true
      }
    }),
    prisma.post.findFirst({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: {
          gt: post.publishedAt || post.createdAt
        }
      },
      orderBy: { publishedAt: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true
      }
    })
  ])

  // 获取相关文章（基于标签）
  const tagIds = post.tags.map(t => t.tag.id)
  const relatedPosts = tagIds.length > 0 ? await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      id: { not: post.id },
      tags: {
        some: {
          tagId: { in: tagIds }
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      author: {
        select: {
          name: true
        }
      }
    }
  }) : []

  // 更新浏览次数
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } }
  })

  return {
    ...post,
    prevPost: prevPost || undefined,
    nextPost: nextPost || undefined,
    relatedPosts
  }
})

// 获取所有文章的slug（用于静态生成）
export const getAllArticleSlugs = cache(async (): Promise<string[]> => {
  const posts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true }
  })

  return posts.map(post => post.slug)
})

// 获取特色文章
export const getFeaturedArticles = cache(async (limit: number = 5): Promise<PostListItem[]> => {
  return getArticles({
    isFeatured: true,
    limit,
    orderBy: 'publishedAt',
    order: 'desc'
  })
})

// 获取热门文章（基于浏览量）
export const getPopularArticles = cache(async (limit: number = 5): Promise<PostListItem[]> => {
  return getArticles({
    limit,
    orderBy: 'viewCount',
    order: 'desc'
  })
})

// 获取文章统计数据
export const getArticleStats = cache(async (): Promise<PostStats> => {
  const [totalPosts, stats] = await Promise.all([
    prisma.post.count(),
    prisma.post.aggregate({
      _sum: {
        viewCount: true,
        likeCount: true,
        readingTime: true
      },
      _avg: {
        readingTime: true
      }
    })
  ])

  const postsByStatus = await prisma.post.groupBy({
    by: ['status'],
    _count: true
  })

  const statusCounts = {
    draft: 0,
    published: 0,
    archived: 0
  }

  postsByStatus.forEach(item => {
    if (item.status === PostStatus.DRAFT) statusCounts.draft = item._count
    if (item.status === PostStatus.PUBLISHED) statusCounts.published = item._count
    if (item.status === PostStatus.ARCHIVED) statusCounts.archived = item._count
  })

  return {
    totalPosts,
    totalViews: stats._sum.viewCount || 0,
    totalLikes: stats._sum.likeCount || 0,
    avgReadingTime: Math.round(stats._avg.readingTime || 0),
    postsByStatus: statusCounts
  }
})

// 创建文章
export async function createArticle(data: {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status?: PostStatus
  authorId: string
  tagIds?: string[]
  metaKeywords?: string
  metaDescription?: string
  isFeatured?: boolean
}) {
  const { tagIds, ...postData } = data
  
  // 计算字数和阅读时间
  const wordCount = postData.content.length
  const readingTime = calculateReadingTime(wordCount)

  const post = await prisma.post.create({
    data: {
      ...postData,
      wordCount,
      readingTime,
      publishedAt: postData.status === PostStatus.PUBLISHED ? new Date() : null,
      ...(tagIds && tagIds.length > 0 && {
        tags: {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      })
    },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  return post
}

// 更新文章
export async function updateArticle(
  id: string,
  data: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    featuredImage?: string
    status?: PostStatus
    tagIds?: string[]
    metaKeywords?: string
    metaDescription?: string
    isFeatured?: boolean
  }
) {
  const { tagIds, ...postData } = data

  // 如果更新了内容，重新计算字数和阅读时间
  if (postData.content) {
    const wordCount = postData.content.length
    const readingTime = calculateReadingTime(wordCount)
    Object.assign(postData, { wordCount, readingTime })
  }

  // 如果文章从草稿变为发布状态，设置发布时间
  if (postData.status === PostStatus.PUBLISHED) {
    const currentPost = await prisma.post.findUnique({
      where: { id },
      select: { status: true, publishedAt: true }
    })
    
    if (currentPost?.status !== PostStatus.PUBLISHED && !currentPost?.publishedAt) {
      Object.assign(postData, { publishedAt: new Date() })
    }
  }

  // 更新文章
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...postData,
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      })
    },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  return post
}

// 删除文章
export async function deleteArticle(id: string) {
  return prisma.post.delete({
    where: { id }
  })
}

// 点赞文章
export async function likeArticle(postId: string, userId: string) {
  // 检查是否已经点赞
  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId
      }
    }
  })

  if (existingLike) {
    // 取消点赞
    await prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } }
    })

    return false // 返回false表示取消点赞
  } else {
    // 添加点赞
    await prisma.postLike.create({
      data: {
        postId,
        userId
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } }
    })

    return true // 返回true表示点赞成功
  }
}

// 检查用户是否点赞了文章
export async function checkUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const like = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId
      }
    }
  })

  return !!like
}