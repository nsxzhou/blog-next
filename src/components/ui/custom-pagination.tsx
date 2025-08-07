"use client"

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 自定义分页组件
 * 支持当前页、总页数和页面变更回调
 * 
 * @param currentPage - 当前页码（从1开始）
 * @param totalPages - 总页数
 * @param onPageChange - 页面变更回调函数
 * @param className - 可选的样式类名
 */
interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: CustomPaginationProps) {
  if (totalPages <= 1) return null

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  // 生成页码按钮数组
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= 7) {
      // 如果总页数小于等于7，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第一页
      pages.push(1)
      
      if (currentPage > 4) {
        pages.push('ellipsis')
      }
      
      // 显示当前页前后2页
      const start = Math.max(2, currentPage - 2)
      const end = Math.min(totalPages - 1, currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('ellipsis')
      }
      
      // 总是显示最后一页
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* 上一页按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="h-8 px-3"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        上一页
      </Button>

      {/* 页码按钮 */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm text-muted-foreground"
              >
                ...
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        })}
      </div>

      {/* 下一页按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="h-8 px-3"
      >
        下一页
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}