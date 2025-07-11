import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendUserVerificationEmail } from '@/lib/user-verification'

// POST /api/auth/send-verification - 发送验证邮件
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // 检查用户是否已验证
    if (session.user.emailVerified) {
      return NextResponse.json({ 
        success: true, 
        message: '您的邮箱已经验证过了' 
      })
    }

    // 发送验证邮件
    const sent = await sendUserVerificationEmail(session.user.id)

    if (sent) {
      return NextResponse.json({ 
        success: true, 
        message: '验证邮件已发送，请检查您的邮箱' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '发送验证邮件失败，请稍后重试' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('发送验证邮件失败:', error)
    return NextResponse.json({ 
      success: false,
      error: '发送验证邮件失败' 
    }, { status: 500 })
  }
}