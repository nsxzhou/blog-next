/**
 * NextAuth.js API 路由处理器
 * 
 * 这个文件是 NextAuth.js 认证系统的核心入口，处理所有认证相关的 HTTP 请求
 * 
 * 路由格式：/api/auth/[...nextauth]
 * - 这是一个动态路由，会捕获所有以 /api/auth/ 开头的请求
 * - NextAuth.js 会自动处理各种认证操作：
 *   - /api/auth/signin - 登录页面和登录处理
 *   - /api/auth/signout - 登出处理
 *   - /api/auth/callback - OAuth 回调处理
 *   - /api/auth/session - 获取当前会话
 *   - /api/auth/providers - 获取可用的登录方式
 *   - /api/auth/csrf - CSRF 令牌
 */

import NextAuth from "@/lib/auth"

/**
 * NextAuth v4 导出方式
 * 
 * 在 v4 中，NextAuth 返回的是一个处理器函数，
 * 直接导出给 GET 和 POST 方法使用
 */
export { NextAuth as GET, NextAuth as POST }

/**
 * 路由配置说明
 * 
 * 1. 文件位置：src/app/api/auth/[...nextauth]/route.ts
 *    - 必须严格按照这个路径放置
 *    - [...nextauth] 是捕获所有路由段的动态路由
 * 
 * 2. 自动处理的路由：
 *    - GET  /api/auth/signin          - 显示登录页面
 *    - POST /api/auth/signin          - 处理登录请求
 *    - GET  /api/auth/signout         - 显示登出确认页面
 *    - POST /api/auth/signout         - 处理登出请求
 *    - GET  /api/auth/session         - 获取当前用户会话
 *    - GET  /api/auth/providers       - 获取可用的登录提供者
 *    - GET  /api/auth/csrf            - 获取 CSRF 令牌
 *    - GET  /api/auth/callback/:provider - OAuth 回调处理
 * 
 * 3. 安全性：
 *    - NextAuth.js 自动处理 CSRF 保护
 *    - 自动处理 OAuth 状态验证
 *    - 自动处理会话安全
 * 
 * 4. 使用示例：
 *    ```javascript
 *    // 客户端获取会话
 *    const response = await fetch('/api/auth/session')
 *    const session = await response.json()
 *    
 *    // 客户端登出
 *    await fetch('/api/auth/signout', { method: 'POST' })
 *    ```
 */