"use client"

import { useState, useCallback, useRef } from 'react'
import { useMediaUpload } from './hooks/useMediaStore'
import { Button } from '@/components/ui/forms/Button'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon,
  Video,
  Music,
  File
} from 'lucide-react'
import { toast } from 'sonner'
import { formatFileSize, getMediaType } from '@/lib/validations/media'
import Image from 'next/image'

interface MediaUploadProps {
  onSuccess?: () => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  preview?: string
}

/**
 * 媒体文件上传组件
 * 支持拖拽上传、多文件上传和上传进度显示
 */
export function MediaUpload({ onSuccess }: MediaUploadProps) {
  const { isUploading, setUploading } = useMediaUpload()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (file: File) => {
    const type = getMediaType(file.type)
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      case 'audio':
        return <Music className="h-8 w-8" />
      case 'document':
        return <FileText className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  /**
   * 验证文件类型和大小
   */
  const validateFile = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    if (file.size > maxSize) {
      return '文件大小不能超过 100MB'
    }
    
    // 可以根据需要添加更多验证规则
    return null
  }

  /**
   * 创建文件预览
   */
  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve(undefined)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  /**
   * 添加文件到上传列表
   */
  const addFilesToUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newUploadFiles: UploadFile[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      const preview = await createFilePreview(file)
      
      newUploadFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        preview
      })
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles])
  }, [])

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      addFilesToUpload(files)
      setIsDialogOpen(true)
    }
    // 清空输入框，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * 处理拖拽相关事件
   */
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
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      addFilesToUpload(files)
      setIsDialogOpen(true)
    }
  }, [addFilesToUpload])

  /**
   * 移除文件
   */
  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id))
  }

  /**
   * 上传单个文件
   */
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    const { file } = uploadFile
    
    // 更新状态为上传中
    setUploadFiles(prev => 
      prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 使用 XMLHttpRequest 来支持上传进度
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, progress }
                  : f
              )
            )
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'success', progress: 100 }
                  : f
              )
            )
            resolve()
          } else {
            const errorMessage = '上传失败'
            setUploadFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'error', error: errorMessage }
                  : f
              )
            )
            reject(new Error(errorMessage))
          }
        })

        xhr.addEventListener('error', () => {
          const errorMessage = '网络错误'
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: errorMessage }
                : f
            )
          )
          reject(new Error(errorMessage))
        })

        xhr.open('POST', '/api/media/upload')
        xhr.send(formData)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      setUploadFiles(prev => 
        prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      )
      throw error
    }
  }

  /**
   * 开始上传所有文件
   */
  const handleUploadAll = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    
    if (pendingFiles.length === 0) {
      toast.error('没有需要上传的文件')
      return
    }

    setUploading(true)
    
    let successCount = 0
    let errorCount = 0

    // 并发上传文件（限制并发数）
    const concurrency = 3
    for (let i = 0; i < pendingFiles.length; i += concurrency) {
      const batch = pendingFiles.slice(i, i + concurrency)
      
      await Promise.allSettled(
        batch.map(async (uploadFile) => {
          try {
            await uploadSingleFile(uploadFile)
            successCount++
          } catch {
            errorCount++
          }
        })
      )
    }

    setUploading(false)
    
    // 显示结果
    if (successCount > 0 && errorCount === 0) {
      toast.success(`成功上传 ${successCount} 个文件`)
      onSuccess?.()
      setIsDialogOpen(false)
      setUploadFiles([])
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`成功上传 ${successCount} 个文件，${errorCount} 个文件失败`)
      onSuccess?.()
    } else {
      toast.error(`上传失败，${errorCount} 个文件出错`)
    }
  }

  /**
   * 重试失败的文件
   */
  const handleRetryFailed = async () => {
    const failedFiles = uploadFiles.filter(f => f.status === 'error')
    
    for (const file of failedFiles) {
      try {
        await uploadSingleFile(file)
      } catch {
        // 错误已在 uploadSingleFile 中处理
      }
    }
  }

  /**
   * 清空所有文件
   */
  const handleClearAll = () => {
    setUploadFiles([])
  }

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
  const successFiles = uploadFiles.filter(f => f.status === 'success')
  const errorFiles = uploadFiles.filter(f => f.status === 'error')

  return (
    <>
      {/* 上传按钮 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        上传文件
      </Button>

      {/* 上传对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>文件上传</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 拖拽上传区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="text-lg font-medium">拖拽文件到这里</div>
                <div className="text-sm text-muted-foreground">
                  或{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    点击选择文件
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  支持图片、视频、音频和文档，单个文件最大 100MB
                </div>
              </div>
            </div>

            {/* 文件列表 */}
            {uploadFiles.length > 0 && (
              <div className="mt-6 flex-1 overflow-auto">
                <div className="space-y-3">
                  {uploadFiles.map((uploadFile) => (
                    <div
                      key={uploadFile.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      {/* 文件图标或预览 */}
                      <div className="flex-shrink-0">
                        {uploadFile.preview ? (
                          <div className="relative h-12 w-12 rounded overflow-hidden">
                            <Image
                              src={uploadFile.preview}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                            {getFileIcon(uploadFile.file)}
                          </div>
                        )}
                      </div>
                      
                      {/* 文件信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {uploadFile.file.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </div>
                        
                        {/* 进度条 */}
                        {uploadFile.status === 'uploading' && (
                          <Progress
                            value={uploadFile.progress}
                            className="mt-2 h-2"
                          />
                        )}
                        
                        {/* 错误信息 */}
                        {uploadFile.status === 'error' && uploadFile.error && (
                          <div className="text-sm text-destructive mt-1">
                            {uploadFile.error}
                          </div>
                        )}
                      </div>
                      
                      {/* 状态和操作 */}
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'success' && (
                          <div className="text-green-600 text-sm">✓</div>
                        )}
                        
                        {uploadFile.status === 'error' && (
                          <div className="text-destructive text-sm">✗</div>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadFile.id)}
                          disabled={uploadFile.status === 'uploading'}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          {uploadFiles.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                共 {uploadFiles.length} 个文件
                {successFiles.length > 0 && (
                  <span className="text-green-600 ml-2">
                    {successFiles.length} 成功
                  </span>
                )}
                {errorFiles.length > 0 && (
                  <span className="text-destructive ml-2">
                    {errorFiles.length} 失败
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isUploading}
                >
                  清空
                </Button>
                
                {errorFiles.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleRetryFailed}
                    disabled={isUploading}
                  >
                    重试失败
                  </Button>
                )}
                
                <Button
                  onClick={handleUploadAll}
                  disabled={isUploading || pendingFiles.length === 0}
                >
                  {isUploading ? '上传中...' : `上传 (${pendingFiles.length})`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}