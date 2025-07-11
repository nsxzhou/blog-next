import { NextRequest, NextResponse } from 'next/server'
import { searchContent, getSearchSuggestions, getPopularSearches } from '@/lib/search'
import { z } from 'zod'
import { validateRequest } from '@/lib/validations'

// 搜索请求的验证schema
const searchQuerySchema = z.object({
  query: z.string().min(2, '搜索关键词至少需要2个字符'),
  types: z.array(z.enum(['article', 'tag', 'project'])).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0).max(1).default(0.3)
})

// 搜索建议验证
const searchSuggestionsSchema = z.object({
  query: z.string().min(2, '搜索关键词至少需要2个字符')
})

// 热门搜索验证
const popularSearchesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5)
})

// GET /api/search - 执行搜索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 获取搜索类型
    const type = searchParams.get('type') || 'search'
    
    switch (type) {
      case 'search': {
        // 执行搜索
        const validatedData = validateRequest(searchQuerySchema, {
          query: searchParams.get('q'),
          types: searchParams.getAll('types').length > 0 ? searchParams.getAll('types') : undefined,
          limit: searchParams.get('limit'),
          threshold: searchParams.get('threshold')
        })
        
        const results = await searchContent(validatedData.query, {
          types: validatedData.types as any,
          limit: validatedData.limit,
          threshold: validatedData.threshold
        })
        
        return NextResponse.json(results)
      }
      
      case 'suggestions': {
        // 获取搜索建议
        const validatedData = validateRequest(searchSuggestionsSchema, {
          query: searchParams.get('q')
        })
        
        const suggestions = await getSearchSuggestions(validatedData.query)
        return NextResponse.json(suggestions)
      }
      
      case 'popular': {
        // 获取热门搜索
        const validatedData = validateRequest(popularSearchesSchema, {
          limit: searchParams.get('limit')
        })
        
        const popular = await getPopularSearches(validatedData.limit)
        return NextResponse.json(popular)
      }
      
      default:
        return NextResponse.json({ error: '无效的搜索类型' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: '参数验证失败', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('搜索失败:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}