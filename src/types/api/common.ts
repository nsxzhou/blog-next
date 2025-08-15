// 通用 API 类型定义

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  pagination?: PaginationParams;
}

export interface QueryKey {
  key: string;
  variables?: Record<string, unknown>;
}

// API 请求参数类型
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

// React Query 相关类型
export interface UseQueryOptions {
  enabled?: boolean;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseMutationOptions<T = unknown, E = Error> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | undefined, error: E | undefined) => void;
  retry?: number;
}


export interface DatabaseOperationOptions {
  transaction?: boolean;
  validate?: boolean;
  log?: boolean;
}

// 搜索相关类型
export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'post' | 'page' | 'tag';
  url: string;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'post' | 'page' | 'tag';
  url: string;
  score?: number;
  highlights?: string[];
}

export interface SearchIndexItem {
  id: string;
  title: string;
  content: string;
  type: 'post' | 'page' | 'tag';
  url: string;
  tags?: string[];
  publishedAt?: Date;
}

// 媒体相关类型
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  path?: string;
  generateThumbnail?: boolean;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  recentUploads: MediaFile[];
}

// 表单相关类型
export interface FormField {
  name: string;
  value: unknown;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

