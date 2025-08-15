import { NextRequest } from 'next/server'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/utils/api/response'
import { PostService } from '@/lib/services/post.service'
import { handleValidationError } from '@/lib/utils/validation'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    
    // 验证 slug 参数
    if (!slug || typeof slug !== 'string') {
      return errorResponse('INVALID_PARAMETER', '文章 slug 参数无效', 400)
    }
    
    const post = await PostService.getPostBySlug(slug)
    
    if (!post) {
      return notFoundResponse('文章不存在')
    }
    
    return successResponse(post, '获取文章成功')
  } catch (error) {
    console.error('通过 slug 获取文章失败:', error)
    return handleValidationError(error)
  }
}