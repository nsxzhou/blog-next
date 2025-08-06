import { z } from 'zod'
import { PostStatus } from '@/generated/prisma'

// 日期转换函数 - 将字符串或 Date 对象转换为 Date 对象
const coerceDate = z.union([z.date(), z.string().datetime()])
  .transform(val => typeof val === 'string' ? new Date(val) : val)
  .optional()

export const CreatePostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  slug: z.string().min(1, 'URL标识符不能为空').max(100, 'URL标识符不能超过100个字符')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL标识符只能包含小写字母、数字和连字符'),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().max(500, '摘要不能超过500个字符').optional(),
  status: z.nativeEnum(PostStatus).default('DRAFT'),
  publishedAt: coerceDate,
  featured: z.boolean().default(false),
  readTime: z.number().min(0, '阅读时间不能为负数').optional(),
  tagIds: z.array(z.string()).optional()
})

export const UpdatePostSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  slug: z.string().min(1, 'URL标识符不能为空').max(100, 'URL标识符不能超过100个字符')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL标识符只能包含小写字母、数字和连字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  excerpt: z.string().max(500, '摘要不能超过500个字符').optional(),
  status: z.nativeEnum(PostStatus).optional(),
  publishedAt: coerceDate,
  featured: z.boolean().optional(),
  readTime: z.number().min(0, '阅读时间不能为负数').optional(),
  tagIds: z.array(z.string()).optional()
})

export const PostListQuerySchema = z.object({
  page: z.number().min(1, '页码必须大于0').default(1),
  pageSize: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
  status: z.nativeEnum(PostStatus).optional(),
  tagId: z.string().optional(),
  search: z.string().max(100, '搜索关键词不能超过100个字符').optional(),
  featured: z.boolean().optional(),
  authorId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const PostIdSchema = z.object({
  id: z.string().min(1, 'ID不能为空')
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
export type PostListQueryInput = z.infer<typeof PostListQuerySchema>
export type PostIdInput = z.infer<typeof PostIdSchema>