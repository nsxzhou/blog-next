"use client"

import { useMediaStore } from './hooks/useMediaStore'
import { formatFileSize } from '@/lib/validations/media'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3, 
  HardDrive, 
  FileText, 
  Image as ImageIcon,
  Video,
  Music,
  File
} from 'lucide-react'

/**
 * 媒体统计信息组件
 * 显示媒体文件的统计数据
 */
export function MediaStats() {
  const { stats } = useMediaStore()

  /**
   * 获取文件类型图标
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
   * 获取类型中文名称
   */
  const getTypeName = (type: string) => {
    switch (type) {
      case 'image':
        return '图片'
      case 'video':
        return '视频'
      case 'audio':
        return '音频'
      case 'document':
        return '文档'
      default:
        return '其他'
    }
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 总文件数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文件数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20 mt-2" />
          </CardContent>
        </Card>

        {/* 总大小 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16 mt-2" />
          </CardContent>
        </Card>

        {/* 文件类型 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">文件类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 计算各类型的百分比
  const typeEntries = Object.entries(stats.byType)
    .sort((a, b) => b[1].count - a[1].count)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 总文件数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总文件数</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            媒体文件
          </p>
        </CardContent>
      </Card>

      {/* 总大小 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总大小</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          <p className="text-xs text-muted-foreground">
            存储空间
          </p>
        </CardContent>
      </Card>

      {/* 文件类型分布 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">文件类型分布</CardTitle>
        </CardHeader>
        <CardContent>
          {typeEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              暂无文件类型数据
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {typeEntries.map(([type, data]) => {
                const percentage = stats.total > 0 ? Math.round((data.count / stats.total) * 100) : 0
                
                return (
                  <div key={type} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <div>
                        <div className="font-medium text-sm">{getTypeName(type)}</div>
                        <div className="text-xs text-muted-foreground">
                          {data.count} 个文件
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(type)}`}>
                        {percentage}%
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(data.size)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}