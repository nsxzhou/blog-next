import { create } from 'zustand'

interface UIState {
  // UI状态
  isSearchOpen: boolean
  mounted: boolean
  
  // Actions
  setIsSearchOpen: (open: boolean) => void
  setMounted: (mounted: boolean) => void
  toggleSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  isSearchOpen: false,
  mounted: false,

  // Actions
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setMounted: (mounted) => set({ mounted: mounted }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen }))
}))