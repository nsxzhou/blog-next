import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const likes = await prisma.postLike.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            tags: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ likes })
  } catch (error) {
    console.error('Error fetching liked posts:', error)
    return NextResponse.json(
      { error: '获取点赞文章失败' },
      { status: 500 }
    )
  }
}