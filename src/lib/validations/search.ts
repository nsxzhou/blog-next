import { z } from 'zod'

/**
 * 简化的搜索验证模式
 * 遵循 YAGNI 原则，只验证必要参数
 */
export const SearchQuerySchema = z.object({
  term: z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词不能超过100个字符'),
  limit: z.number().min(1, '结果数量必须大于0').max(100, '结果数量不能超过100').default(20)
})

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>