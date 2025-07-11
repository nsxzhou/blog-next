/**
 * 用户注册 API 路由
 *
 * 这个 API 端点处理用户注册逻辑：
 * - 验证用户输入数据
 * - 检查邮箱是否已存在
 * - 加密密码并存储用户信息
 * - 返回注册结果
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { signUpSchema, emailSchema, validateRequest } from '@/lib/validations'
import { USER_ROLES } from '@/lib/constants'

/**
 * 注册数据验证模式
 *
 * 使用 zod 库进行输入验证，确保数据格式正确
 * @deprecated 使用通用的 signUpSchema 替代
 */
const registerSchema = z.object({
  name: z
    .string()
    .min(2, '姓名至少需要2个字符')
    .max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址').toLowerCase(),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(100, '密码不能超过100个字符'),
})

/**
 * 处理 POST 请求 - 用户注册
 */
export async function POST(request: NextRequest) {
  try {
    // 第一步：解析请求体
    const body = await request.json()
    console.log('注册请求数据:', { ...body, password: '[已隐藏]' })

    // 第二步：验证输入数据（使用通用验证模式）
    const validatedData = validateRequest(signUpSchema, body)
    const { name, email, password } = validatedData

    // 第三步：检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      console.log('注册失败：邮箱已存在', email)
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    // 第四步：加密密码
    const saltRounds = 12 // 使用 12 轮加盐，提高安全性
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 第五步：创建新用户
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: USER_ROLES.USER, // 默认角色为普通用户
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    console.log('用户注册成功:', newUser.email)

    // 第六步：返回成功响应（不包含敏感信息）
    return NextResponse.json(
      {
        message: '注册成功',
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '输入数据无效',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('注册过程中发生错误:', error)

    // 处理数据库唯一约束错误
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    // 处理其他错误
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 处理 GET 请求 - 检查邮箱是否可用
 *
 * 查询参数：?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: '缺少邮箱参数' }, { status: 400 })
    }

    // 验证邮箱格式（使用通用验证模式）
    const validatedEmail = validateRequest(emailSchema, email)

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail.toLowerCase() },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? '邮箱已被使用' : '邮箱可用',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '邮箱格式无效' }, { status: 400 })
    }
    
    console.error('检查邮箱可用性时发生错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

/**
 * API 使用示例
 *
 * 1. 注册新用户：
 * ```javascript
 * const response = await fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     name: '张三',
 *     email: 'zhangsan@example.com',
 *     password: 'password123'
 *   })
 * })
 *
 * const result = await response.json()
 * if (response.ok) {
 *   console.log('注册成功:', result.user)
 * } else {
 *   console.error('注册失败:', result.error)
 * }
 * ```
 *
 * 2. 检查邮箱是否可用：
 * ```javascript
 * const response = await fetch('/api/auth/register?email=test@example.com')
 * const result = await response.json()
 * console.log('邮箱是否可用:', result.available)
 * ```
 */
