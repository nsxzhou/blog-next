import { NextRequest } from 'next/server'
import { successResponse, notFoundResponse } from '@/lib/utils/api/response'
import { PostService } from '@/lib/services/post.service'
import { validateRequest, handleValidationError } from '@/lib/utils/validation'
import { PostIdSchema } from '@/lib/validations/post'

/**
 * 增加文章浏览量
 * PATCH /api/posts/{id}/view
 * 
 * 遵循 SOLID 原则：
 * - SRP: 单一职责，只处理浏览量增加
 * - OCP: 开放封闭，不修改现有代码
 * - DIP: 依赖倒置，依赖 PostService 抽象
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = await validateRequest(PostIdSchema, params)
    
    await PostService.incrementViewCount(id)
    return successResponse(null, '浏览量更新成功')
  } catch (error) {
    console.error('增加浏览量失败:', error)
    if (error instanceof Error && error.message === '文章不存在') {
      return notFoundResponse('文章不存在')
    }
    return handleValidationError(error)
  }
}