"use client"

import { useState, useCallback } from 'react'
import { useMediaFilters } from './hooks/useMediaStore'
import { Button } from '@/components/ui/forms/Button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  X, 
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { debounce } from 'lodash'

/**
 * 媒体文件过滤和搜索组件
 * 提供搜索、类型过滤、排序等功能
 */
export function MediaFilters() {
  const {
    searchQuery,
    selectedType,
    sortBy,
    sortOrder,
    setSearchQuery,
    setSelectedType,
    setSortBy,
    setSortOrder,
    resetFilters
  } = useMediaFilters()

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  /**
   * 防抖搜索处理
   * 避免频繁的 API 请求
   */
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
    }, 500),
    [setSearchQuery]
  )

  /**
   * 处理搜索输入变化
   */
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }

  /**
   * 清空搜索
   */
  const handleClearSearch = () => {
    setLocalSearchQuery('')
    setSearchQuery('')
  }

  /**
   * 文件类型选项
   */
  const typeOptions = [
    { value: 'all', label: '所有类型' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'audio', label: '音频' },
    { value: 'document', label: '文档' },
    { value: 'other', label: '其他' }
  ]

  /**
   * 排序字段选项
   */
  const sortByOptions = [
    { value: 'uploadedAt', label: '上传时间' },
    { value: 'filename', label: '文件名' },
    { value: 'originalName', label: '原始名称' },
    { value: 'size', label: '文件大小' }
  ]

  /**
   * 检查是否有活跃的过滤条件
   */
  const hasActiveFilters = searchQuery || (selectedType && selectedType !== 'all') || sortBy !== 'uploadedAt' || sortOrder !== 'desc'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 搜索框 */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="搜索文件名、原始名称或 Alt 文本..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {localSearchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 文件类型过滤 */}
        <div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger id="type">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 排序字段 */}
        <div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy" className="flex-1">
                <SelectValue placeholder="排序字段" />
              </SelectTrigger>
              <SelectContent>
                {sortByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* 排序方向 */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex-shrink-0"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 过滤状态和重置按钮 */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            已应用过滤条件
            {searchQuery && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                搜索: {searchQuery}
              </span>
            )}
            {selectedType && selectedType !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                类型: {typeOptions.find(opt => opt.value === selectedType)?.label}
              </span>
            )}
            {(sortBy !== 'uploadedAt' || sortOrder !== 'desc') && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                排序: {sortByOptions.find(opt => opt.value === sortBy)?.label} {sortOrder === 'asc' ? '升序' : '降序'}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            <X className="mr-2 h-4 w-4" />
            清空过滤
          </Button>
        </div>
      )}
    </div>
  )
}