import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

// 扩展 NextAuth 的类型定义
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      avatarUrl?: string | null
      bio?: string | null
      website?: string | null
      emailVerified: boolean
    } & DefaultSession["user"]
    accessToken?: string // 添加访问令牌
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
    avatarUrl?: string | null
    bio?: string | null
    website?: string | null
    socialLinks?: any | null
    emailVerified: boolean
    lastLoginAt?: Date | null
  }
}

// 扩展 JWT 类型
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: Role
    avatarUrl?: string | null
    bio?: string | null
    website?: string | null
    emailVerified: boolean
    accessToken?: string // 添加访问令牌
  }
}