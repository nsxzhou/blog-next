import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { USER_ROLES } from '@/lib/constants'
import { FriendLinkStatus } from '@prisma/client'

// 获取友情链接列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as FriendLinkStatus | null
    
    const where = status ? { status } : {}
    
    const friendLinks = await prisma.friendLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        addedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json(friendLinks)
  } catch (error) {
    console.error('Failed to fetch friend links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friend links' },
      { status: 500 }
    )
  }
}

// 创建友情链接
const createFriendLinkSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().max(200).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional(),
  status: z.nativeEnum(FriendLinkStatus).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = createFriendLinkSchema.parse(body)
    
    const friendLink = await prisma.friendLink.create({
      data: {
        ...validatedData,
        addedBy: session.user.id
      }
    })
    
    return NextResponse.json(friendLink)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Failed to create friend link:', error)
    return NextResponse.json(
      { error: 'Failed to create friend link' },
      { status: 500 }
    )
  }
}