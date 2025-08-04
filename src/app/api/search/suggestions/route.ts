import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/utils/api/response'
import { SearchService } from '@/lib/services/searchService'
import { validateQueryParams, handleValidationError } from '@/lib/utils/validation'
import { SearchSuggestionsQuerySchema } from '@/lib/validations/search'

/**
 * 搜索建议API路由
 * 方法：GET
 * 参数：
 *   - q: 搜索关键词（可选）
 *   - limit: 建议数量限制（可选，默认10）
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = await validateQueryParams(SearchSuggestionsQuerySchema, searchParams)
    
    const result = await SearchService.getSearchSuggestions(query)
    return successResponse(result, '获取搜索建议成功')
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    return handleValidationError(error)
  }
}