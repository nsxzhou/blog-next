import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { likeArticle } from '@/lib/articles'
import { createNotification } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    
    const { id } = await params
    const liked = await likeArticle(id, session.user.id)
    
    // 如果是点赞（而不是取消点赞），发送通知给文章作者
    if (liked) {
      const post = await prisma.post.findUnique({
        where: { id },
        select: {
          title: true,
          slug: true,
          authorId: true
        }
      })
      
      if (post && post.authorId !== session.user.id) {
        // 不给自己发送通知
        await createNotification({
          userId: post.authorId,
          type: 'POST_LIKE',
          title: '有人喜欢了你的文章',
          content: `${session.user.name || '用户'} 喜欢了你的文章《${post.title}》`,
          link: `/articles/${post.slug}`,
          metadata: {
            postId: id,
            likedBy: session.user.id
          }
        })
      }
    }
    
    return NextResponse.json({ liked })
  } catch (error) {
    console.error('点赞失败:', error)
    return NextResponse.json({ error: '点赞失败' }, { status: 500 })
  }
}