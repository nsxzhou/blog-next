'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  X,
  Download,
  Trash2,
  Copy,
  Check,
  Search,
  Grid3x3,
  List,
  HardDrive,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaWithUser, formatFileSize } from '@/lib/media'
import { MediaType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MediaLibraryClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [media, setMedia] = useState<MediaWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 获取媒体列表
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchQuery && { search: searchQuery })
      })
      
      const response = await fetch(`/api/media?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setMedia(data.media)
        setTotalPages(data.totalPages)
      } else {
        setError(data.error || '获取媒体列表失败')
      }
    } catch (err) {
      setError('获取媒体列表失败')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterType, searchQuery])

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/media/stats')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error('获取统计信息失败:', err)
    }
  }

  useEffect(() => {
    fetchMedia()
    fetchStats()
  }, [fetchMedia])

  // 获取文件图标
  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="w-8 h-8" />
      case 'VIDEO':
        return <Film className="w-8 h-8" />
      case 'OTHER':
        return <Music className="w-8 h-8" />
      case 'DOCUMENT':
        return <FileText className="w-8 h-8" />
      default:
        return <FileText className="w-8 h-8" />
    }
  }

  // 切换文件选择
  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev =>
      prev.includes(id)
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    )
  }

  // 复制链接
  const copyToClipboard = async (url: string) => {
    try {
      const fullUrl = window.location.origin + url
      await navigator.clipboard.writeText(fullUrl)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // 删除文件
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文件吗？')) return
    
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== id))
        setSelectedFiles(prev => prev.filter(fileId => fileId !== id))
        fetchStats() // 更新统计
      } else {
        const data = await response.json()
        alert(data.error || '删除失败')
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个文件吗？`)) return
    
    try {
      await Promise.all(
        selectedFiles.map(id => 
          fetch(`/api/media/${id}`, { method: 'DELETE' })
        )
      )
      
      setMedia(prev => prev.filter(m => !selectedFiles.includes(m.id)))
      setSelectedFiles([])
      fetchStats()
    } catch (err) {
      alert('批量删除失败')
    }
  }

  // 处理文件拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleUpload(files)
  }, [])

  // 处理文件上传
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    setUploading(true)
    setError(null)
    
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setMedia(prev => [data.media, ...prev])
        } else {
          const data = await response.json()
          setError(data.error || `上传 ${file.name} 失败`)
        }
      }
      
      setShowUploadZone(false)
      fetchStats()
      router.refresh()
    } catch (err) {
      setError('上传失败')
    } finally {
      setUploading(false)
    }
  }

  // 计算存储百分比
  const storagePercentage = stats ? (stats.totalSize / (1024 * 1024 * 1024)) * 100 : 0 // 假设1GB限制

  return (
    <>
      <button
        onClick={() => setShowUploadZone(true)}
        className="fixed bottom-8 right-8 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
      >
        <Upload className="w-4 h-4" />
        <span>上传文件</span>
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* 存储使用情况 */}
      {stats && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">存储空间</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(stats.totalSize)} / 1 GB
                </p>
              </div>
            </div>
            <span className="text-sm font-medium">{storagePercentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(storagePercentage, 100)}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                storagePercentage < 50 ? "bg-green-500" :
                storagePercentage < 80 ? "bg-amber-500" :
                "bg-red-500"
              )}
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {stats.byType.map((item: any) => (
              <div key={item.type} className="text-center">
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'IMAGE' ? '图片' :
                   item.type === 'VIDEO' ? '视频' :
                   item.type === 'OTHER' ? '其他' : '文档'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">所有类型</option>
              <option value="IMAGE">图片</option>
              <option value="VIDEO">视频</option>
              <option value="OTHER">其他</option>
              <option value="DOCUMENT">文档</option>
            </select>

            <div className="flex bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'grid'
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === 'list'
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mt-4 p-3 bg-primary/10 rounded-lg"
          >
            <span className="text-sm">
              已选择 {selectedFiles.length} 个文件
            </span>
            <button
              onClick={handleBatchDelete}
              className="text-sm text-destructive hover:underline"
            >
              批量删除
            </button>
          </motion.div>
        )}
      </div>

      {/* 文件列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">暂无媒体文件</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => toggleFileSelection(file.id)}
                  className={cn(
                    "w-5 h-5 rounded border-2 bg-background/80 backdrop-blur-sm transition-colors",
                    selectedFiles.includes(file.id)
                      ? "bg-primary border-primary"
                      : "border-border hover:border-primary"
                  )}
                />
              </div>

              <div className="aspect-square bg-muted flex items-center justify-center p-4">
                {file.type === 'IMAGE' ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={file.url}
                      alt={file.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {file.size ? formatFileSize(file.size) : '未知大小'}
                </p>
              </div>

              <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                  title="复制链接"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={file.url}
                  download={file.filename}
                  className="p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-background rounded-lg hover:bg-muted transition-colors text-destructive"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {media.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <button
                onClick={() => toggleFileSelection(file.id)}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-colors",
                  selectedFiles.includes(file.id)
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary"
                )}
              />

              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden">
                {file.type === 'IMAGE' ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={file.url}
                      alt={file.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  getFileIcon(file.type)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.filename}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{file.size ? formatFileSize(file.size) : '未知大小'}</span>
                  {file.width && file.height && (
                    <span>{file.width} × {file.height}</span>
                  )}
                  <span>{new Date(file.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span>上传者: {file.uploader.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={file.url}
                  download={file.filename}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 hover:bg-muted rounded transition-colors text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-card border border-border rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      {/* 上传区域 */}
      <AnimatePresence>
        {showUploadZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadZone(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-8 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">上传文件</h3>
                <button
                  onClick={() => setShowUploadZone(false)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}>
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium">正在上传...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      拖拽文件到此处，或点击选择文件
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      支持图片、视频、音频和文档，单个文件最大 50MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        handleUpload(files)
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      选择文件
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}