import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '只支持 JPG、PNG、GIF、WebP 格式的图片' }, { status: 400 })
    }
    
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 })
    }
    
    // 生成文件名
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `avatar-${session.user.id}-${timestamp}.${extension}`
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadDir, { recursive: true })
    
    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // 更新用户头像
    const avatarUrl = `/uploads/avatars/${filename}`
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatarUrl: avatarUrl }
    })
    
    return NextResponse.json({ url: avatarUrl })
  } catch (error) {
    console.error('上传头像失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}