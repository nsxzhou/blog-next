/**
 * 搜索相关类型定义
 */

export type SearchResultType = "post" | "page" | "tag";

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: SearchResultType;
  url: string;
  tags?: string[];
  date?: string;
  relevance?: number;
}

export interface SearchQuery {
  q: string;
  type?: SearchResultType;
  limit?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  type: SearchResultType | "all";
}

export interface SearchSuggestionsQuery {
  q?: string;
  limit?: number;
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
  query: string;
}
