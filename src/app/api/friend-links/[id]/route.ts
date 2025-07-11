import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { USER_ROLES } from '@/lib/constants'
import { FriendLinkStatus } from '@prisma/client'

// 获取单个友情链接
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const friendLink = await prisma.friendLink.findUnique({
      where: { id },
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
    
    if (!friendLink) {
      return NextResponse.json(
        { error: 'Friend link not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(friendLink)
  } catch (error) {
    console.error('Failed to fetch friend link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friend link' },
      { status: 500 }
    )
  }
}

// 更新友情链接
const updateFriendLinkSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  description: z.string().max(200).optional(),
  avatar: z.string().url().optional(),
  email: z.string().email().optional(),
  status: z.nativeEnum(FriendLinkStatus).optional(),
  lastCheck: z.string().datetime().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateFriendLinkSchema.parse(body)
    
    const friendLink = await prisma.friendLink.update({
      where: { id },
      data: validatedData
    })
    
    return NextResponse.json(friendLink)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Failed to update friend link:', error)
    return NextResponse.json(
      { error: 'Failed to update friend link' },
      { status: 500 }
    )
  }
}

// 删除友情链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await prisma.friendLink.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete friend link:', error)
    return NextResponse.json(
      { error: 'Failed to delete friend link' },
      { status: 500 }
    )
  }
}