/**
 * NextAuth 认证系统核心配置
 * 
 * 这个文件就像银行的"安全系统"，负责：
 * - 验证用户身份（登录时检查邮箱密码）
 * - 管理用户会话（登录状态的保持）
 * - 支持多种登录方式（邮箱密码、Google、GitHub）
 * - 权限控制（普通用户 vs 管理员）
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import bcrypt from "bcryptjs"

/**
 * NextAuth 核心配置对象
 * 
 * 这个配置就像银行的"安全规则手册"，定义了：
 * - 如何验证用户身份
 * - 如何存储用户信息
 * - 如何管理登录会话
 * - 如何处理各种登录方式
 */
export const authConfig = {
  /**
   * 数据库适配器配置
   * 
   * 作用：告诉 NextAuth 如何与数据库交互
   * - 自动创建用户表、会话表、账户表等
   * - 自动处理用户注册、登录、会话管理
   * - 支持多种登录方式的账户关联
   */
  adapter: PrismaAdapter(prisma),

  /**
   * 登录方式配置数组
   * 
   * 支持多种登录方式：
   * 1. 邮箱密码登录（传统方式）
   * 2. Google OAuth 登录（社交登录）
   * 3. GitHub OAuth 登录（开发者友好）
   */
  providers: [
    /**
     * 邮箱密码登录配置
     * 
     * 这是最传统的登录方式，就像银行柜台需要身份证和密码
     */
    CredentialsProvider({
      name: "credentials", // 登录方式的内部标识
      
      /**
       * 登录表单字段定义
       * 
       * 定义登录页面需要用户输入的字段
       * NextAuth 会自动生成对应的表单
       */
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },

      /**
       * 用户身份验证函数
       * 
       * 这个函数就像银行的"身份验证员"，负责：
       * - 检查用户输入的信息是否正确
       * - 验证邮箱和密码是否匹配
       * - 返回用户信息（验证成功）或 null（验证失败）
       * 
       * @param credentials 用户输入的登录信息
       * @returns 用户对象或 null
       */
      async authorize(credentials) {
        // 第一步：输入验证 - 检查必填字段
        if (!credentials?.email || !credentials?.password) {
          console.log("登录失败：缺少邮箱或密码")
          return null // 返回 null 表示验证失败
        }

        // 第二步：用户查找 - 在数据库中查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        // 第三步：用户存在性检查
        if (!user || !user.passwordHash) {
          console.log("登录失败：用户不存在或未设置密码")
          return null
        }

        // 第四步：密码验证 - 使用 bcrypt 比对密码
        const isPasswordValid = await bcrypt.compare(
          credentials.password,    // 用户输入的明文密码
          user.passwordHash       // 数据库中存储的加密密码
        )

        // 第五步：密码验证结果处理
        if (!isPasswordValid) {
          console.log("登录失败：密码错误")
          return null
        }

        // 第六步：验证成功 - 返回用户信息
        console.log("登录成功：", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // 用户角色：USER 或 ADMIN
        }
      },
    }),

    /**
     * Google OAuth 登录配置
     * 
     * 条件性启用：只有在环境变量中配置了 Google 客户端信息才启用
     * 
     * 工作流程：
     * 1. 用户点击"Google 登录"
     * 2. 跳转到 Google 授权页面
     * 3. 用户在 Google 页面确认授权
     * 4. Google 返回用户信息
     * 5. 自动创建或关联用户账户
     */
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []), // 如果没有配置环境变量，则不启用 Google 登录

    /**
     * GitHub OAuth 登录配置
     * 
     * 类似 Google 登录，但面向开发者群体
     * 
     * 优势：
     * - 开发者用户友好
     * - 可以获取用户的 GitHub 信息
     * - 适合技术类应用
     */
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []), // 如果没有配置环境变量，则不启用 GitHub 登录
  ],

  /**
   * 回调函数配置
   * 
   * 这些回调函数就像银行的"业务处理规则"，
   * 在特定时机被调用，用于自定义认证流程
   */
  callbacks: {
    /**
     * Session 回调函数
     * 
     * 作用：自定义返回给客户端的会话数据
     * 
     * 执行时机：
     * - 每次调用 useSession() 时
     * - 每次检查用户登录状态时
     * 
     * 目的：
     * - 添加用户 ID 到会话中（默认不包含）
     * - 添加用户角色到会话中（用于权限控制）
     * 
     * @param session 原始会话对象
     * @param token JWT 令牌对象
     * @returns 自定义的会话对象
     */
    session: ({ session, token }: { session: Session; token: JWT }) => ({
      ...session, // 保留原有的会话信息
      user: {
        ...session.user, // 保留原有的用户信息
        id: token.sub,   // 添加用户 ID（从 JWT 的 sub 字段获取）
        role: token.role, // 添加用户角色（从 JWT 的 role 字段获取）
      },
    }),

    /**
     * JWT 回调函数
     * 
     * 作用：自定义 JWT 令牌的内容
     * 
     * 执行时机：
     * - 用户登录时（创建 JWT）
     * - 每次刷新 JWT 时
     * 
     * 目的：
     * - 将用户角色信息存储到 JWT 中
     * - 确保用户权限信息在 JWT 中持久化
     * 
     * @param token JWT 令牌对象
     * @param user 用户对象（仅在登录时存在）
     * @returns 自定义的 JWT 令牌
     */
    jwt: ({ token, user }: { token: JWT; user?: any }) => {
      // 只有在用户登录时才有 user 对象
      if (user) {
        token.role = user.role // 将用户角色存储到 JWT 中
      }
      return token
    },
  },

  /**
   * 自定义页面配置
   * 
   * 告诉 NextAuth 各种页面的路径
   * 这样用户会被重定向到我们自定义的页面，而不是 NextAuth 的默认页面
   */
  pages: {
    signIn: "/login",        // 登录页面路径
    signUp: "/register",     // 注册页面路径
    error: "/auth/error",    // 错误页面路径
  },

  /**
   * 会话策略配置
   * 
   * JWT 策略 vs Database 策略：
   * 
   * JWT 策略（推荐）：
   * - 用户信息存储在 JWT 令牌中
   * - 无需每次请求都查询数据库
   * - 性能更好，适合分布式部署
   * - 缺点：无法立即撤销会话
   * 
   * Database 策略：
   * - 用户会话存储在数据库中
   * - 每次请求都需要查询数据库
   * - 可以立即撤销会话
   * - 缺点：性能较差，需要数据库支持
   */
  session: {
    strategy: "jwt" as const, // 使用 JWT 策略
  },
}

