import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/utils/api/response"
import { MediaService } from "@/lib/services/media.service"
import { validateRequest, handleValidationError } from "@/lib/utils/validation"
import { CreateMediaSchema, getMediaType, formatFileSize } from "@/lib/validations/media"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import crypto from "crypto"

// 配置常量
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    // 图片
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // 视频
    'video/mp4', 'video/avi', 'video/mov', 'video/webm',
    // 音频
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
    // 文档
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  uploadDir: 'public/uploads',
  publicUrl: '/uploads'
}

/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 新的唯一文件名
 */
function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || ''
  const hash = crypto.randomUUID()
  const timestamp = Date.now()
  return `${timestamp}-${hash}.${ext}`
}

/**
 * 确保上传目录存在
 * @param uploadPath 上传路径
 */
async function ensureUploadDir(uploadPath: string): Promise<void> {
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true })
  }
}

/**
 * 验证文件类型和大小
 * @param file 上传的文件
 * @returns 验证结果
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `文件大小超出限制，最大允许 ${formatFileSize(UPLOAD_CONFIG.maxFileSize)}`
    }
  }

  // 检查文件类型
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${file.type}`
    }
  }

  return { valid: true }
}

/**
 * 文件上传 - POST /api/media/upload
 * 处理文件上传并创建媒体记录
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    // 获取表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string || undefined

    if (!file) {
      return errorResponse("NO_FILE", "请选择要上传的文件", 400)
    }

    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid) {
      return errorResponse("INVALID_FILE", validation.error!, 400)
    }

    // 生成文件名和路径
    const filename = generateUniqueFilename(file.name)
    const mediaType = getMediaType(file.type)
    const yearMonth = new Date().toISOString().slice(0, 7) // YYYY-MM 格式
    const relativePath = join(mediaType, yearMonth)
    const fullUploadDir = join(process.cwd(), UPLOAD_CONFIG.uploadDir, relativePath)
    const filePath = join(fullUploadDir, filename)
    
    // 确保上传目录存在
    await ensureUploadDir(fullUploadDir)

    // 读取文件数据并保存
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 构建URL路径
    const url = `${UPLOAD_CONFIG.publicUrl}/${relativePath}/${filename}`.replace(/\\/g, '/')
    const dbPath = join(relativePath, filename).replace(/\\/g, '/')

    // 创建媒体记录
    const mediaData = {
      filename,
      originalName: file.name,
      path: dbPath,
      url,
      mimeType: file.type,
      size: file.size,
      alt: alt || undefined
    }

    // 验证数据
    const validatedData = await validateRequest(CreateMediaSchema, mediaData)
    
    // 保存到数据库
    const media = await MediaService.createMedia(validatedData)

    return successResponse(
      { media },
      `文件上传成功，大小: ${formatFileSize(file.size)}`,
      201
    )

  } catch (error) {
    if (error instanceof Error && error.message === "未授权访问") {
      return errorResponse("UNAUTHORIZED", "请先登录", 401)
    }
    
    console.error("文件上传失败:", error)
    
    // 如果是文件系统错误
    if (error instanceof Error && error.message.includes('EACCES')) {
      return errorResponse("FILESYSTEM_ERROR", "文件系统权限不足", 500)
    }
    
    if (error instanceof Error && error.message.includes('ENOSPC')) {
      return errorResponse("STORAGE_FULL", "存储空间不足", 507)
    }

    return handleValidationError(error)
  }
}

/**
 * 获取上传配置信息 - GET /api/media/upload
 * 返回客户端需要的上传配置
 */
export async function GET() {
  try {
    const config = {
      maxFileSize: UPLOAD_CONFIG.maxFileSize,
      maxFileSizeFormatted: formatFileSize(UPLOAD_CONFIG.maxFileSize),
      allowedMimeTypes: UPLOAD_CONFIG.allowedMimeTypes,
      supportedTypes: {
        image: UPLOAD_CONFIG.allowedMimeTypes.filter(type => type.startsWith('image/')),
        video: UPLOAD_CONFIG.allowedMimeTypes.filter(type => type.startsWith('video/')),
        audio: UPLOAD_CONFIG.allowedMimeTypes.filter(type => type.startsWith('audio/')),
        document: UPLOAD_CONFIG.allowedMimeTypes.filter(type => 
          type.startsWith('application/') || type.startsWith('text/'))
      }
    }

    return successResponse(config, "获取上传配置成功")
  } catch (error) {
    console.error("获取上传配置失败:", error)
    return errorResponse("INTERNAL_ERROR", "获取配置失败", 500)
  }
}