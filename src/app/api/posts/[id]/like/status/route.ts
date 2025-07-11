import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUserLikedPost } from '@/lib/articles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false })
    }
    
    const { id } = await params
    const liked = await checkUserLikedPost(id, session.user.id)
    
    return NextResponse.json({ liked })
  } catch (error) {
    console.error('获取点赞状态失败:', error)
    return NextResponse.json({ liked: false })
  }
}