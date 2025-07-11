// 搜索相关的类型定义

export type SearchResultType = 'post' | 'tag' | 'project' | 'user'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: SearchResultType
  slug: string
  url: string
  highlight?: {
    title?: string
    description?: string
    content?: string
  }
  metadata?: {
    publishedAt?: Date
    author?: string
    readingTime?: number
    tags?: Array<{
      name: string
      slug: string
      color?: string
    }>
    viewCount?: number
    techStack?: string[]
  }
  score: number
}

export interface SearchOptions {
  limit?: number
  threshold?: number
  includeScore?: boolean
  types?: SearchResultType[]
  status?: 'all' | 'published' | 'draft'
}

export interface SearchFilters {
  type?: SearchResultType
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  author?: string
}

export interface SearchSuggestion {
  text: string
  type: 'history' | 'popular' | 'auto'
  count?: number
  icon?: string
}