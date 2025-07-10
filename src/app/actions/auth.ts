"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

/**
 * 服务器端登出 Action
 * 
 * 这个函数提供服务器端的登出功能，适用于：
 * - 服务器组件中的登出操作
 * - 表单提交的登出处理
 * - 需要服务器端重定向的场景
 * 
 * 与客户端 signOut 的区别：
 * - 在服务器端执行，无需 JavaScript
 * - 直接进行服务器端重定向
 * - 适合在服务器组件中使用
 */
export async function signOutAction() {
  try {
    /**
     * 方法1：调用我们自定义的登出 API
     * 
     * 使用我们创建的 /api/auth/signout 接口
     * 这个接口会正确处理 cookies 清除
     */
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 传递当前的 cookies 给 API
        "Cookie": cookies().toString()
      },
    })

    if (!response.ok) {
      console.error("自定义登出 API 调用失败")
      throw new Error("登出失败")
    }

    const result = await response.json()
    console.log("服务器端登出成功:", result.message)

  } catch (error) {
    /**
     * 错误处理：回退到 NextAuth 默认登出
     * 
     * 如果自定义 API 失败，使用 NextAuth 的默认登出接口
     */
    console.error("服务器端登出错误:", error)
    
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      
      await fetch(`${baseUrl}/api/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          csrfToken: "", // NextAuth 会在服务器端处理
        }),
      })
    } catch (fallbackError) {
      console.error("NextAuth 登出也失败:", fallbackError)
      // 即使失败也要继续重定向，确保用户体验
    }
  }

  /**
   * 重定向到首页
   * 
   * 无论登出是否成功，都要重定向用户
   * 这确保了用户不会停留在需要认证的页面
   */
  redirect("/")
}

/**
 * 带自定义重定向的登出 Action
 * 
 * 允许指定登出后的重定向地址
 * 
 * @param redirectTo 登出后重定向的路径
 */
export async function signOutWithRedirect(redirectTo: string = "/") {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies().toString()
      },
    })

    if (response.ok) {
      const result = await response.json()
      console.log("登出成功:", result.message)
    }
  } catch (error) {
    console.error("登出错误:", error)
  }

  // 重定向到指定路径
  redirect(redirectTo)
}

/**
 * 使用示例
 * 
 * 1. 在服务器组件中使用：
 * ```tsx
 * import { signOutAction } from '@/app/actions/auth'
 * 
 * export default function ServerComponent() {
 *   return (
 *     <form action={signOutAction}>
 *       <button type="submit">登出</button>
 *     </form>
 *   )
 * }
 * ```
 * 
 * 2. 在客户端组件中使用：
 * ```tsx
 * import { signOutAction } from '@/app/actions/auth'
 * 
 * export default function ClientComponent() {
 *   const handleSignOut = async () => {
 *     await signOutAction()
 *   }
 * 
 *   return (
 *     <button onClick={handleSignOut}>登出</button>
 *   )
 * }
 * ```
 * 
 * 3. 带自定义重定向：
 * ```tsx
 * import { signOutWithRedirect } from '@/app/actions/auth'
 * 
 * const handleSignOutToLogin = async () => {
 *   await signOutWithRedirect('/login')
 * }
 * ```
 */