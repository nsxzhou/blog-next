import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    // 验证输入
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '请输入当前密码和新密码' }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码至少需要 6 个字符' }, { status: 400 })
    }
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { passwordHash: true }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: '用户不存在或使用第三方登录' }, { status: 400 })
    }
    
    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
    }
    
    // 生成新密码哈希
    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    
    // 更新密码
    await prisma.user.update({
      where: { email: session.user.email },
      data: { passwordHash: newPasswordHash }
    })
    
    return NextResponse.json({ success: true, message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 })
  }
}