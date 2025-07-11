import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/user-verification'

// GET /api/auth/verify-email - 验证邮箱
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: '验证令牌缺失' 
      }, { status: 400 })
    }

    const result = await verifyEmail(token)

    if (result.success) {
      // 重定向到成功页面
      return NextResponse.redirect(new URL('/auth/email-verified', request.url))
    } else {
      // 重定向到错误页面
      return NextResponse.redirect(
        new URL(`/auth/verify-error?error=${encodeURIComponent(result.error || '验证失败')}`, request.url)
      )
    }
  } catch (error) {
    console.error('邮箱验证失败:', error)
    return NextResponse.redirect(
      new URL('/auth/verify-error?error=验证过程中出现错误', request.url)
    )
  }
}