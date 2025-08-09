import { create, insert, remove, search } from '@orama/orama'
import { createTokenizer } from '@orama/tokenizers/mandarin'
import { stopwords as mandarinStopwords } from '@orama/stopwords/mandarin'
import { Highlight } from '@orama/highlight'
import { extractTextFromMarkdown } from '@/lib/utils/markdown'
import { PostService } from './post.service'
import { PageService } from './page.service'

/**
 * 搜索文档接口 - 统一的搜索数据结构
 */
interface SearchDocument {
  id: string
  title: string
  content: string
  excerpt: string
  type: 'post' | 'page'
  url: string
  tags: string[]
  publishedAt?: string
  author?: string
}

/**
 * 搜索高亮位置信息接口
 */
export interface HighlightPosition {
  start: number
  length: number
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  id: string
  title: string
  excerpt: string
  type: 'post' | 'page'
  url: string
  tags: string[]
  publishedAt?: string
  score: number
  positions?: {
    title?: { start: number; end: number }[]
    excerpt?: { start: number; end: number }[]
  }
  highlightedTitle?: string
  highlightedExcerpt?: string
}

/**
 * 搜索查询接口
 */
export interface SearchQuery {
  term: string
  limit?: number
}

/**
 * 搜索响应接口
 */
export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

/**
 * Orama 搜索服务类
 * 遵循 KISS、YAGNI、SOLID 原则
 * 单一职责：只负责全文搜索
 */
export class SearchService {
  private static db: any = null

  /**
   * 初始化 Orama 数据库实例
   */
  private static async initializeDB(): Promise<any> {
    if (this.db) {
      return this.db
    }

    // 创建中文分词器
    const tokenizer = createTokenizer({
      stopWords: mandarinStopwords,
    })

    // 创建 Orama 实例，定义搜索字段，配置中文分词器
    this.db = create({
      schema: {
        id: 'string',
        title: 'string',
        content: 'string', 
        excerpt: 'string',
        type: 'string',
        url: 'string',
        tags: 'string[]',
        publishedAt: 'string',
        author: 'string'
      },
      components: {
        tokenizer
      }
    })

    // 首次初始化时自动重建索引
    try {
      await this.rebuildIndex()
    } catch (error) {
      console.error('首次初始化搜索索引失败:', error)
    }

    return this.db
  }

  /**
   * 重建整个搜索索引
   * 从数据库获取所有已发布的文章和页面
   */
  static async rebuildIndex(): Promise<void> {
    try {
      // 创建中文分词器
      const tokenizer = createTokenizer({
        stopWords: mandarinStopwords,
      })

      // 如果数据库实例不存在，创建新实例（但不调用rebuildIndex避免递归）
      if (!this.db) {
        this.db = create({
          schema: {
            id: 'string',
            title: 'string',
            content: 'string', 
            excerpt: 'string',
            type: 'string',
            url: 'string',
            tags: 'string[]',
            publishedAt: 'string',
            author: 'string'
          },
          components: {
            tokenizer
          }
        })
      } else {
        // 重置现有数据库实例
        this.db = create({
          schema: {
            id: 'string',
            title: 'string',
            content: 'string', 
            excerpt: 'string',
            type: 'string',
            url: 'string',
            tags: 'string[]',
            publishedAt: 'string',
            author: 'string'
          },
          components: {
            tokenizer
          }
        })
      }

      // 获取所有已发布的文章
      const postsResponse = await PostService.getPostList({
        status: 'PUBLISHED',
        pageSize: 1000 // 假设不会超过1000篇文章
      })

      // 获取所有已发布的页面  
      const pagesResponse = await PageService.getPageList({
        status: 'PUBLISHED',
        pageSize: 1000 // 假设不会超过1000个页面
      })

      // 将文章数据转换为搜索文档
      for (const post of postsResponse.posts) {
        const searchDoc: SearchDocument = {
          id: post.id,
          title: post.title,
          content: post.searchContent || extractTextFromMarkdown(post.content),
          excerpt: post.excerpt || '',
          type: 'post',
          url: `/posts/${post.slug}`,
          tags: post.tags?.map(tag => tag.name) || [],
          publishedAt: post.publishedAt?.toISOString(),
          author: post.author?.name || ''
        }

        await insert(this.db, searchDoc)
      }

      // 将页面数据转换为搜索文档
      for (const page of pagesResponse.pages) {
        const searchDoc: SearchDocument = {
          id: page.id,
          title: page.title,
          content: page.searchContent || extractTextFromMarkdown(page.content),
          excerpt: page.excerpt || '',
          type: 'page',
          url: `/pages/${page.slug}`,
          tags: [],
          publishedAt: page.publishedAt?.toISOString(),
          author: page.author?.name || ''
        }

        await insert(this.db, searchDoc)
      }

      console.log(`搜索索引重建完成：${postsResponse.posts.length} 篇文章，${pagesResponse.pages.length} 个页面`)
    } catch (error) {
      console.error('重建搜索索引失败:', error)
      throw error
    }
  }

