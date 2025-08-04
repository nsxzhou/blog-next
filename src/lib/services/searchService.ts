import { PostService } from './post.service'
import { PageService } from './page.service'
import { TagService } from './tag.service'
import { 
  SearchQuery, 
  SearchResponse, 
  SearchSuggestionsQuery, 
  SearchSuggestionsResponse,
  SearchResult
} from '@/types/blog/search'

export class SearchService {
  static async search(query: SearchQuery): Promise<SearchResponse> {
    const {
      q: searchTerm,
      type,
      page = 1,
      pageSize = 20,
      limit = pageSize
    } = query

    const results: SearchResult[] = []
    const searchQuery = searchTerm.toLowerCase().trim()

    if (!searchQuery) {
      return {
        results: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        query: searchTerm,
        type: type || 'all'
      }
    }

    // 搜索文章
    if (!type || type === 'post') {
      const posts = await PostService.getPostList({
        page,
        pageSize: limit,
        search: searchQuery,
        status: 'PUBLISHED'
      })
      
      posts.posts.forEach(post => {
        results.push({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          type: 'post',
          url: `/posts/${post.slug}`,
          tags: post.tags?.map(tag => tag.name) || [],
          date: post.publishedAt?.toISOString(),
          relevance: this.calculateRelevance(searchQuery, post.title, post.excerpt || '')
        })
      })
    }

    // 搜索页面
    if (!type || type === 'page') {
      const pages = await PageService.getPageList({
        page,
        pageSize: limit,
        search: searchQuery,
        status: 'PUBLISHED'
      })
      
      pages.pages.forEach(page => {
        results.push({
          id: page.id,
          title: page.title,
          excerpt: page.excerpt || '',
          type: 'page',
          url: `/pages/${page.slug}`,
          date: page.publishedAt?.toISOString(),
          relevance: this.calculateRelevance(searchQuery, page.title, page.excerpt || '')
        })
      })
    }

    // 搜索标签
    if (!type || type === 'tag') {
      const tags = await TagService.getTagList({
        page,
        pageSize: limit,
        search: searchQuery
      })
      
      tags.tags.forEach(tag => {
        results.push({
          id: tag.id,
          title: tag.name,
          excerpt: `查看所有关于"${tag.name}"的文章`,
          type: 'tag',
          url: `/tags/${tag.slug}`,
          relevance: this.calculateTagRelevance(searchQuery, tag.name)
        })
      })
    }

    // 按相关度排序
    const sortedResults = results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    
    // 应用限制
    const limitedResults = sortedResults.slice(0, limit)

    return {
      results: limitedResults,
      total: sortedResults.length,
      page,
      pageSize: limitedResults.length,
      totalPages: Math.ceil(sortedResults.length / pageSize),
      query: searchTerm,
      type: type || 'all'
    }
  }

  /**
   * 获取搜索建议
   * @param query 搜索建议查询参数
   * @returns 搜索建议响应
   */
  static async getSearchSuggestions(query: SearchSuggestionsQuery): Promise<SearchSuggestionsResponse> {
    const { q: searchTerm, limit = 10 } = query
    const searchQuery = searchTerm?.toLowerCase().trim() || ''

    let suggestions: string[] = []

    if (searchQuery) {
      // 从标签获取建议
      const tags = await TagService.getTagList({
        search: searchQuery,
        pageSize: limit
      })
      suggestions.push(...tags.tags.map(tag => tag.name))

      // 限制建议数量
      suggestions = suggestions.slice(0, limit)
    } else {
      // 如果没有搜索词，返回热门标签
      const allTags = await TagService.getAllTags()
      suggestions = allTags
        .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
        .slice(0, limit)
        .map(tag => tag.name)
    }

    return {
      suggestions,
      query: searchTerm || ''
    }
  }

  /**
   * 计算相关度
   * @param query 搜索关键词
   * @param title 标题
   * @param excerpt 摘要
   * @returns 相关度分数
   */
  private static calculateRelevance(query: string, title: string, excerpt: string): number {
    let score = 0
    
    // 标题匹配
    if (title.toLowerCase().includes(query)) {
      score += 10
    }
    
    // 标题完全匹配
    if (title.toLowerCase() === query) {
      score += 20
    }
    
    // 摘要匹配
    if (excerpt.toLowerCase().includes(query)) {
      score += 5
    }
    
    return score
  }

  /**
   * 计算标签相关度
   * @param query 搜索关键词
   * @param tagName 标签名称
   * @returns 相关度分数
   */
  private static calculateTagRelevance(query: string, tagName: string): number {
    let score = 0
    
    // 标签名称匹配
    if (tagName.toLowerCase().includes(query)) {
      score += 15
    }
    
    // 标签名称完全匹配
    if (tagName.toLowerCase() === query) {
      score += 25
    }
    
    return score
  }
}