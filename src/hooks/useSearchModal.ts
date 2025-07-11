'use client'

import { useEffect, useState } from 'react'

export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  const openSearch = () => setIsOpen(true)
  const closeSearch = () => setIsOpen(false)
  const toggleSearch = () => setIsOpen(prev => !prev)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K 或 CTRL+K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleSearch()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch
  }
}