import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserNotifications } from '@/lib/notifications'
import { z } from 'zod'
import { paginationSchema, validateRequest } from '@/lib/validations'

// GET /api/notifications - 获取用户通知
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    
    // 验证分页参数
    const validatedParams = validateRequest(paginationSchema, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })
    
    const result = await getUserNotifications(
      session.user.id, 
      validatedParams.page, 
      validatedParams.limit
    )
    
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '参数验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('获取通知失败:', error)
    return NextResponse.json({ error: '获取通知失败' }, { status: 500 })
  }
}