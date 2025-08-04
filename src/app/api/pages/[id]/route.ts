import { NextRequest } from 'next/server'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/utils/api/response'
import { PageService } from '@/lib/services/page.service'
import { validateRequest, handleValidationError } from '@/lib/utils/validation'
import { UpdatePageSchema, PageIdSchema } from '@/lib/validations/page'
import { requireOwnership } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PageIdSchema, params)
    
    const page = await PageService.getPageById(id)
    
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    return successResponse(page, '获取页面成功')
  } catch (error) {
    console.error('获取页面失败:', error)
    return handleValidationError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PageIdSchema, params)
    
    const page = await PageService.getPageById(id)
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    await requireOwnership(page.authorId)
    
    const body = await request.json()
    const validatedData = await validateRequest(UpdatePageSchema, { ...body, id })
    
    const result = await PageService.updatePage(id, validatedData)
    return successResponse(result, '更新页面成功')
  } catch (error) {
    if (error instanceof Error && (error.message === '未授权访问' || error.message === '无权操作此资源')) {
      return errorResponse('FORBIDDEN', error.message, 403)
    }
    console.error('更新页面失败:', error)
    if (error instanceof Error && error.message === '页面不存在') {
      return notFoundResponse('页面不存在')
    }
    return handleValidationError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PageIdSchema, params)
    
    const page = await PageService.getPageById(id)
    if (!page) {
      return notFoundResponse('页面不存在')
    }
    
    await requireOwnership(page.authorId)
    
    await PageService.deletePage(id)
    return successResponse(null, '删除页面成功')
  } catch (error) {
    if (error instanceof Error && (error.message === '未授权访问' || error.message === '无权操作此资源')) {
      return errorResponse('FORBIDDEN', error.message, 403)
    }
    console.error('删除页面失败:', error)
    if (error instanceof Error && error.message === '页面不存在') {
      return notFoundResponse('页面不存在')
    }
    return handleValidationError(error)
  }
}