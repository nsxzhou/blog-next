import { SearchService } from '@/lib/services/searchService'
import { PostService } from '@/lib/services/post.service'
import { PageService } from '@/lib/services/page.service'

/**
 * 搜索索引同步工具
 * 提供便捷的同步函数，用于在数据变更时更新搜索索引
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

export class SearchIndexSync {
  /**
   * 同步单个文章到搜索索引
   * @param postId 文章ID
   */
  static async syncPost(postId: string): Promise<void> {
    try {
      const post = await PostService.getPostById(postId)
      
      if (!post) {
        // 文章不存在，从索引中移除
        await SearchService.removeDocument(postId)
        return
      }

      // 只同步已发布的文章
      if (post.status !== 'PUBLISHED') {
        await SearchService.removeDocument(postId)
        return
      }

      const searchDoc: SearchDocument = {
        id: post.id,
        title: post.title,
        content: post.searchContent || post.content,
        excerpt: post.excerpt || '',
        type: 'post',
        url: `/posts/${post.slug}`,
        tags: post.tags?.map(tag => tag.name) || [],
        publishedAt: post.publishedAt?.toISOString(),
        author: post.author?.name || ''
      }

      await SearchService.upsertDocument(searchDoc)
      console.log(`文章索引同步成功: ${post.title}`)
    } catch (error) {
      console.error(`同步文章索引失败 (ID: ${postId}):`, error)
      throw error
    }
  }

  /**
   * 同步单个页面到搜索索引
   * @param pageId 页面ID
   */
  static async syncPage(pageId: string): Promise<void> {
    try {
      const page = await PageService.getPageById(pageId)
      
      if (!page) {
        // 页面不存在，从索引中移除
        await SearchService.removeDocument(pageId)
        return
      }

      // 只同步已发布的页面
      if (page.status !== 'PUBLISHED') {
        await SearchService.removeDocument(pageId)
        return
      }

      const searchDoc: SearchDocument = {
        id: page.id,
        title: page.title,
        content: page.searchContent || page.content,
        excerpt: page.excerpt || '',
        type: 'page',
        url: `/pages/${page.slug}`,
        tags: [],
        publishedAt: page.publishedAt?.toISOString(),
        author: page.author?.name || ''
      }

      await SearchService.upsertDocument(searchDoc)
      console.log(`页面索引同步成功: ${page.title}`)
    } catch (error) {
      console.error(`同步页面索引失败 (ID: ${pageId}):`, error)
      throw error
    }
  }

  /**
   * 从搜索索引中移除文档
   * @param documentId 文档ID
   */
  static async removeDocument(documentId: string): Promise<void> {
    try {
      await SearchService.removeDocument(documentId)
      console.log(`文档已从搜索索引移除: ${documentId}`)
    } catch (error) {
      console.error(`移除文档索引失败 (ID: ${documentId}):`, error)
      throw error
    }
  }

  /**
   * 批量同步多个文章
   * @param postIds 文章ID列表
   */
  static async syncPosts(postIds: string[]): Promise<void> {
    const promises = postIds.map(id => this.syncPost(id))
    await Promise.all(promises)
  }

  /**
   * 批量同步多个页面
   * @param pageIds 页面ID列表
   */
  static async syncPages(pageIds: string[]): Promise<void> {
    const promises = pageIds.map(id => this.syncPage(id))
    await Promise.all(promises)
  }

  /**
   * 重建整个搜索索引
   * 这是一个重量级操作，通常在初始化或数据修复时使用
   */
  static async rebuildIndex(): Promise<void> {
    try {
      await SearchService.rebuildIndex()
      console.log('搜索索引重建完成')
    } catch (error) {
      console.error('重建搜索索引失败:', error)
      throw error
    }
  }
}