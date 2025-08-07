import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { useMemo } from 'react'
import { 
  Media, 
  MediaListResponse, 
  MediaListQuery, 
  MediaStats 
} from '@/types/blog/media'

/**
 * 媒体管理状态接口
 */
interface MediaState {
  // 数据状态
  media: Media[]
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  isLoading: boolean
  error: string | null
  
  // 查询参数
  searchQuery: string
  selectedType: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  
  // UI 状态
  selectedItems: Set<string>
  uploadProgress: number
  isUploading: boolean
  
  // 统计信息
  stats: MediaStats | null
}

/**
 * 媒体管理状态操作接口
 */
interface MediaActions {
  // 数据操作
  setMedia: (media: Media[]) => void
  setTotal: (total: number) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 查询操作
  setSearchQuery: (query: string) => void
  setSelectedType: (type: string) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  
  // UI 操作
  toggleItemSelection: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setUploadProgress: (progress: number) => void
  setUploading: (uploading: boolean) => void
  
  // 复合操作
  updateFromResponse: (response: MediaListResponse) => void
  resetFilters: () => void
  getQueryParams: () => MediaListQuery
  
  // 统计操作
  setStats: (stats: MediaStats) => void
}

type MediaStore = MediaState & MediaActions

/**
 * 媒体管理状态管理 store
 * 使用 Zustand 进行状态管理，支持开发工具
 */
export const useMediaStore = create<MediaStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      media: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 12,
      isLoading: false,
      error: null,
      
      searchQuery: '',
      selectedType: 'all',
      sortBy: 'uploadedAt',
      sortOrder: 'desc',
      
      viewMode: 'list',
      selectedItems: new Set(),
      uploadProgress: 0,
      isUploading: false,
      
      stats: null,
      
      // 数据操作方法
      setMedia: (media) => set({ media }),
      setTotal: (total) => set({ total }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // 查询操作方法
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setSelectedType: (selectedType) => set({ selectedType, currentPage: 1 }),
      setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
      setSortOrder: (sortOrder) => set({ sortOrder, currentPage: 1 }),
      
      // UI 操作方法
      toggleItemSelection: (id) => set((state) => {
        const newSelection = new Set(state.selectedItems)
        if (newSelection.has(id)) {
          newSelection.delete(id)
        } else {
          newSelection.add(id)
        }
        return { selectedItems: newSelection }
      }),
      
      selectAll: () => set((state) => ({
        selectedItems: new Set(state.media.map(item => item.id))
      })),
      
      clearSelection: () => set({ selectedItems: new Set() }),
      
      setUploadProgress: (uploadProgress) => set({ uploadProgress }),
      setUploading: (isUploading) => set({ isUploading }),
      
      // 复合操作方法
      updateFromResponse: (response) => set({
        media: response.media,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        pageSize: response.pageSize
      }),
      
      resetFilters: () => set({
        searchQuery: '',
        selectedType: 'all',
        sortBy: 'uploadedAt',
        sortOrder: 'desc',
        currentPage: 1
      }),
      
      getQueryParams: () => {
        const state = get()
        return {
          page: state.currentPage,
          pageSize: state.pageSize,
          search: state.searchQuery || undefined,
          type: (state.selectedType && state.selectedType !== 'all') ? state.selectedType : undefined,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        }
      },
      
      // 统计操作
      setStats: (stats) => set({ stats })
    }),
    {
      name: 'media-store'
    }
  )
)

/**
 * 选择器 hooks
 * 提供便捷的状态选择器，使用 useShallow 避免无限循环
 */
export const useMediaList = () => {
  return useMediaStore(
    useShallow((state: MediaStore) => ({
      media: state.media,
      total: state.total,
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      isLoading: state.isLoading
    }))
  )
}

export const useMediaFilters = () => {
  return useMediaStore(
    useShallow((state: MediaStore) => ({
      searchQuery: state.searchQuery,
      selectedType: state.selectedType,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      setSearchQuery: state.setSearchQuery,
      setSelectedType: state.setSelectedType,
      setSortBy: state.setSortBy,
      setSortOrder: state.setSortOrder,
      resetFilters: state.resetFilters
    }))
  )
}

export const useMediaSelection = () => {
  return useMediaStore(
    useShallow((state: MediaStore) => ({
      selectedItems: state.selectedItems,
      toggleItemSelection: state.toggleItemSelection,
      selectAll: state.selectAll,
      clearSelection: state.clearSelection
    }))
  )
}

export const useMediaUpload = () => {
  return useMediaStore(
    useShallow((state: MediaStore) => ({
      uploadProgress: state.uploadProgress,
      isUploading: state.isUploading,
      setUploadProgress: state.setUploadProgress,
      setUploading: state.setUploading
    }))
  )
}

/**
 * 查询参数选择器
 * 提供稳定的查询参数对象，避免无限循环
 */
export const useMediaQueryParams = () => {
  const queryData = useMediaStore(
    useShallow((state: MediaStore) => ({
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      searchQuery: state.searchQuery,
      selectedType: state.selectedType,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder
    }))
  )
  
  // 使用 useMemo 缓存查询参数对象，避免每次渲染都创建新对象
  return useMemo(() => ({
    page: queryData.currentPage,
    pageSize: queryData.pageSize,
    search: queryData.searchQuery || undefined,
    type: (queryData.selectedType && queryData.selectedType !== 'all') ? queryData.selectedType : undefined,
    sortBy: queryData.sortBy,
    sortOrder: queryData.sortOrder
  }), [
    queryData.currentPage,
    queryData.pageSize,
    queryData.searchQuery,
    queryData.selectedType,
    queryData.sortBy,
    queryData.sortOrder
  ])
}