  /**
   * 执行搜索
   * @param query 搜索查询参数
   * @returns 搜索结果
   */
  static async search(query: SearchQuery): Promise<SearchResponse> {
    const { term, limit = 20 } = query

    if (!term.trim()) {
      return {
        results: [],
        total: 0,
        query: term
      }
    }

    try {
      const db = await this.initializeDB()
      
      // 使用 Orama 执行搜索
      // 搜索标题、内容、摘要、标签和作者字段
      const searchResult = await search(db, {
        term: term.trim(),
        properties: ['title', 'content', 'excerpt', 'tags', 'author'],
        limit
      })

      // 创建高亮器实例
      const highlighter = new Highlight({
        caseSensitive: false,
        HTMLTag: 'mark',
        CSSClass: 'orama-highlight'
      })

      // 转换搜索结果格式，包含高亮位置信息
      const results: SearchResult[] = searchResult.hits.map((hit: any) => {
        // 为标题和摘要生成高亮信息
        const titleHighlight = highlighter.highlight(hit.document.title || '', term.trim())
        const excerptHighlight = highlighter.highlight(hit.document.excerpt || '', term.trim())
        
        return {
          id: hit.document.id,
          title: hit.document.title,
          excerpt: hit.document.excerpt,
          type: hit.document.type as 'post' | 'page',
          url: hit.document.url,
          tags: hit.document.tags,
          publishedAt: hit.document.publishedAt,
          score: hit.score,
          positions: {
            title: titleHighlight.positions,
            excerpt: excerptHighlight.positions
          },
          highlightedTitle: titleHighlight.HTML,
          highlightedExcerpt: excerptHighlight.HTML
        }
      })

      return {
        results,
        total: searchResult.count,
        query: term
      }
    } catch (error) {
      console.error('搜索失败:', error)
      return {
        results: [],
        total: 0,
        query: term
      }
    }
  }

  /**
   * 添加或更新单个文档到搜索索引
   * 用于数据更新时同步索引
   */
  static async upsertDocument(document: SearchDocument): Promise<void> {
    try {
      const db = await this.initializeDB()
      
      // 先尝试移除已存在的文档，再插入新文档
      // 这是因为 Orama 没有直接的更新操作
      try {
        await remove(db, document.id)
      } catch {
        // 忽略删除失败（文档可能不存在）
      }
      
      await insert(db, document)
    } catch (error) {
      console.error('更新搜索索引失败:', error)
      throw error
    }
  }

  /**
   * 从搜索索引中移除文档
   * 用于删除内容时同步索引
   */
  static async removeDocument(id: string): Promise<void> {
    try {
      const db = await this.initializeDB()
      await remove(db, id)
    } catch (error) {
      console.error('从搜索索引移除文档失败:', error)
      throw error
    }
  }
}