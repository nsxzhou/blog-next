/**
 * 简化的搜索相关类型定义
 * 遵循 KISS 原则，只保留核心搜索功能
 */

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'post' | 'page';
  url: string;
  tags: string[];
  publishedAt?: string;
  score: number;
}

export interface SearchQuery {
  term: string;
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}
