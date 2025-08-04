import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api/response'
import { PageService } from '@/lib/services/page.service'
import { validateQueryParams, validateRequest, handleValidationError } from '@/lib/utils/validation'
import { PageListQuerySchema, CreatePageSchema } from '@/lib/validations/page'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = await validateQueryParams(PageListQuerySchema, searchParams)
    
    const result = await PageService.getPageList(query)
    return successResponse(result, '获取页面列表成功')
  } catch (error) {
    console.error('获取页面列表失败:', error)
    return handleValidationError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = await validateRequest(CreatePageSchema, body)
    
    const pageData = {
      ...validatedData,
      authorId: user.id
    }
    
    const result = await PageService.createPage(pageData)
    return successResponse(result, '创建页面成功', 201)
  } catch (error) {
    if (error instanceof Error && error.message === '未授权访问') {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }
    console.error('创建页面失败:', error)
    return handleValidationError(error)
  }
}