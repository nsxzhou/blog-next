/**
 * 用户登出 API 路由
 * 
 * 这个 API 端点处理用户登出逻辑：
 * - 清除用户会话
 * - 清除认证 cookies
 * - 返回登出结果
 * 
 * 注意：这是一个补充的登出端点，与 NextAuth 的默认 /api/auth/signout 配合使用
 * 主要用于需要额外登出处理逻辑的场景
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"

/**
 * 处理 POST 请求 - 用户登出
 */
export async function POST(_request: NextRequest) {
  try {
    // 第一步：获取当前用户会话
    const session = await getServerSession(authConfig)
    
    if (!session?.user) {
      console.log("登出请求：用户未登录")
      return NextResponse.json(
        { error: "用户未登录" },
        { status: 401 }
      )
    }

    console.log("用户登出:", session.user.email)

    // 第二步：执行自定义登出逻辑（如果需要）
    // 例如：记录登出日志、清理用户相关缓存等
    // await logUserActivity(session.user.id, 'LOGOUT')
    // await clearUserCache(session.user.id)

    // 第三步：准备清除认证相关的 cookies
    // 清除 NextAuth 相关的 cookies
    const authCookies = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token', // HTTPS 环境下的安全 cookie
    ]

    // 第四步：返回成功响应并清除 cookies
    const response = NextResponse.json(
      {
        message: "登出成功",
        redirectTo: "/", // 建议的重定向地址
      },
      { status: 200 }
    )

    // 在响应中设置清除 cookies 的指令
    authCookies.forEach(cookieName => {
      response.cookies.set(cookieName, "", {
        expires: new Date(0), // 设置过期时间为过去的时间
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    })

    return response

  } catch (error) {
    console.error("登出过程中发生错误:", error)
    return NextResponse.json(
      { error: "登出失败，请稍后重试" },
      { status: 500 }
    )
  }
}

/**
 * 处理 GET 请求 - 获取登出状态
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    return NextResponse.json({
      isLoggedIn: !!session?.user,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      } : null,
    })

  } catch (error) {
    console.error("获取登出状态时发生错误:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  }
}

/**
 * API 使用示例
 * 
 * 1. 执行登出：
 * ```javascript
 * const response = await fetch('/api/auth/signout', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   }
 * })
 * 
 * const result = await response.json()
 * if (response.ok) {
 *   console.log('登出成功:', result.message)
 *   // 重定向到首页
 *   window.location.href = result.redirectTo || '/'
 * } else {
 *   console.error('登出失败:', result.error)
 * }
 * ```
 * 
 * 2. 检查登录状态：
 * ```javascript
 * const response = await fetch('/api/auth/signout')
 * const result = await response.json()
 * console.log('是否已登录:', result.isLoggedIn)
 * console.log('当前用户:', result.user)
 * ```
 * 
 * 3. 结合 NextAuth 客户端函数：
 * ```javascript
 * import { signOut } from 'next-auth/react'
 * 
 * const handleSignOut = async () => {
 *   // 先调用自定义登出 API（执行额外的登出逻辑）
 *   await fetch('/api/auth/signout', { method: 'POST' })
 *   
 *   // 然后调用 NextAuth 的登出函数
 *   await signOut({ callbackUrl: '/' })
 * }
 * ```
 * 
 * 注意事项：
 * 1. 这个 API 路径与 NextAuth 的默认路径不冲突
 * 2. NextAuth 的登出端点是 /api/auth/signout（由 [...nextauth] 处理）
 * 3. 这个自定义端点主要用于额外的登出处理逻辑
 * 4. 建议同时使用两个端点以确保完全清除会话
 */