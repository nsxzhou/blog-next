import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取用户个人资料
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        website: true,
        socialLinks: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户资料失败:', error)
    return NextResponse.json({ error: '获取用户资料失败' }, { status: 500 })
  }
}

// 更新用户个人资料
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    const data = await request.json()
    
    // 验证数据
    const allowedFields = ['name', 'bio', 'website', 'socialLinks']
    
    const updateData: any = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    
    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        website: true,
        socialLinks: true
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('更新用户资料失败:', error)
    return NextResponse.json({ error: '更新用户资料失败' }, { status: 500 })
  }
}