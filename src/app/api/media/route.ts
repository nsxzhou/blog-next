import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMediaList, getMediaStats } from '@/lib/media'
import { MediaType } from '@prisma/client'
import { USER_ROLES } from '@/lib/constants'

// GET /api/media - 获取媒体列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as MediaType | null
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') as any || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as any || 'desc'
    
    // 管理员可以查看所有媒体，普通用户只能查看自己的
    const userId = session.user.role === USER_ROLES.ADMIN ? undefined : session.user.id
    
    const result = await getMediaList({
      type: type || undefined,
      search,
      userId,
      page,
      limit,
      sortBy,
      sortOrder
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('获取媒体列表失败:', error)
    return NextResponse.json({ error: '获取媒体列表失败' }, { status: 500 })
  }
}