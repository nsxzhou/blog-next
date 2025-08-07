import { z } from 'zod'

// 媒体查询参数验证模式
export const MediaListQuerySchema = z.object({
  page: z.number().min(1, '页码必须大于0').default(1),
  pageSize: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
  search: z.string().max(100, '搜索关键词不能超过100个字符').optional(),
  type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
  sortBy: z.enum(['uploadedAt', 'filename', 'originalName', 'size']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// 创建媒体验证模式
export const CreateMediaSchema = z.object({
  filename: z.string().min(1, '文件名不能为空').max(255, '文件名不能超过255个字符'),
  originalName: z.string().min(1, '原始文件名不能为空').max(255, '原始文件名不能超过255个字符'),
  path: z.string().min(1, '文件路径不能为空').max(500, '文件路径不能超过500个字符'),
  url: z.string()
    .min(1, 'URL不能为空')
    .max(1000, 'URL不能超过1000个字符')
    .refine((url) => {
      // 支持相对路径（以 / 开头）或完整的URL
      if (url.startsWith('/')) {
        return true // 相对路径
      }
      try {
        new URL(url) // 验证是否为有效的完整URL
        return true
      } catch {
        return false
      }
    }, '请提供有效的URL或相对路径'),
  mimeType: z.string().min(1, 'MIME类型不能为空').max(100, 'MIME类型不能超过100个字符'),
  size: z.number().min(0, '文件大小不能为负数').max(100 * 1024 * 1024, '文件大小不能超过100MB'),
  alt: z.string().max(200, 'Alt文本不能超过200个字符').optional()
})

// 更新媒体验证模式
export const UpdateMediaSchema = z.object({
  alt: z.string().max(200, 'Alt文本不能超过200个字符').optional()
})

// 媒体ID验证模式
export const MediaIdSchema = z.object({
  id: z.string().min(1, 'ID不能为空')
})

// 文件上传验证模式
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: '请选择有效的文件' }),
  alt: z.string().max(200, 'Alt文本不能超过200个字符').optional()
})

// 批量删除媒体验证模式
export const BatchDeleteMediaSchema = z.object({
  ids: z.array(z.string().min(1, 'ID不能为空')).min(1, '请至少选择一个媒体文件').max(50, '一次最多删除50个文件')
})

// 媒体配置验证模式
export const MediaConfigSchema = z.object({
  maxFileSize: z.number().min(1, '文件大小限制必须大于0'),
  allowedMimeTypes: z.array(z.string()).min(1, '至少需要允许一种文件类型'),
  uploadPath: z.string().min(1, '上传路径不能为空'),
  publicUrl: z.string().url('请提供有效的公共访问URL')
})

// 导出类型推断
export type MediaListQueryInput = z.infer<typeof MediaListQuerySchema>
export type CreateMediaInput = z.infer<typeof CreateMediaSchema>
export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>
export type MediaIdInput = z.infer<typeof MediaIdSchema>
export type FileUploadInput = z.infer<typeof FileUploadSchema>
export type BatchDeleteMediaInput = z.infer<typeof BatchDeleteMediaSchema>
export type MediaConfigInput = z.infer<typeof MediaConfigSchema>

// 文件类型检查工具函数
export const getMediaType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('application/pdf') || 
      mimeType.startsWith('application/msword') ||
      mimeType.startsWith('application/vnd.openxmlformats-officedocument') ||
      mimeType.startsWith('text/')) return 'document'
  return 'other'
}

// 文件大小格式化工具函数
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}