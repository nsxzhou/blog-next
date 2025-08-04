import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api/response'
import { TagService } from '@/lib/services/tag.service'
import { validateQueryParams, validateRequest, handleValidationError } from '@/lib/utils/validation'
import { TagListQuerySchema, CreateTagSchema } from '@/lib/validations/tag'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = await validateQueryParams(TagListQuerySchema, searchParams)
    
    const result = await TagService.getTagList(query)
    return successResponse(result, '获取标签列表成功')
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return handleValidationError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const validatedData = await validateRequest(CreateTagSchema, body)
    
    const result = await TagService.createTag(validatedData)
    return successResponse(result, '创建标签成功', 201)
  } catch (error) {
    if (error instanceof Error && error.message === '未授权访问') {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }
    console.error('创建标签失败:', error)
    return handleValidationError(error)
  }
}