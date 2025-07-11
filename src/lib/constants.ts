/**
 * 系统常量定义
 * 
 * 与 Prisma schema 中的枚举值保持一致
 */

// 用户角色
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// 文章状态
export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const

export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS]

// 项目状态
export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]

// 通知类型 - 与数据库保持一致
export const NOTIFICATION_TYPES = {
  SYSTEM: 'SYSTEM',
  POST_LIKE: 'POST_LIKE',
  NEW_POST: 'NEW_POST',
  MAINTENANCE: 'MAINTENANCE'
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

// 媒体类型
export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  OTHER: 'OTHER'
} as const

export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES]

// 设置类型
export const SETTING_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
  ARRAY: 'array'
} as const

export type SettingType = typeof SETTING_TYPES[keyof typeof SETTING_TYPES]

// 分页默认值
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const

// 验证相关常量
export const VALIDATION = {
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR_PATTERN: /^#[0-9A-Fa-f]{6}$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MAX_TITLE_LENGTH: 200,
  MAX_EXCERPT_LENGTH: 500,
  MAX_BIO_LENGTH: 500,
  MAX_COMMENT_LENGTH: 1000
} as const