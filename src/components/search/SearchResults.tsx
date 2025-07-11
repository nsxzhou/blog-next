'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Hash, Folder, Calendar, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/types/search'

interface SearchResultsProps {
  results: SearchResult[]
  selectedIndex: number
  onResultClick: (result: SearchResult) => void
  onHover: (index: number) => void
  query: string
}

export default function SearchResults({
  results,
  selectedIndex,
  onResultClick,
  onHover,
  query
}: SearchResultsProps) {
  // 获取类型图标
  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="w-5 h-5" />
      case 'tag':
        return <Hash className="w-5 h-5" />
      case 'project':
        return <Folder className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }
  
  // 获取类型标签
  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return '文章'
      case 'tag':
        return '标签'
      case 'project':
        return '项目'
      default:
        return '其他'
    }
  }
  
  // 分组结果
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<SearchResult['type'], SearchResult[]>)
  
  return (
    <div className="py-2">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type} className="mb-6 last:mb-0">
          {/* 分组标题 */}
          <div className="px-6 py-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {getTypeLabel(type as SearchResult['type'])} ({typeResults.length})
            </h3>
          </div>
          
          {/* 结果列表 */}
          <div>
            {typeResults.map((result, index) => {
              const globalIndex = results.indexOf(result)
              const isSelected = globalIndex === selectedIndex
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => onResultClick(result)}
                    onMouseEnter={() => onHover(globalIndex)}
                    className={cn(
                      "w-full px-6 py-3 flex items-start gap-4 transition-all duration-200",
                      "hover:bg-muted/50",
                      isSelected && "bg-muted/50"
                    )}
                  >
                    {/* 图标 */}
                    <div className={cn(
                      "mt-0.5 text-muted-foreground",
                      isSelected && "text-primary"
                    )}>
                      {getTypeIcon(result.type)}
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 text-left">
                      {/* 标题 */}
                      <h4 
                        className={cn(
                          "font-medium line-clamp-1",
                          isSelected && "text-primary"
                        )}
                        dangerouslySetInnerHTML={{ 
                          __html: result.highlight?.title || result.title 
                        }}
                      />
                      
                      {/* 描述 */}
                      {result.description && (
                        <p 
                          className="text-sm text-muted-foreground line-clamp-2 mt-1"
                          dangerouslySetInnerHTML={{ 
                            __html: result.highlight?.description || result.description 
                          }}
                        />
                      )}
                      
                      {/* 元数据 */}
                      {result.metadata && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {result.metadata.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(result.metadata.date).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                          {result.metadata.readTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {result.metadata.readTime}
                            </span>
                          )}
                          {result.metadata.tags && result.metadata.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              {result.metadata.tags.slice(0, 3).map((tag, i) => (
                                <span 
                                  key={i}
                                  className="px-1.5 py-0.5 bg-muted rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {result.metadata.tags.length > 3 && (
                                <span>+{result.metadata.tags.length - 3}</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 箭头 */}
                    <div className={cn(
                      "opacity-0 transition-opacity duration-200",
                      isSelected && "opacity-100"
                    )}>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// 高亮样式
export const highlightStyles = `
  mark {
    background-color: hsl(var(--primary) / 0.2);
    color: hsl(var(--primary));
    padding: 0 0.125rem;
    border-radius: 0.125rem;
    font-weight: 500;
  }
`