/**
 * 认证辅助函数工具包
 * 
 * 这个文件就像保安队的"工具箱"，提供各种检查身份和权限的工具
 * 主要用于服务端组件和 API 路由中的权限验证
 * 
 * 主要功能：
 * - 获取当前用户信息
 * - 强制要求用户登录
 * - 检查管理员权限
 * - 验证资源访问权限
 */

import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * 获取当前登录用户信息
 * 
 * 这个函数就像门卫的"查看工牌"功能
 * 
 * 使用场景：
 * - 在服务端组件中获取用户信息
 * - 在 API 路由中检查用户状态
 * - 显示用户相关的个性化内容
 * 
 * 特点：
 * - 只能在服务端使用（Server Components、API Routes）
 * - 客户端组件请使用 useCurrentUser Hook
 * - 不会重定向，只是获取信息
 * 
 * @returns Promise<User | undefined> 用户对象或 undefined（未登录）
 * 
 * @example
 * ```typescript
 * // 在服务端组件中使用
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser()
 *   
 *   if (!user) {
 *     return <div>请先登录</div>
 *   }
 *   
 *   return <div>欢迎，{user.name}!</div>
 * }
 * ```
 */
export async function getCurrentUser() {
  // 调用 NextAuth 的 getServerSession 函数获取会话信息
  const session = await getServerSession(authConfig)
  
  // 返回会话中的用户信息，如果没有会话则返回 undefined
  return session?.user
}

/**
 * 强制要求用户登录
 * 
 * 这个函数就像门卫的"强制验证"功能
 * 如果用户未登录，会立即重定向到登录页面
 * 
 * 使用场景：
 * - 在需要登录的页面开头调用
 * - 在 API 路由中保护敏感操作
 * - 确保只有已登录用户能访问特定功能
 * 
 * 工作流程：
 * 1. 检查用户是否已登录
 * 2. 如果未登录，立即跳转到登录页
 * 3. 如果已登录，返回用户信息继续执行
 * 
 * @returns Promise<User> 已登录的用户对象
 * @throws 如果未登录会触发重定向，不会返回
 * 
 * @example
 * ```typescript
 * // 在服务端组件中使用
 * export default async function DashboardPage() {
 *   const user = await requireAuth() // 确保用户已登录
 *   
 *   // 如果执行到这里，用户一定是已登录的
 *   return <div>欢迎来到仪表板，{user.name}!</div>
 * }
 * 
 * // 在 API 路由中使用
 * export async function GET() {
 *   const user = await requireAuth()
 *   
 *   // 只有已登录用户才能执行到这里
 *   return Response.json({ message: '已登录用户的数据' })
 * }
 * ```
 */
export async function requireAuth() {
  // 先获取当前用户信息
  const user = await getCurrentUser()
  
  // 如果用户未登录，立即重定向到登录页面
  if (!user) {
    redirect("/login")
  }
  
  // 返回用户信息（TypeScript 知道这里 user 不会是 undefined）
  return user
}

/**
 * 强制要求管理员权限
 * 
 * 这个函数就像"VIP 区域"的专属门卫
 * 只有管理员才能通过，普通用户会被拒绝访问
 * 
 * 使用场景：
 * - 管理后台页面
 * - 管理员专属的 API 接口
 * - 需要超级权限的操作
 * 
 * 工作流程：
 * 1. 先调用 requireAuth() 确保用户已登录
 * 2. 检查用户角色是否为 "admin"
 * 3. 如果不是管理员，跳转到无权限页面
 * 4. 如果是管理员，返回用户信息继续执行
 * 
 * @returns Promise<User> 管理员用户对象
 * @throws 如果未登录或非管理员会触发重定向
 * 
 * @example
 * ```typescript
 * // 在管理后台页面中使用
 * export default async function AdminPage() {
 *   const admin = await requireAdmin() // 确保是管理员
 *   
 *   // 如果执行到这里，用户一定是管理员
 *   return <div>管理员面板，{admin.name}</div>
 * }
 * 
 * // 在管理员 API 中使用
 * export async function DELETE() {
 *   const admin = await requireAdmin()
 *   
 *   // 只有管理员才能删除数据
 *   // 执行删除操作...
 *   return Response.json({ message: '删除成功' })
 * }
 * ```
 */
