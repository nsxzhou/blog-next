import NextAuth, { DefaultSession } from "next-auth"

// 扩展 NextAuth 的类型定义
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

// 扩展 JWT 类型
declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}