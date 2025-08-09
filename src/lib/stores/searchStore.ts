import { create } from 'zustand'
import { SearchResult } from '@/types/blog/search'

/**
 * 简化的搜索状态管理
 * 遵循 KISS 原则，只保留核心搜索功能
 */
interface SearchState {
  // 搜索状态
  searchQuery: string
  searchResults: SearchResult[]
  isLoading: boolean
  searchError: string | null
  
  // Actions
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setIsLoading: (loading: boolean) => void
  setSearchError: (error: string | null) => void
  clearSearch: () => void
  performSearch: () => Promise<void>
  handleResultClick: (result: SearchResult) => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 初始状态
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  searchError: null,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSearchError: (error) => set({ searchError: error }),
  
  clearSearch: () => set({ 
    searchResults: [], 
    searchError: null 
  }),

  performSearch: async () => {
    const { searchQuery } = get()
    
    if (!searchQuery.trim()) {
      set({ searchResults: [] })
      return
    }

    set({ isLoading: true, searchError: null })
    
    try {
      const params = new URLSearchParams({
        term: searchQuery,
        limit: '20'
      })
      
      const response = await fetch(`/api/search?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '搜索失败')
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || '搜索失败')
      }
      
      set({ searchResults: data.data.results })
    } catch (error) {
      console.error('搜索失败:', error)
      set({ 
        searchError: error instanceof Error ? error.message : '搜索失败',
        searchResults: []
      })
    } finally {
      set({ isLoading: false })
    }
  },

  handleResultClick: (result) => {
    window.location.href = result.url
  }
}))