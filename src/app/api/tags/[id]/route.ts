import { NextRequest } from 'next/server'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/utils/api/response'
import { TagService } from '@/lib/services/tag.service'
import { validateRequest, handleValidationError } from '@/lib/utils/validation'
import { UpdateTagSchema, TagIdSchema } from '@/lib/validations/tag'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(TagIdSchema, params)
    
    const tag = await TagService.getTagById(id)
    
    if (!tag) {
      return notFoundResponse('标签不存在')
    }
    
    return successResponse(tag, '获取标签成功')
  } catch (error) {
    console.error('获取标签失败:', error)
    return handleValidationError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const params = await context.params
    const { id } = await validateRequest(TagIdSchema, params)
    
    const tag = await TagService.getTagById(id)
    if (!tag) {
      return notFoundResponse('标签不存在')
    }
    
    const body = await request.json()
    const validatedData = await validateRequest(UpdateTagSchema, { ...body, id })
    
    const result = await TagService.updateTag(id, validatedData)
    return successResponse(result, '更新标签成功')
  } catch (error) {
    if (error instanceof Error && error.message === '未授权访问') {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }
    console.error('更新标签失败:', error)
    if (error instanceof Error && error.message === '标签不存在') {
      return notFoundResponse('标签不存在')
    }
    return handleValidationError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const params = await context.params
    const { id } = await validateRequest(TagIdSchema, params)
    
    const tag = await TagService.getTagById(id)
    if (!tag) {
      return notFoundResponse('标签不存在')
    }
    
    await TagService.deleteTag(id)
    return successResponse(null, '删除标签成功')
  } catch (error) {
    if (error instanceof Error && error.message === '未授权访问') {
      return errorResponse('UNAUTHORIZED', '请先登录', 401)
    }
    console.error('删除标签失败:', error)
    if (error instanceof Error && error.message === '标签不存在') {
      return notFoundResponse('标签不存在')
    }
    return handleValidationError(error)
  }
}