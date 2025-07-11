import { prisma } from '@/lib/prisma'
import { Tag, Prisma } from '@prisma/client'
import { cache } from 'react'

export interface TagWithCount extends Tag {
  _count: {
    posts: number
  }
}

// 获取所有标签
export const getAllTags = cache(async (): Promise<TagWithCount[]> => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    }
  })

  return tags
})

// 根据slug获取标签
export const getTagBySlug = cache(async (slug: string): Promise<Tag | null> => {
  return prisma.tag.findUnique({
    where: { slug }
  })
})

// 获取热门标签
export const getPopularTags = cache(async (limit: number = 10): Promise<TagWithCount[]> => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: {
      posts: {
        _count: 'desc'
      }
    },
    take: limit,
    where: {
      posts: {
        some: {
          post: {
            status: 'PUBLISHED'
          }
        }
      }
    }
  })

  return tags
})

// 创建标签
export async function createTag(data: {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
}) {
  return prisma.tag.create({
    data
  })
}

// 更新标签
export async function updateTag(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string
    color?: string
    icon?: string
  }
) {
  return prisma.tag.update({
    where: { id },
    data
  })
}

// 删除标签
export async function deleteTag(id: string) {
  return prisma.tag.delete({
    where: { id }
  })
}

// 批量创建标签（如果不存在）
export async function findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
  const tags: Tag[] = []

  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    
    let tag = await prisma.tag.findUnique({
      where: { slug }
    })

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          name,
          slug
        }
      })
    }

    tags.push(tag)
  }

  return tags
}