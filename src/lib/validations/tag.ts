import { z } from 'zod'

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const CreateTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50个字符'),
  slug: z.string().min(1, 'URL标识符不能为空').max(50, 'URL标识符不能超过50个字符')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL标识符只能包含小写字母、数字和连字符'),
  description: z.string().max(200, '描述不能超过200个字符').optional(),
  color: z.string().regex(hexColorRegex, '颜色格式不正确，应为十六进制格式如 #FF5733').optional()
})

export const UpdateTagSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50个字符').optional(),
  slug: z.string().min(1, 'URL标识符不能为空').max(50, 'URL标识符不能超过50个字符')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL标识符只能包含小写字母、数字和连字符').optional(),
  description: z.string().max(200, '描述不能超过200个字符').optional(),
  color: z.string().regex(hexColorRegex, '颜色格式不正确，应为十六进制格式如 #FF5733').optional()
})

export const TagListQuerySchema = z.object({
  page: z.number().min(1, '页码必须大于0').default(1),
  pageSize: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
  search: z.string().max(50, '搜索关键词不能超过50个字符').optional(),
  sortBy: z.enum(['createdAt', 'name', 'postCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const TagIdSchema = z.object({
  id: z.string().min(1, 'ID不能为空')
})

export type CreateTagInput = z.infer<typeof CreateTagSchema>
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>
export type TagListQueryInput = z.infer<typeof TagListQuerySchema>
export type TagIdInput = z.infer<typeof TagIdSchema>