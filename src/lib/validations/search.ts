import { z } from 'zod'

export const SearchQuerySchema = z.object({
  q: z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词不能超过100个字符'),
  type: z.enum(['post', 'page', 'tag']).optional(),
  limit: z.number().min(1, '结果数量必须大于0').max(100, '结果数量不能超过100').optional(),
  page: z.number().min(1, '页码必须大于0').default(1),
  pageSize: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(20)
})

export const SearchSuggestionsQuerySchema = z.object({
  q: z.string().max(100, '搜索关键词不能超过100个字符').optional(),
  limit: z.number().min(1, '建议数量必须大于0').max(50, '建议数量不能超过50').default(10)
})

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>
export type SearchSuggestionsQueryInput = z.infer<typeof SearchSuggestionsQuerySchema>