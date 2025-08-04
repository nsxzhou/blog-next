import { NextRequest } from 'next/server'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/utils/api/response'
import { PostService } from '@/lib/services/post.service'
import { validateRequest, handleValidationError } from '@/lib/utils/validation'
import { UpdatePostSchema, PostIdSchema } from '@/lib/validations/post'
import { requireOwnership } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PostIdSchema, params)
    
    const post = await PostService.getPostById(id)
    
    if (!post) {
      return notFoundResponse('文章不存在')
    }
    
    return successResponse(post, '获取文章成功')
  } catch (error) {
    console.error('获取文章失败:', error)
    return handleValidationError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PostIdSchema, params)
    
    const post = await PostService.getPostById(id)
    if (!post) {
      return notFoundResponse('文章不存在')
    }
    
    await requireOwnership(post.authorId)
    
    const body = await request.json()
    const validatedData = await validateRequest(UpdatePostSchema, { ...body, id })
    
    const result = await PostService.updatePost(id, validatedData)
    return successResponse(result, '更新文章成功')
  } catch (error) {
    if (error instanceof Error && (error.message === '未授权访问' || error.message === '无权操作此资源')) {
      return errorResponse('FORBIDDEN', error.message, 403)
    }
    console.error('更新文章失败:', error)
    if (error instanceof Error && error.message === '文章不存在') {
      return notFoundResponse('文章不存在')
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
    const { id } = await validateRequest(PostIdSchema, params)
    
    const post = await PostService.getPostById(id)
    if (!post) {
      return notFoundResponse('文章不存在')
    }
    
    await requireOwnership(post.authorId)
    
    await PostService.deletePost(id)
    return successResponse(null, '删除文章成功')
  } catch (error) {
    if (error instanceof Error && (error.message === '未授权访问' || error.message === '无权操作此资源')) {
      return errorResponse('FORBIDDEN', error.message, 403)
    }
    console.error('删除文章失败:', error)
    if (error instanceof Error && error.message === '文章不存在') {
      return notFoundResponse('文章不存在')
    }
    return handleValidationError(error)
  }
}