/**
 * 导出 NextAuth 实例和相关函数
 * 
 * NextAuth 函数会根据配置返回以下对象：
 * - handlers: API 路由处理器（GET、POST）
 * - auth: 服务端获取会话的函数
 * - signIn: 登录函数
 * - signOut: 登出函数
 */
/**
 * 创建 NextAuth 实例
 * 
 * NextAuth v4 返回一个函数，可以直接用作 API 路由处理器
 */
const handler = NextAuth(authConfig)

// NextAuth v4 的导出方式
export default handler

// 为了兼容我们的代码，创建 handlers 对象
// 将 handler 作为具名导出，以便在 route.ts 中使用
export { handler }

// 创建符合 App Router 约定的 handlers 对象
export const handlers = {
  GET: handler,
  POST: handler
}

// NextAuth v4 中，服务端获取会话的函数
export async function auth(req?: any, res?: any) {
  // 在服务端使用 getServerSession
  const { getServerSession } = await import("next-auth/next")
  return getServerSession(req, res, authConfig)
}

// 注意：signIn 和 signOut 在 NextAuth v4 中是客户端函数
// 应该从 next-auth/react 导入使用

/**
 * 使用示例：
 * 
 * // 在 API 路由中使用
 * import { auth } from '@/lib/auth'
 * 
 * export default async function handler(req, res) {
 *   const session = await auth()
 *   if (!session) {
 *     return res.status(401).json({ error: '未登录' })
 *   }
 *   // 处理已登录用户的请求
 * }
 * 
 * // 在页面中使用
 * import { signIn, signOut } from '@/lib/auth'
 * 
 * // 登录
 * await signIn('credentials', {
 *   email: 'user@example.com',
 *   password: 'password'
 * })
 * 
 * // 登出
 * await signOut()
 */