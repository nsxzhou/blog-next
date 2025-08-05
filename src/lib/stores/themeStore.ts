import { create } from 'zustand'

interface ThemeState {
  // 主题状态
  mounted: boolean
  
  // Actions
  setMounted: (mounted: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  // 初始状态
  mounted: false,

  // Actions
  setMounted: (mounted) => set({ mounted: mounted })
}))