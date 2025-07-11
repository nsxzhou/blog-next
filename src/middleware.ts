/**
 * Next.js 中间件 - 智能路由守卫系统
 * 
 * 这个文件就像小区的"智能门禁系统"，对每个访问请求进行自动检查
 * 在用户访问任何页面之前，都会先经过这个中间件的检查
 * 
 * 主要功能：
 * - 保护需要登录的页面
 * - 处理已登录用户对认证页面的访问
 * - 检查管理员权限
 * - 自动重定向到合适的页面
 * 
 * 执行时机：
 * - 在页面组件渲染之前
 * - 在API路由执行之前
 * - 每次路由跳转时
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { SETTING_KEYS } from '@/lib/settings'

// 使用边缘运行时兼容的方式获取维护模式状态
async function getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
  try {
    // 在边缘运行时中，我们需要通过API获取设置
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/settings/public`)
    if (!response.ok) {
      return { enabled: false, message: '' }
    }
    
    const data = await response.json()
    return {
      enabled: data.site?.maintenance_mode === true || data.site?.maintenance_mode === 'true',
      message: data.site?.maintenance_message || '网站正在维护中，请稍后访问'
    }
  } catch {
    return { enabled: false, message: '' }
  }
}

/**
 * 需要登录保护的路由列表
 * 
 * 这些路由就像小区的"私人区域"，只有业主（已登录用户）才能进入
 * 
 * 路由说明：
 * - /dashboard: 用户仪表板
 * - /admin: 管理后台（还需要额外的管理员权限检查）
 * - /posts/create: 创建文章页面
 * - /posts/edit: 编辑文章页面
 * - /profile: 个人资料页面
 * - /settings: 设置页面
 * 
 * 注意：使用 startsWith 匹配，所以 /posts/create/123 也会被匹配到
 */
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/posts/create",
  "/posts/edit",
  "/profile",
  "/settings",
]

/**
 * 认证相关的路由列表
 * 
 * 这些路由是为"未登录用户"准备的，如登录、注册页面
 * 已登录用户不需要再访问这些页面
 * 
 * 路由说明：
 * - /login: 登录页面
 * - /register: 注册页面
 * 
 * 如果已登录用户访问这些页面，会自动重定向到仪表板
 */
const authRoutes = ["/login", "/register"]

/**
 * 中间件主函数
 * 
 * 这个函数就像门卫，对每个访问请求进行检查和处理
 * 
 * 执行流程：
 * 1. 获取用户当前访问的路径
 * 2. 判断是否是受保护的路由
 * 3. 判断是否是认证相关的路由
 * 4. 检查用户登录状态
 * 5. 根据不同情况进行相应的处理
 * 
 * @param req Next.js 请求对象，包含请求的所有信息
 * @returns NextResponse 响应对象，可能是重定向或继续处理
 */
