import { z } from 'zod'

// 通用分页参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

// 通用ID验证
export const idSchema = z.string().cuid()

// 通用slug验证
export const slugSchema = z.string()
  .min(1, '链接不能为空')
  .max(100, '链接不能超过100个字符')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '链接只能包含小写字母、数字和连字符')

// 通用排序验证
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// 通用搜索参数验证
export const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['post', 'tag', 'project', 'user']).optional(),
})

// 文章状态验证
export const postStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

// 项目状态验证
export const projectStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

// 用户角色验证
export const userRoleSchema = z.enum(['USER', 'ADMIN'])

// 通知类型验证
export const notificationTypeSchema = z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])

// 邮箱验证
export const emailSchema = z.string().email('请输入有效的邮箱地址')

// URL验证
export const urlSchema = z.string().url('请输入有效的URL')

// 标签验证
export const tagSchema = z.object({
  name: z.string()
    .min(1, '标签名不能为空')
    .max(20, '标签名不能超过20个字符'),
  slug: slugSchema,
  description: z.string().max(200, '描述不能超过200个字符').optional(),
})

// 文章验证模式
export const postSchema = z.object({
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  slug: slugSchema,
  content: z.string()
    .min(1, '内容不能为空'),
  summary: z.string()
    .max(500, '摘要不能超过500个字符')
    .optional(),
  coverImage: urlSchema.optional().nullable(),
  status: postStatusSchema.default('DRAFT'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

// 文章更新验证模式（所有字段可选）
export const postUpdateSchema = postSchema.partial()

// 项目验证模式
export const projectSchema = z.object({
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  slug: slugSchema,
  description: z.string()
    .min(1, '描述不能为空'),
  content: z.string()
    .min(1, '内容不能为空'),
  coverImage: urlSchema.optional().nullable(),
  demoUrl: urlSchema.optional().nullable(),
  githubUrl: urlSchema.optional().nullable(),
  techStack: z.array(z.string()).default([]),
  status: projectStatusSchema.default('DRAFT'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

// 项目更新验证模式
export const projectUpdateSchema = projectSchema.partial()

// 用户注册验证模式
export const signUpSchema = z.object({
  name: z.string()
    .min(1, '用户名不能为空')
    .max(50, '用户名不能超过50个字符'),
  email: emailSchema,
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码不能超过100个字符'),
})

// 用户登录验证模式
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码不能为空'),
})

// 用户更新验证模式
export const userUpdateSchema = z.object({
  name: z.string()
    .min(1, '用户名不能为空')
    .max(50, '用户名不能超过50个字符')
    .optional(),
  email: emailSchema.optional(),
  image: urlSchema.optional().nullable(),
  bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
})

// 密码更新验证模式
export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空'),
  newPassword: z.string()
    .min(6, '新密码至少6个字符')
    .max(100, '新密码不能超过100个字符'),
})

// 评论验证模式（如果需要的话）
export const commentSchema = z.object({
  content: z.string()
    .min(1, '评论内容不能为空')
    .max(1000, '评论内容不能超过1000个字符'),
  postId: idSchema,
})

// 媒体上传验证模式
export const mediaUploadSchema = z.object({
  filename: z.string().min(1, '文件名不能为空'),
  fileType: z.string().min(1, '文件类型不能为空'),
  fileSize: z.number().positive('文件大小必须大于0'),
  mimeType: z.string().min(1, 'MIME类型不能为空'),
})

// 设置验证模式
export const settingSchema = z.object({
  key: z.string().min(1, '设置键不能为空'),
  value: z.any(),
  description: z.string().optional(),
})

// 批量设置验证模式
export const settingsSchema = z.array(settingSchema)

// 邮箱验证token模式
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Token不能为空'),
})

// 密码重置请求模式
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

// 密码重置模式
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token不能为空'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码不能超过100个字符'),
})

// 通知标记已读模式
export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(idSchema).min(1, '至少选择一个通知'),
})

// 创建一个验证辅助函数
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

// 创建一个安全验证函数（返回结果而不是抛出错误）
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}

// 导出类型
export type PaginationParams = z.infer<typeof paginationSchema>
export type SearchParams = z.infer<typeof searchSchema>
export type PostCreateInput = z.infer<typeof postSchema>
export type PostUpdateInput = z.infer<typeof postUpdateSchema>
export type ProjectCreateInput = z.infer<typeof projectSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>