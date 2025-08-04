import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api/response'
import { validateRequest, handleValidationError } from '@/lib/utils/validation'
import { RegisterSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = await validateRequest(RegisterSchema, body)

    const { username, email, password, name } = validatedData

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return errorResponse('用户名或邮箱已存在', '用户名或邮箱已存在', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role: 'AUTHOR',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return successResponse(user, '用户注册成功', 201)
  } catch (error) {
    console.error('用户注册失败:', error)
    return handleValidationError(error)
  }
}