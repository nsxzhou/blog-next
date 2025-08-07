"use client"

import { useMediaList, useMediaStore } from './hooks/useMediaStore'
import { MediaItem } from './MediaItem'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CustomPagination } from '@/components/ui/custom-pagination'
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Image as ImageIcon } from 'lucide-react'

/**
 * 媒体列表视图组件
 * 以表格形式展示媒体文件详细信息
 */
export function MediaList() {
  const { media, currentPage, totalPages, isLoading } = useMediaList()
  const { setCurrentPage } = useMediaStore()

  if (isLoading) {
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <td className="p-4">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-16" />
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  if (media.length === 0) {
    return (
      <Card className="p-16">
        <EmptyState
          icon={<ImageIcon className="h-12 w-12 text-muted-foreground" />}
          title="暂无媒体文件"
          description="还没有上传任何媒体文件，点击上传按钮开始添加"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 媒体表格 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>文件名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="w-24">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {media.map((item) => (
              <MediaItem key={item.id} media={item} />
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}