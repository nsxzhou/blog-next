/**
 * 用户状态管理 React Hooks
 * 
 * 这个文件就像前台的"客户信息显示屏"，提供实时的用户状态信息
 * 专门用于客户端组件中获取和管理用户登录状态
 * 
 * 主要功能：
 * - 获取当前用户信息
 * - 检查用户登录状态
 * - 检查用户是否为管理员
 * - 处理加载状态
 * 
 * 使用场景：
 * - 在 React 组件中获取用户信息
 * - 根据用户状态显示不同的 UI
 * - 实现条件渲染和权限控制
 * 
 * 注意事项：
 * - 只能在客户端组件中使用（标注了 "use client"）
 * - 服务端组件请使用 @/lib/auth-helpers 中的函数
 * - 数据来源于 SessionProvider 的 Context
 */

"use client"

import { useSession } from "next-auth/react"

/**
 * 获取当前用户信息的自定义 Hook
 * 
 * 这个 Hook 就像前台的"客户信息查询系统"
 * 提供当前用户的完整状态信息
 * 
 * 返回值说明：
 * - user: 用户对象（包含 id、name、email、role 等信息）
 * - isLoading: 是否正在加载用户信息
 * - isAuthenticated: 用户是否已登录
 * 
 * 使用场景：
 * - 显示用户头像和姓名
 * - 根据登录状态显示不同的导航菜单
 * - 在组件中实现权限控制
 * 
 * @returns 包含用户信息和状态的对象
 * 
 * @example
 * ```typescript
 * function UserProfile() {
 *   const { user, isLoading, isAuthenticated } = useCurrentUser()
 *   
 *   // 处理加载状态
 *   if (isLoading) {
 *     return <div>加载中...</div>
 *   }
 *   
 *   // 处理未登录状态
 *   if (!isAuthenticated) {
 *     return <div>请先登录</div>
 *   }
 *   
 *   // 显示用户信息
 *   return (
 *     <div>
 *       <h1>欢迎, {user.name}!</h1>
 *       <p>邮箱: {user.email}</p>
 *       <p>角色: {user.role}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCurrentUser() {
  // 使用 NextAuth 提供的 useSession Hook
  // 这个 Hook 会自动从 SessionProvider 获取会话信息
  const { data: session, status } = useSession()
  
  /**
   * 返回处理后的用户状态信息
   * 
   * user: 从会话中提取的用户对象
   * - 如果用户已登录，包含用户的所有基本信息
   * - 如果用户未登录，为 undefined
   * 
   * isLoading: 加载状态标识
   * - true: 正在从服务器获取会话信息
   * - false: 已完成加载（无论是否登录）
   * 
   * isAuthenticated: 认证状态标识
   * - true: 用户已登录且会话有效
   * - false: 用户未登录或会话无效
   */
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}

/**
 * 检查用户是否为管理员的自定义 Hook
 * 
 * 这个 Hook 就像"VIP 身份验证器"
 * 专门用于检查用户是否具有管理员权限
 * 
 * 返回值：
 * - true: 用户已登录且角色为管理员
 * - false: 用户未登录或不是管理员
 * 
 * 使用场景：
 * - 显示或隐藏管理员专用功能
 * - 在组件中实现管理员权限控制
 * - 条件渲染管理员界面
 * 
 * @returns boolean 是否为管理员
 * 
 * @example
 * ```typescript
 * function AdminPanel() {
 *   const isAdmin = useIsAdmin()
 *   
 *   // 非管理员用户无法看到管理面板
 *   if (!isAdmin) {
 *     return <div>无权限访问</div>
 *   }
 *   
 *   // 管理员可以看到完整的管理界面
 *   return (
 *     <div>
 *       <h1>管理员面板</h1>
 *       <button>删除用户</button>
 *       <button>编辑文章</button>
 *       <button>查看统计</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * function NavigationMenu() {
 *   const { isAuthenticated } = useCurrentUser()
 *   const isAdmin = useIsAdmin()
 *   
 *   return (
 *     <nav>
 *       <Link href="/">首页</Link>
 *       
 *       {isAuthenticated ? (
 *         <React.Fragment>
 *           <Link href="/dashboard">仪表板</Link>
 *           <Link href="/profile">个人资料</Link>
 *           
 *           {isAdmin && (
 *             <Link href="/admin">管理后台</Link>
 *           )}
 *           
 *           <LogoutButton />
 *         </React.Fragment>
 *       ) : (
 *         <React.Fragment>
 *           <Link href="/login">登录</Link>
 *           <Link href="/register">注册</Link>
 *         </React.Fragment>
 *       )}
 *     </nav>
 *   )
 * }
 * ```
 */