export default async function middleware(req: NextRequest) {
  // 获取用户当前访问的路径
  // 例如：用户访问 /dashboard，pathname 就是 "/dashboard"
  const pathname = req.nextUrl.pathname

  // 排除的路径：API路由、静态资源、认证页面
  const excludedPaths = [
    '/api/',
    '/_next/',
    '/favicon',
    '/auth/',
  ]
  
  // 检查是否是排除的路径
  const isExcluded = excludedPaths.some(path => pathname.startsWith(path))
  
  // 如果不是排除的路径，检查维护模式
  if (!isExcluded && pathname !== '/maintenance') {
    const maintenance = await getMaintenanceStatus()
    
    if (maintenance.enabled) {
      // 获取用户 token 以检查是否是管理员
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      // 管理员可以继续访问
      if (token?.role !== 'ADMIN') {
        // 非管理员重定向到维护页面
        const url = new URL("/maintenance", req.url)
        url.searchParams.set('message', maintenance.message)
        return NextResponse.redirect(url)
      }
    }
  }

  /**
   * 第一步：路由类型判断
   * 
   * 判断当前访问的路径属于哪种类型的路由
   */
  
  // 检查是否是需要保护的路由
  // 使用 some() 和 startsWith() 进行前缀匹配
  // 例如：/dashboard/profile 会匹配到 /dashboard
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // 检查是否是认证相关路由
  // 例如：/login 或 /register
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  /**
   * 第二步：用户登录状态检查
   * 
   * 获取当前用户的登录状态
   */
  
  // 使用 getToken 获取 JWT token
  // 这个方法在边缘运行时中更加兼容
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  // 检查用户是否已登录
  // 如果 token 存在，说明用户已登录
  const isAuthenticated = !!token

  /**
   * 第三步：访问控制逻辑处理
   * 
   * 根据路由类型和用户登录状态，决定如何处理请求
   */

  /**
   * 情况1：未登录用户访问保护路由
   * 
   * 处理逻辑：
   * - 自动重定向到登录页面
   * - 使用 callbackUrl 参数记住用户原本想访问的页面
   * - 登录成功后可以自动跳转回原页面
   */
  if (isProtectedRoute && !isAuthenticated) {
    // 创建登录页面的 URL
    const url = new URL("/login", req.url)
    
    // 保存用户原本想访问的页面路径
    // 这样登录成功后可以跳转回原页面
    // 例如：用户访问 /dashboard，登录后会自动跳转到 /dashboard
    url.searchParams.set("callbackUrl", pathname)
    
    // 重定向到登录页面
    return NextResponse.redirect(url)
  }

  /**
   * 情况2：已登录用户访问认证页面
   * 
   * 处理逻辑：
   * - 已登录用户不需要再次登录或注册
   * - 自动重定向到仪表板页面
   * - 提供更好的用户体验
   */
  if (isAuthRoute && isAuthenticated) {
    // 重定向到仪表板页面
    // 使用 req.url 作为基准 URL，确保协议和域名正确
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  /**
   * 情况3：管理员权限检查
   * 
   * 处理逻辑：
   * - 检查访问管理后台的用户是否具有管理员权限
   * - 非管理员用户访问管理页面时，直接返回 403 错误
   * - 不进行重定向，而是直接拒绝访问
   */
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    // 返回 403 Forbidden 错误
    // 不重定向，直接显示错误信息
    return new NextResponse("Forbidden", { status: 403 })
  }

  /**
   * 情况4：正常访问
   * 
   * 如果没有匹配到上述任何情况，说明访问是正常的
   * 继续处理请求，不做任何拦截
   */
  return NextResponse.next()
}

/**
 * 中间件匹配配置
 * 
 * 这个配置告诉 Next.js 哪些路径需要经过中间件处理
 * 
 * 匹配规则：
 * - 使用正则表达式定义需要匹配的路径
 * - 排除不需要检查的路径（如 API 路由、静态文件等）
 * 
 * 排除的路径：
 * - api: API 路由不需要页面级别的认证检查
 * - _next/static: Next.js 静态文件
 * - _next/image: Next.js 图片优化文件
 * - favicon.ico: 网站图标
 * - public: 公共静态文件
 * 
 * 为什么要排除这些路径：
 * 1. 性能考虑：静态文件不需要认证检查
 * 2. 功能考虑：API 路由有自己的认证逻辑
 * 3. 避免错误：某些系统文件不应该被拦截
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public (公共文件夹)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

/**
 * 中间件工作流程示例
 * 
 * 示例1：未登录用户访问仪表板
 * 1. 用户在浏览器中输入 /dashboard
 * 2. 中间件检查：isProtectedRoute = true, isAuthenticated = false
 * 3. 触发情况1的逻辑
 * 4. 重定向到 /login?callbackUrl=/dashboard
 * 5. 用户登录成功后自动跳转回 /dashboard
 * 
 * 示例2：已登录用户访问登录页
 * 1. 用户点击登录链接，访问 /login
 * 2. 中间件检查：isAuthRoute = true, isAuthenticated = true
 * 3. 触发情况2的逻辑
 * 4. 重定向到 /dashboard
 * 5. 用户直接看到仪表板页面
 * 
 * 示例3：普通用户访问管理后台
 * 1. 用户尝试访问 /admin/users
 * 2. 中间件检查：pathname.startsWith("/admin") = true, user.role = "USER"
 * 3. 触发情况3的逻辑
 * 4. 返回 403 Forbidden 错误
 * 5. 用户看到"禁止访问"页面
 * 
 * 示例4：正常访问首页
 * 1. 用户访问 /
 * 2. 中间件检查：不是保护路由，不是认证路由，不是管理路由
 * 3. 触发情况4的逻辑
 * 4. 继续正常处理请求
 * 5. 用户看到首页内容
 */

/**
 * 扩展功能说明
 * 
 * 这个中间件还可以扩展以支持更多功能：
 * 
 * 1. 角色基础的访问控制（RBAC）
 * 2. 基于时间的访问限制
 * 3. IP 地址白名单/黑名单
 * 4. 访问频率限制
 * 5. 地理位置限制
 * 6. 设备类型检查
 * 7. 维护模式控制
 * 8. A/B 测试路由
 */