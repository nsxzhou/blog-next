import { create } from 'zustand'
import { SearchResult } from '@/types/blog/search'

interface SearchState {
  // 搜索状态
  searchQuery: string
  activeFilter: 'all' | 'post' | 'page' | 'tag'
  searchResults: SearchResult[]
  isLoading: boolean
  searchSuggestions: string[]
  searchError: string | null
  
  // Actions
  setSearchQuery: (query: string) => void
  setActiveFilter: (filter: 'all' | 'post' | 'page' | 'tag') => void
  setSearchResults: (results: SearchResult[]) => void
  setIsLoading: (loading: boolean) => void
  setSearchSuggestions: (suggestions: string[]) => void
  setSearchError: (error: string | null) => void
  clearSearch: () => void
  performSearch: () => Promise<void>
  loadSearchSuggestions: () => Promise<void>
  handleSuggestionClick: (suggestion: string) => void
  handleResultClick: (result: SearchResult) => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 初始状态
  searchQuery: '',
  activeFilter: 'all',
  searchResults: [],
  isLoading: false,
  searchSuggestions: [],
  searchError: null,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSearchSuggestions: (suggestions) => set({ searchSuggestions: suggestions }),
  setSearchError: (error) => set({ searchError: error }),
  
  clearSearch: () => set({ 
    searchResults: [], 
    searchError: null 
  }),

  performSearch: async () => {
    const { searchQuery, activeFilter } = get()
    
    if (!searchQuery.trim()) {
      set({ searchResults: [] })
      return
    }

    set({ isLoading: true, searchError: null })
    
    try {
      const filterType = activeFilter === 'all' ? undefined : activeFilter
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      })
      
      if (filterType) {
        params.append('type', filterType)
      }
      
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

  loadSearchSuggestions: async () => {
    try {
      const response = await fetch('/api/search/suggestions?limit=10')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取搜索建议失败')
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || '获取搜索建议失败')
      }
      
      set({ searchSuggestions: data.data.suggestions })
    } catch (error) {
      console.error('加载搜索建议失败:', error)
      set({ searchSuggestions: [] })
    }
  },

  handleSuggestionClick: (suggestion) => {
    set({ 
      searchQuery: suggestion, 
      activeFilter: 'all' 
    })
  },

  handleResultClick: (result) => {
    window.location.href = result.url
  }
}))