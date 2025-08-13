"use client"

import { useEffect, useMemo, useCallback } from 'react'
import {
  useMediaStore,
  useMediaQueryParams
} from './hooks/useMediaStore'
import { MediaFilters } from './MediaFilters'
import { MediaUpload } from './MediaUpload'
import { MediaList } from './MediaList'
import { MediaBatchActions } from './MediaBatchActions'
import { MediaStats } from './MediaStats'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

/**
 * 媒体管理主页面组件
 * 整合所有媒体管理功能，提供统一的用户界面
 */
export function MediaPage() {
  const queryParams = useMediaQueryParams()
  const {
    isLoading,
    error,
    selectedItems,
    setLoading,
    setError,
    updateFromResponse,
    setStats
  } = useMediaStore()

  /**
   * 加载媒体文件列表
   * 根据当前查询参数获取媒体文件数据
   */
  const loadMediaList = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 构建查询字符串
      const searchParams = new URLSearchParams()
      searchParams.set('page', queryParams.page.toString())
      searchParams.set('pageSize', queryParams.pageSize.toString())
      if (queryParams.search) searchParams.set('search', queryParams.search)
      if (queryParams.type) searchParams.set('type', queryParams.type)
      searchParams.set('sortBy', queryParams.sortBy)
      searchParams.set('sortOrder', queryParams.sortOrder)
      
      const response = await fetch(`/api/media?${searchParams.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        updateFromResponse(result.data)
      } else {
        throw new Error(result.error || '加载媒体文件失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载媒体文件失败'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [queryParams, setLoading, setError, updateFromResponse])

  /**
   * 加载统计信息
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/media/stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || '加载统计信息失败')
      }
    } catch (err) {
      console.error('加载统计信息失败:', err)
    }
  }, [setStats])

  // 组件挂载时加载数据
  useEffect(() => {
    const loadData = async () => {
      await loadMediaList()
      await loadStats()
    }
    loadData()
  }, [loadMediaList, loadStats])

  // 监听查询参数变化，重新加载数据
  // 使用 useMemo 缓存参数对象，确保只有在真正变化时才重新加载
  const memoizedParams = useMemo(() => queryParams, [queryParams])
  
  useEffect(() => {
    loadMediaList()
  }, [memoizedParams, loadMediaList])

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    loadMediaList()
    loadStats()
  }

  /**
   * 上传成功回调
   */
  const handleUploadSuccess = () => {
    handleRefresh()
    toast.success('文件上传成功')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计信息 */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">媒体管理</h1>
          <p className="text-muted-foreground">
            管理您的媒体文件，支持图片、视频、音频和文档
          </p>
        </div>
        
        <MediaStats />
      </div>

      {/* 工具栏 */}
      <Card className="p-4">
        <div className="space-y-6">
          {/* 主要操作区域 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* 左侧：上传和批量操作 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <MediaUpload onSuccess={handleUploadSuccess} />
              {selectedItems.size > 0 && (
                <>
                  <div className="hidden sm:block w-px h-6 bg-border" />
                  <div className="sm:hidden w-full h-px bg-border" />
                  <MediaBatchActions />
                </>
              )}
            </div>
            
            {/* 右侧：刷新 */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="min-w-[80px]"
              >
                刷新
              </Button>
            </div>
          </div>
          
          {/* 搜索和过滤区域 */}
          <div className="border-t pt-6">
            <MediaFilters />
          </div>
        </div>
      </Card>

      {/* 媒体文件展示区域 */}
      <div className="min-h-[400px]">
        {error ? (
          <Card className="p-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                重试
              </Button>
            </div>
          </Card>
        ) : (
          <MediaList />
        )}
      </div>
    </div>
  )
}