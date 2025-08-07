"use client"

import { useState } from 'react'
import { Media } from '@/types/blog/media'
import { useMediaSelection } from './hooks/useMediaStore'
import { formatFileSize, getMediaType } from '@/lib/validations/media'
import { Button } from '@/components/ui/forms/Button'
import { Checkbox } from '@/components/ui/checkbox'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Copy,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  File
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface MediaItemProps {
  media: Media
}

/**
 * 媒体文件项组件
 * 以列表形式展示媒体文件
 */
export function MediaItem({ media }: MediaItemProps) {
  const { selectedItems, toggleItemSelection } = useMediaSelection()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editedAlt, setEditedAlt] = useState(media.alt || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isSelected = selectedItems.has(media.id)
  const mediaType = getMediaType(media.mimeType)
  
  /**
   * 获取媒体类型图标
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  /**
   * 获取类型颜色
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'video':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'audio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'document':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  /**
   * 处理选择状态变化
   */
  const handleSelectionChange = () => {
    toggleItemSelection(media.id)
  }

  /**
   * 复制文件链接
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(media.url)
      toast.success('文件链接已复制到剪贴板')
    } catch {
      toast.error('复制链接失败')
    }
  }

  /**
   * 下载文件
   */
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = media.url
    link.download = media.originalName
    link.click()
  }

  /**
   * 保存编辑
   */
  const handleSaveEdit = async () => {
    if (isUpdating) return

    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alt: editedAlt.trim() || undefined
        }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '更新失败')
      }
      
      // 更新本地数据（简单实现，实际应用中可能需要更新 store）
      media.alt = editedAlt.trim() || undefined
      
      setIsEditDialogOpen(false)
      toast.success('媒体信息已更新')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新失败'
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * 删除文件
   */
  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      
      // 检查使用情况
      const usageResponse = await fetch(`/api/media/${media.id}/usage`)
      const usageResult = await usageResponse.json()
      
      if (usageResult.success && usageResult.data.inUse) {
        toast.error(`文件正在使用中，无法删除。关联内容：${usageResult.data.totalUsage} 个`)
        return
      }
      
      const deleteResponse = await fetch(`/api/media/${media.id}`, {
        method: 'DELETE',
      })
      
      const result = await deleteResponse.json()
      
      if (!result.success) {
        throw new Error(result.error || '删除失败')
      }
      
      // 这里应该更新 store，移除已删除的项目
      // 为简化实现，这里使用页面刷新
      window.location.reload()
      
      toast.success('文件已删除')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * 渲染缩略图
   */
  const renderThumbnail = (size: 'sm' | 'lg' = 'sm') => {
    const dimensions = size === 'lg' ? 'h-64 w-full' : 'h-10 w-10'
    
    if (mediaType === 'image') {
      return (
        <div className={`relative ${dimensions} bg-muted rounded overflow-hidden flex-shrink-0`}>
          <Image
            src={media.url}
            alt={media.alt || media.filename}
            fill
            className="object-cover"
            sizes={size === 'lg' ? '(max-width: 768px) 100vw, 50vw' : '40px'}
          />
        </div>
      )
    }
    
    return (
      <div className={`${dimensions} bg-muted rounded flex items-center justify-center flex-shrink-0`}>
        {getTypeIcon(mediaType)}
      </div>
    )
  }

  // 列表视图渲染
  return (
    <TableRow className={isSelected ? 'bg-muted/50' : ''}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectionChange}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-3">
          {renderThumbnail('sm')}
          <div className="min-w-0">
            <p className="font-medium truncate" title={media.originalName}>
              {media.originalName}
            </p>
            <p className="text-sm text-muted-foreground truncate" title={media.filename}>
              {media.filename}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`${getTypeColor(mediaType)}`}>
          {mediaType}
        </Badge>
      </TableCell>
      <TableCell>{formatFileSize(media.size)}</TableCell>
      <TableCell>
        {new Date(media.uploadedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  预览
                </DropdownMenuItem>
              </DialogTrigger>
            </Dialog>
            
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              复制链接
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              下载
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              </DialogTrigger>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除文件 &quot;{media.originalName}&quot; 吗？此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
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
      </TableCell>
      
      {/* 这里复用网格视图的对话框组件 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{media.originalName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renderThumbnail('lg')}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>文件名</Label>
                <p className="text-muted-foreground">{media.filename}</p>
              </div>
              <div>
                <Label>原始名称</Label>
                <p className="text-muted-foreground">{media.originalName}</p>
              </div>
              <div>
                <Label>文件类型</Label>
                <p className="text-muted-foreground">{media.mimeType}</p>
              </div>
              <div>
                <Label>文件大小</Label>
                <p className="text-muted-foreground">{formatFileSize(media.size)}</p>
              </div>
              <div>
                <Label>上传时间</Label>
                <p className="text-muted-foreground">
                  {new Date(media.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Alt 文本</Label>
                <p className="text-muted-foreground">{media.alt || '未设置'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑媒体信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>文件名</Label>
                <p className="text-muted-foreground">{media.filename}</p>
              </div>
              <div>
                <Label>文件大小</Label>
                <p className="text-muted-foreground">{formatFileSize(media.size)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alt">Alt 文本（图片描述）</Label>
              <Input
                id="alt"
                value={editedAlt}
                onChange={(e) => setEditedAlt(e.target.value)}
                placeholder="为图片添加描述文本..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {editedAlt.length}/200 字符
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  )
}