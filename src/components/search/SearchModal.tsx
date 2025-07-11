'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  FileText, 
  Hash, 
  Clock, 
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import SearchResults from './SearchResults'
import type { SearchResult } from '@/types/search'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: 'article' | 'tag' | 'project' | 'all'
}

export default function SearchModal({ isOpen, onClose, initialType = 'all' }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  
  // 根据当前路径获取搜索提示
  const getPlaceholder = () => {
    if (pathname.startsWith('/articles')) return '搜索文章...'
    if (pathname.startsWith('/projects')) return '搜索项目...'
    if (pathname.startsWith('/archive')) return '搜索归档文章...'
    return '搜索文章、标签或项目...'
  }
  
  // 获取搜索历史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])
  
  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  // 搜索逻辑
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowSuggestions(true)
      return
    }
    
    setIsLoading(true)
    setShowSuggestions(false)
    
    try {
      // 使用新的 API 路由
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      if (response.ok) {
        const searchResults = await response.json()
        setResults(searchResults)
        setSelectedIndex(0)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query, performSearch])
  
  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])
  
  // 处理搜索结果点击
  const handleResultClick = (result: SearchResult) => {
    // 保存搜索历史
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    
    // 导航到相应页面
    if (result.type === 'article') {
      router.push(`/articles/${result.slug}`)
    } else if (result.type === 'tag') {
      router.push(`/articles?tag=${result.slug}`)
    } else if (result.type === 'project') {
      router.push(`/projects#${result.slug}`)
    }
    
    onClose()
    setQuery('')
  }
  
  // 热门搜索关键词
  const popularSearches = ['React', 'Next.js', 'TypeScript', '性能优化', '设计系统']
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* 搜索模态框 */}
          <div className="relative min-h-screen px-4 py-16 sm:px-6 sm:py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="mx-auto max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 搜索输入区域 */}
              <div className="relative overflow-hidden rounded-2xl bg-background border border-border shadow-2xl">
                {/* 装饰性背景 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                
                {/* 搜索头部 */}
                <div className="relative border-b border-border/50">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <Search className="w-6 h-6 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={getPlaceholder()}
                      className="flex-1 bg-transparent text-xl placeholder:text-muted-foreground focus:outline-none"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">ESC</span>
                    </button>
                  </div>
                </div>
                
                {/* 搜索内容区域 */}
                <div className="relative max-h-[60vh] overflow-y-auto">
                  {/* 加载状态 */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                  
                  {/* 搜索建议 */}
                  {!query && showSuggestions && !isLoading && (
                    <div className="p-6 space-y-6">
                      {/* 搜索历史 */}
                      {searchHistory.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                            <Clock className="w-4 h-4" />
                            最近搜索
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {searchHistory.map((term, index) => (
                              <button
                                key={index}
                                onClick={() => setQuery(term)}
                                className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 热门搜索 */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                          <TrendingUp className="w-4 h-4" />
                          热门搜索
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(term)}
                              className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* 搜索提示 */}
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>使用 <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↓</kbd> 导航结果</p>
                          <p>使用 <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">Enter</kbd> 打开选中项</p>
                          <p>支持模糊搜索和拼音搜索</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 搜索结果 */}
                  {!isLoading && query && results.length > 0 && (
                    <SearchResults
                      results={results}
                      selectedIndex={selectedIndex}
                      onResultClick={handleResultClick}
                      onHover={setSelectedIndex}
                      query={query}
                    />
                  )}
                  
                  {/* 无结果提示 */}
                  {!isLoading && query && results.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium mb-2">未找到相关内容</p>
                      <p className="text-sm text-muted-foreground">
                        试试其他关键词或检查拼写
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}