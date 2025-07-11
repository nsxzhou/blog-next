import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMediaById, deleteMedia } from '@/lib/media'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE /api/media/[id] - 删除媒体
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    // 获取媒体信息
    const media = await getMediaById(params.id)
    
    if (!media) {
      return NextResponse.json({ error: '媒体不存在' }, { status: 404 })
    }
    
    // 检查权限：只有上传者或管理员可以删除
    if (media.uploader.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '没有权限' }, { status: 403 })
    }
    
    // 删除文件
    try {
      const filePath = join(process.cwd(), 'public', media.url)
      await unlink(filePath)
    } catch (error) {
      console.error('删除文件失败:', error)
      // 即使文件删除失败，也继续删除数据库记录
    }
    
    // 删除数据库记录
    await deleteMedia(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除媒体失败:', error)
    return NextResponse.json({ error: '删除媒体失败' }, { status: 500 })
  }
}