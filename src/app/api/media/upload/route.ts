import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createMedia, getMediaType, isValidFileType } from '@/lib/media'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 允许的文件类型
const ALLOWED_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown'
]

// 最大文件大小（50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024

// 上传目录
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// POST /api/media/upload - 上传文件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: '文件大小不能超过50MB' 
      }, { status: 400 })
    }
    
    // 验证文件类型
    if (!isValidFileType(file.type, ALLOWED_TYPES)) {
      return NextResponse.json({ 
        error: '不支持的文件类型' 
      }, { status: 400 })
    }
    
    // 生成文件名
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const safeName = originalName
      .replace(/\.[^/.]+$/, '') // 移除扩展名
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '-') // 替换特殊字符
      .slice(0, 50) // 限制长度
    const filename = `${timestamp}-${safeName}.${extension}`
    
    // 创建上传目录
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const uploadPath = join(UPLOAD_DIR, year.toString(), month)
    
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }
    
    // 保存文件
    const filePath = join(uploadPath, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    
    // 生成URL
    const url = `/uploads/${year}/${month}/${filename}`
    
    // 获取图片尺寸（如果是图片）
    let width: number | undefined
    let height: number | undefined
    
    if (file.type.startsWith('image/')) {
      try {
        const sharp = await import('sharp')
        const metadata = await sharp.default(buffer).metadata()
        width = metadata.width
        height = metadata.height
      } catch (error) {
        console.error('获取图片尺寸失败:', error)
      }
    }
    
    // 创建媒体记录
    const media = await createMedia({
      filename: originalName,
      url,
      type: getMediaType(file.type),
      size: file.size,
      mimeType: file.type,
      width,
      height,
      userId: session.user.id,
      metadata: {
        originalName,
        uploadedAt: new Date().toISOString()
      }
    })
    
    return NextResponse.json({
      success: true,
      media
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json({ 
      error: '文件上传失败' 
    }, { status: 500 })
  }
}