export function useIsAdmin() {
  // 获取当前用户信息
  const { user } = useCurrentUser()
  
  // 检查用户是否存在且角色为管理员
  // 使用可选链操作符 (?.) 防止用户对象为 null/undefined 时报错
  return user?.role === "admin"
}

/**
 * 扩展 Hook 示例
 * 
 * 可以基于基础 Hook 创建更多特定用途的 Hook
 * 
 * 示例1：检查用户是否为文章作者的 Hook
 * 
 * function useIsPostAuthor(postAuthorId: string) {
 *   const { user } = useCurrentUser()
 *   const isAdmin = useIsAdmin()
 *   
 *   // 管理员或文章作者都可以编辑
 *   return isAdmin || user?.id === postAuthorId
 * }
 * 
 * function EditPostButton({ post }) {
 *   const canEdit = useIsPostAuthor(post.authorId)
 *   
 *   if (!canEdit) return null
 *   
 *   return <button>编辑文章</button>
 * }
 * 
 * 示例2：获取用户权限列表的 Hook
 * 
 * function useUserPermissions() {
 *   const { user } = useCurrentUser()
 *   const isAdmin = useIsAdmin()
 *   
 *   if (!user) return []
 *   
 *   const permissions = ['read_posts', 'create_posts']
 *   
 *   if (isAdmin) {
 *     permissions.push('delete_posts', 'manage_users', 'view_analytics')
 *   }
 *   
 *   return permissions
 * }
 * 
 * function FeatureButton({ requiredPermission, children }) {
 *   const permissions = useUserPermissions()
 *   
 *   if (!permissions.includes(requiredPermission)) {
 *     return null
 *   }
 *   
 *   return <button>{children}</button>
 * }
 */

/**
 * 状态管理最佳实践
 * 
 * 1. 合理使用加载状态：
 *    - 在数据加载时显示加载指示器
 *    - 避免在加载期间渲染错误的内容
 *    - 提供良好的用户体验
 * 
 * 2. 错误处理：
 *    - 处理网络错误和认证失败
 *    - 提供用户友好的错误信息
 *    - 实现重试机制
 * 
 * 3. 性能优化：
 *    - 避免不必要的重复请求
 *    - 使用 React.memo 防止不必要的重渲染
 *    - 合理使用 useCallback 和 useMemo
 * 
 * 4. 安全考虑：
 *    - 在前端进行权限检查只是用户体验优化
 *    - 真正的权限控制必须在服务端实现
 *    - 不要依赖前端权限检查保证安全
 */

/**
 * 与服务端函数的区别
 * 
 * 客户端 Hook (useCurrentUser):
 * - 用于 React 组件中
 * - 支持实时状态更新
 * - 提供加载状态管理
 * - 可以响应会话变化
 * 
 * 服务端函数 (getCurrentUser):
 * - 用于服务端组件和 API 路由
 * - 一次性获取用户信息
 * - 性能更好，无需客户端请求
 * - 适合静态内容生成
 * 
 * 使用建议：
 * - 静态内容和 SEO 重要的页面使用服务端函数
 * - 需要实时状态和交互的组件使用客户端 Hook
 * - 可以两者结合使用，获得最佳性能和用户体验
 */