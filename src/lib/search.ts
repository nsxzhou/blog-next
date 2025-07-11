// 数据库搜索功能
import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { SearchResult, SearchOptions } from '@/types/search'
import { PostStatus, ProjectStatus } from '@prisma/client'

// 计算相关性得分
function calculateScore(query: string, text: string): number {
  if (!text) return 0
  
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  
  // 完全匹配
  if (lowerText === lowerQuery) return 1
  
  // 开头匹配
  if (lowerText.startsWith(lowerQuery)) return 0.8
  
  // 包含匹配
  if (lowerText.includes(lowerQuery)) return 0.6
  
  // 模糊匹配（基于字符相似度）
  const similarity = fuzzyMatch(lowerQuery, lowerText)
  return similarity * 0.4
}

// 简单的模糊匹配算法
function fuzzyMatch(query: string, text: string): number {
  let score = 0
  let queryIndex = 0
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      score++
      queryIndex++
    }
  }
  
  return queryIndex === query.length ? score / query.length : 0
}

// 高亮匹配文本
function highlightText(text: string, query: string): string {
  if (!text) return ''
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 搜索文章
async function searchArticles(query: string, options: SearchOptions): Promise<SearchResult[]> {
  // 使用 Prisma 的全文搜索（MySQL支持）
  const articles = await prisma.post.findMany({
    where: {
      AND: [
        { status: PostStatus.PUBLISHED },
        {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
            { metaKeywords: { contains: query } }
          ]
        }
      ]
    },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      },
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
    },
    orderBy: { publishedAt: 'desc' },
    take: options.limit || 10
  })

  const results: SearchResult[] = []
  
  for (const article of articles) {
    const titleScore = calculateScore(query, article.title)
    const excerptScore = calculateScore(query, article.excerpt || '') * 0.7
    const tagScore = article.tags.length > 0
      ? Math.max(...article.tags.map(pt => calculateScore(query, pt.tag.name))) * 0.5
      : 0
    
    const totalScore = Math.max(titleScore, excerptScore, tagScore)
    
    if (totalScore > (options.threshold || 0.3)) {
      results.push({
        id: article.id,
        title: article.title,
        description: article.excerpt || '',
        type: 'post' as const,
        slug: article.slug,
        url: `/articles/${article.slug}`,
        highlight: {
          title: highlightText(article.title, query),
          description: highlightText(article.excerpt || '', query)
        },
        metadata: {
          publishedAt: article.publishedAt || undefined,
          author: article.author.name,
          readingTime: Math.ceil(article.wordCount / 200),
          tags: article.tags.map(pt => ({
            name: pt.tag.name,
            slug: pt.tag.slug,
            color: pt.tag.color || undefined
          })),
          viewCount: article._count.analytics
        },
        score: totalScore
      })
    }
  }
  
  return results
}

// 搜索标签
async function searchTags(query: string, options: SearchOptions): Promise<SearchResult[]> {
  const tags = await prisma.tag.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } }
      ]
    },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    take: options.limit || 5
  })
  
  const results: SearchResult[] = []
  
  for (const tag of tags) {
    const nameScore = calculateScore(query, tag.name)
    const descScore = calculateScore(query, tag.description || '') * 0.7
    const totalScore = Math.max(nameScore, descScore)
    
    if (totalScore > (options.threshold || 0.3)) {
      results.push({
        id: `tag-${tag.id}`,
        title: tag.name,
        description: tag.description || `查看所有关于"${tag.name}"的内容`,
        type: 'tag',
        slug: tag.slug,
        url: `/articles?tag=${encodeURIComponent(tag.slug)}`,
        highlight: {
          title: highlightText(tag.name, query),
          description: highlightText(tag.description || '', query)
        },
        metadata: {},
        score: totalScore
      })
    }
  }
  
  return results
}

// 搜索项目
async function searchProjects(query: string, options: SearchOptions): Promise<SearchResult[]> {
  const projects = await prisma.project.findMany({
    where: {
      AND: [
        { status: ProjectStatus.PUBLISHED },
        {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } }
          ]
        }
      ]
    },
    orderBy: { order: 'asc' },
    take: options.limit || 5
  })
  
  const results: SearchResult[] = []
  
  for (const project of projects) {
    const titleScore = calculateScore(query, project.title)
    const descScore = calculateScore(query, project.description) * 0.7
    
    // 搜索技术栈
    const techStack = project.techStack as string[]
    const techScore = techStack && techStack.length > 0
      ? Math.max(...techStack.map(tech => calculateScore(query, tech))) * 0.5
      : 0
    
    const totalScore = Math.max(titleScore, descScore, techScore)
    
    if (totalScore > (options.threshold || 0.3)) {
      results.push({
        id: `project-${project.id}`,
        title: project.title,
        description: project.description,
        type: 'project',
        slug: project.slug,
        url: `/projects/${project.slug}`,
        highlight: {
          title: highlightText(project.title, query),
          description: highlightText(project.description, query)
        },
        metadata: {
          techStack: techStack || []
        },
        score: totalScore
      })
    }
  }
  
  return results
}

// 主搜索函数
export const searchContent = cache(async (
  query: string, 
  options: SearchOptions = {}
): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) {
    return []
  }
  
  const trimmedQuery = query.trim()
  const limit = options.limit || 20
  
  // 根据类型过滤
  const types = options.types || ['post', 'tag', 'project']
  
  // 并行搜索所有内容类型
  const searchPromises: Promise<SearchResult[]>[] = []
  
  if (types.includes('post')) {
    searchPromises.push(searchArticles(trimmedQuery, options))
  }
  if (types.includes('tag')) {
    searchPromises.push(searchTags(trimmedQuery, options))
  }
  if (types.includes('project')) {
    searchPromises.push(searchProjects(trimmedQuery, options))
  }
  
  const results = await Promise.all(searchPromises)
  const allResults = results.flat()
  
  // 按得分排序
  allResults.sort((a, b) => b.score - a.score)
  
  // 限制结果数量
  return allResults.slice(0, limit)
})

// 获取热门搜索
export const getPopularSearches = cache(async (limit: number = 5): Promise<string[]> => {
  // 获取最近被访问最多的文章标题
  const popularPosts = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    orderBy: {
      analytics: {
        _count: 'desc'
      }
    },
    select: { title: true },
    take: limit
  })
  
  return popularPosts.map(post => post.title)
})

// 获取搜索建议
export const getSearchSuggestions = cache(async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return []
  
  const suggestions = new Set<string>()
  
  // 搜索文章标题
  const posts = await prisma.post.findMany({
    where: {
      AND: [
        { status: PostStatus.PUBLISHED },
        { title: { contains: query } }
      ]
    },
    select: { title: true },
    take: 3
  })
  
  posts.forEach(post => suggestions.add(post.title))
  
  // 搜索标签
  const tags = await prisma.tag.findMany({
    where: { name: { contains: query } },
    select: { name: true },
    take: 3
  })
  
  tags.forEach(tag => suggestions.add(tag.name))
  
  // 搜索项目
  const projects = await prisma.project.findMany({
    where: {
      AND: [
        { status: ProjectStatus.PUBLISHED },
        { title: { contains: query } }
      ]
    },
    select: { title: true },
    take: 2
  })
  
  projects.forEach(project => suggestions.add(project.title))
  
  return Array.from(suggestions).slice(0, 5)
})