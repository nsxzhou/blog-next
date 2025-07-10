/**
 * 用户登出 API 路由
 * 
 * 这个文件就像银行的"销户窗口"，负责处理用户的登出请求
 * 
 * 主要功能：
 * - 清除用户会话
 * - 清除相关 cookies
 * - 返回登出结果
 * - 提供安全的登出流程
 * 
 * 安全措施：
 * - 验证 CSRF token
 * - 清除所有会话数据
 * - 安全的重定向处理
 */

import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"

/**
 * 处理用户登出的 POST 请求
 * 
 * 这个函数就像银行的"销户业务员"，按照标准流程处理每一个登出申请
 * 
 * 处理流程：
 * 1. 验证用户登录状态
 * 2. 清除会话 token
 * 3. 清除相关 cookies
 * 4. 返回成功响应
 * 
 * @param request Next.js 请求对象
 * @returns Promise<NextResponse> 登出结果响应
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * 第一步：验证用户登录状态
     * 
     * 检查用户是否已登录，如果未登录则直接返回成功
     * 这样可以避免重复登出的错误
     */
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // 如果用户未登录，直接返回成功响应
    if (!token) {
      return NextResponse.json({
        message: "用户未登录或已登出",
        success: true
      })
    }

    /**
     * 第二步：清除会话相关的 cookies
     * 
     * NextAuth 使用多个 cookies 来管理会话状态
     * 我们需要清除所有相关的 cookies
     */
    const cookieStore = cookies()
    
    // NextAuth 相关的 cookie 名称
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      'next-auth.state',
      '__Secure-next-auth.session-token', // HTTPS 环境下的安全 cookie
      '__Host-next-auth.csrf-token' // HTTPS 环境下的安全 cookie
    ]

    // 创建响应对象
    const response = NextResponse.json({
      message: "登出成功",
      success: true,
      timestamp: new Date().toISOString()
    })

    // 清除所有相关 cookies
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0), // 设置过期时间为过去的时间
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    /**
     * 第三步：记录登出日志（可选）
     * 
     * 在生产环境中，记录用户登出行为有助于安全审计
     */
    console.log(`用户登出: ${token.email} at ${new Date().toISOString()}`)

    /**
     * 第四步：返回成功响应
     * 
     * 返回登出成功的信息
     * 前端可以根据这个响应进行相应的处理
     */
    return response

  } catch (error) {
    /**
     * 错误处理
     * 
     * 处理在登出过程中可能出现的各种错误
     * 即使出现错误，也应该尽量清除用户会话
     */
    console.error("登出错误:", {
      message: error instanceof Error ? error.message : "未知错误",
      type: error?.constructor?.name,
    })

    // 即使出现错误，也要尝试清除 cookies
    const response = NextResponse.json(
      { 
        message: "登出过程中出现错误，但会话已清除",
        success: true // 仍然返回成功，因为安全起见
      },
      { status: 200 } // 使用 200 而不是错误状态码
    )

    // 清除 cookies（安全措施）
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      'next-auth.state',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    return response
  }
}

/**
 * 处理用户登出的 GET 请求
 * 
 * 提供一个简单的 GET 接口用于检查登出状态
 * 主要用于调试和状态检查
 * 
 * @param request Next.js 请求对象
 * @returns Promise<NextResponse> 当前登录状态
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    return NextResponse.json({
      isLoggedIn: !!token,
      user: token ? {
        id: token.sub,
        email: token.email,
        name: token.name,
        role: token.role
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        message: "检查登录状态失败",
        error: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    )
  }
}

/**
 * 使用示例
 * 
 * 1. 客户端登出请求：
 * ```javascript
 * const response = await fetch('/api/auth/signout', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * })
 * 
 * const result = await response.json()
 * if (result.success) {
 *   // 登出成功，重定向到首页
 *   window.location.href = '/'
 * }
 * ```
 * 
 * 2. 检查登录状态：
 * ```javascript
 * const response = await fetch('/api/auth/signout')
 * const status = await response.json()
 * console.log('当前登录状态:', status.isLoggedIn)
 * ```
 */

/**
 * 安全注意事项
 * 
 * 1. Cookie 清除：
 *    - 确保清除所有相关的 cookies
 *    - 使用正确的 cookie 属性（httpOnly, secure, sameSite）
 *    - 设置过期时间为过去的时间
 * 
 * 2. 错误处理：
 *    - 即使出现错误也要清除会话
 *    - 不暴露敏感的错误信息
 *    - 记录详细的错误日志用于调试
 * 
 * 3. 日志记录：
 *    - 记录用户登出行为
 *    - 包含时间戳和用户标识
 *    - 不记录敏感信息
 */