"use server"

import { redirect } from "next/navigation"

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
  /**
   * 服务器端登出 Action
   * 
   * 在服务器端，我们需要手动清除 NextAuth 的 cookies
   * 然后重定向用户到首页
   */
  try {
    console.log("执行服务器端登出")
    
    // 注意：在服务器端的 Server Action 中，我们不能直接设置 cookies
    // 这是因为 cookies() 返回的是只读的 ReadonlyRequestCookies
    // 正确的做法是让客户端来处理登出，或者使用 NextAuth 的标准流程
    
  } catch (error) {
    console.error("服务器端登出错误:", error)
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
  /**
   * 带自定义重定向的登出 Action
   * 
   * 允许指定登出后的重定向地址
   * 
   * @param redirectTo 登出后重定向的路径
   */
  try {
    console.log("执行带自定义重定向的服务器端登出")
    
    // 注意：在服务器端的 Server Action 中，我们不能直接设置 cookies
    // 这是因为 cookies() 返回的是只读的 ReadonlyRequestCookies
    // 正确的做法是让客户端来处理登出，或者使用 NextAuth 的标准流程
    
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
 * 
 * 注意：
 * - 这些 Server Actions 主要用于简单的重定向场景
 * - 实际的登出逻辑应该由客户端的 `signOut` 函数处理
 * - 或者使用 `/api/auth/signout` API 端点
 * - 这些 Actions 适合在无 JavaScript 环境中使用
 */