export async function requireAdmin() {
  // 先确保用户已登录
  const user = await requireAuth()
  
  // 检查用户角色是否为管理员
  if (user.role !== "admin") {
    // 如果不是管理员，跳转到无权限页面
    redirect("/unauthorized")
  }
  
  // 返回管理员用户信息
  return user
}

/**
 * 检查用户是否有权限访问特定资源
 * 
 * 这个函数就像"资源访问控制器"
 * 决定用户是否能访问某个特定的资源（如文章、评论等）
 * 
 * 权限规则：
 * - 未登录用户：无权访问
 * - 资源所有者：可以访问自己的资源
 * - 管理员：可以访问所有资源（如果允许）
 * - 其他用户：无权访问
 * 
 * 使用场景：
 * - 检查用户是否能编辑某篇文章
 * - 检查用户是否能删除某条评论
 * - 检查用户是否能查看某个私人资料
 * 
 * @param resourceOwnerId 资源所有者的用户ID
 * @param allowAdmin 是否允许管理员访问（默认：true）
 * @returns Promise<boolean> 是否有权限访问
 * 
 * @example
 * ```typescript
 * // 在文章编辑页面中使用
 * export default async function EditPostPage({ params }: { params: { id: string } }) {
 *   const post = await getPost(params.id)
 *   
 *   // 检查用户是否有权编辑这篇文章
 *   const canEdit = await canAccessResource(post.authorId)
 *   
 *   if (!canEdit) {
 *     return <div>无权编辑此文章</div>
 *   }
 *   
 *   return <EditPostForm post={post} />
 * }
 * 
 * // 在 API 路由中使用
 * export async function PUT(request: Request, { params }: { params: { id: string } }) {
 *   const post = await getPost(params.id)
 *   
 *   // 检查用户是否有权修改这篇文章
 *   const canEdit = await canAccessResource(post.authorId)
 *   
 *   if (!canEdit) {
 *     return Response.json({ error: '无权限' }, { status: 403 })
 *   }
 *   
 *   // 执行更新操作...
 *   return Response.json({ message: '更新成功' })
 * }
 * 
 * // 禁止管理员访问的场景（如个人隐私设置）
 * export async function getPrivateSettings(userId: string) {
 *   // 只有用户本人可以访问，管理员也不行
 *   const canAccess = await canAccessResource(userId, false)
 *   
 *   if (!canAccess) {
 *     throw new Error('无权访问个人隐私设置')
 *   }
 *   
 *   return getUserPrivateSettings(userId)
 * }
 * ```
 */
export async function canAccessResource(
  resourceOwnerId: string,
  allowAdmin: boolean = true
) {
  // 获取当前用户信息
  const user = await getCurrentUser()
  
  // 如果用户未登录，直接拒绝访问
  if (!user) {
    return false
  }
  
  // 如果允许管理员访问，且当前用户是管理员，则允许访问
  if (allowAdmin && user.role === "admin") {
    return true
  }
  
  // 检查用户是否是资源的所有者
  // 只有资源所有者才能访问自己的资源
  return user.id === resourceOwnerId
}

/**
 * 类型定义和接口
 * 
 * 这里定义了认证相关的 TypeScript 类型
 * 确保类型安全和代码提示
 */

/**
 * 用户对象类型
 * 从 NextAuth 会话中获取的用户信息
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: "USER" | "ADMIN"
}

/**
 * 权限检查结果类型
 */
export interface PermissionResult {
  hasPermission: boolean
  reason?: string
}

/**
 * 扩展的权限检查函数
 * 
 * 提供更详细的权限检查结果，包括拒绝原因
 * 
 * @param resourceOwnerId 资源所有者ID
 * @param allowAdmin 是否允许管理员访问
 * @returns Promise<PermissionResult> 权限检查结果
 */
export async function checkResourcePermission(
  resourceOwnerId: string,
  allowAdmin: boolean = true
): Promise<PermissionResult> {
  const user = await getCurrentUser()
  
  if (!user) {
    return {
      hasPermission: false,
      reason: "用户未登录"
    }
  }
  
  if (allowAdmin && user.role === "admin") {
    return {
      hasPermission: true,
      reason: "管理员权限"
    }
  }
  
  if (user.id === resourceOwnerId) {
    return {
      hasPermission: true,
      reason: "资源所有者"
    }
  }
  
  return {
    hasPermission: false,
    reason: "非资源所有者且非管理员"
  }
}