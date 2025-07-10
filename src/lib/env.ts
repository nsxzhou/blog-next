/**
 * 环境变量验证和配置
 * 
 * 确保所有必需的环境变量都已正确配置
 * 提供类型安全的环境变量访问
 */

import { z } from "zod"

/**
 * 环境变量验证 schema
 * 定义所有必需和可选的环境变量
 */
const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().min(1, "数据库URL不能为空"),
  
  // NextAuth 配置
  NEXTAUTH_URL: z.string().url("NextAuth URL格式不正确"),
  NEXTAUTH_SECRET: z.string()
    .min(32, "NextAuth密钥至少32个字符")
    .refine(val => val !== "your-secret-key-here", "请更改默认的NextAuth密钥"),
  
  // 可选的第三方登录配置
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  
  // 邮件服务配置（可选）
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // 对象存储配置（可选）
  COS_SECRET_ID: z.string().optional(),
  COS_SECRET_KEY: z.string().optional(),
  COS_BUCKET: z.string().optional(),
  COS_REGION: z.string().optional(),
  
  // Node.js 环境
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

/**
 * 验证环境变量
 * 如果验证失败，会抛出详细的错误信息
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new Error(`环境变量配置错误:\n${errorMessages}`)
    }
    throw error
  }
}

/**
 * 导出验证后的环境变量
 * 提供类型安全的访问方式
 */
export const env = validateEnv()

/**
 * 检查第三方登录是否可用
 */
export const oauth = {
  google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  github: !!(env.GITHUB_ID && env.GITHUB_SECRET),
}

/**
 * 生产环境安全检查
 */
if (env.NODE_ENV === "production") {
  // 检查关键安全配置
  if (env.NEXTAUTH_SECRET.length < 32) {
    throw new Error("生产环境NextAuth密钥长度不足")
  }
  
  if (!env.NEXTAUTH_URL.startsWith("https://")) {
    console.warn("警告：生产环境建议使用HTTPS")
  }
}