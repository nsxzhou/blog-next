"use client"

import { useState } from 'react'
import { useMediaSelection } from './hooks/useMediaStore'
import { Button } from '@/components/ui/forms/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Trash2, ChevronDown, Download, Copy } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 媒体文件批量操作组件
 * 提供批量删除、下载等功能
 */
export function MediaBatchActions() {
  const { selectedItems, clearSelection } = useMediaSelection()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const selectedCount = selectedItems.size

  /**
   * 批量删除文件
   */
  const handleBatchDelete = async () => {
    if (selectedCount === 0 || isDeleting) return

    try {
      setIsDeleting(true)
      
      const ids = Array.from(selectedItems)
      
      // 检查文件使用情况
      const usageChecks = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(`/api/media/${id}/usage`)
          const result = await response.json()
          return result.success ? result.data : { inUse: false }
        })
      )
      
      const inUseFiles = usageChecks.filter(check => check.inUse)
      
      if (inUseFiles.length > 0) {
        toast.error(`有 ${inUseFiles.length} 个文件正在使用中，无法删除`)
        return
      }
      
      // 执行批量删除
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '批量删除失败')
      }
      
      clearSelection()
      
      // 简单实现：刷新页面
      // 实际应用中应该更新 store 状态
      window.location.reload()
      
      toast.success(`成功删除 ${result.data?.deletedCount || ids.length} 个文件`)
    } catch {
      const errorMessage = '批量删除失败'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * 批量下载文件
   */
  const handleBatchDownload = async () => {
    if (selectedCount === 0 || isDownloading) return

    try {
      setIsDownloading(true)
      
      const ids = Array.from(selectedItems)
      
      // 获取所有选中的文件信息
      const mediaFiles = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(`/api/media/${id}`)
          const result = await response.json()
          return result.success ? result.data : null
        })
      )
      
      const validFiles = mediaFiles.filter(file => file !== null)
      
      if (validFiles.length === 0) {
        toast.error('没有有效的文件可以下载')
        return
      }
      
      // 创建下载链接并触发下载
      for (const file of validFiles) {
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.originalName
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 添加延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      toast.success(`开始下载 ${validFiles.length} 个文件`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量下载失败'
      toast.error(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  /**
   * 复制选中文件的链接
   */
  const handleCopyLinks = async () => {
    try {
      const ids = Array.from(selectedItems)
      
      // 获取所有选中的文件信息
      const mediaFiles = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(`/api/media/${id}`)
          const result = await response.json()
          return result.success ? result.data : null
        })
      )
      
      const validFiles = mediaFiles.filter(file => file !== null)
      const links = validFiles.map(file => file.url)
      
      if (links.length === 0) {
        toast.error('没有有效的文件链接')
        return
      }
      
      // 复制链接到剪贴板
      await navigator.clipboard.writeText(links.join('\n'))
      toast.success(`已复制 ${links.length} 个文件链接`)
    } catch (err) {
      toast.error('复制链接失败')
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        已选择 {selectedCount} 个文件
      </span>

      {/* 批量操作下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            批量操作
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleBatchDownload}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? '下载中...' : '批量下载'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyLinks}>
            <Copy className="mr-2 h-4 w-4" />
            复制链接
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除选中的 {selectedCount} 个文件吗？此操作不可撤销。
                  系统会自动检查文件使用情况，正在使用的文件将无法删除。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 取消选择按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={clearSelection}
      >
        取消选择
      </Button>
    </div>
  )
}