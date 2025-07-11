// 系统设置相关的类型定义
import { Setting } from '@prisma/client'

// 设置项类型
export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array'

// 设置分组
export type SettingGroup = 'general' | 'seo' | 'social' | 'email' | 'analytics' | 'appearance' | 'advanced'

// 设置项定义
export interface SettingDefinition {
  key: string
  type: SettingType
  group: SettingGroup
  label: string
  description?: string
  defaultValue: any
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    options?: Array<{ label: string; value: any }>
  }
  visible?: boolean
  editable?: boolean
}

// 设置值类型
export interface SettingValue extends Setting {
  parsedValue?: any // 解析后的值
}

// 设置组数据
export interface SettingGroupData {
  group: SettingGroup
  label: string
  description?: string
  settings: SettingValue[]
}

// 更新设置的输入类型
export interface SettingUpdateInput {
  key: string
  value: any
}

// 批量更新设置
export interface SettingBatchUpdateInput {
  settings: SettingUpdateInput[]
}

// 常用设置键
export const SETTING_KEYS = {
  // 通用设置
  SITE_NAME: 'site_name',
  SITE_DESCRIPTION: 'site_description',
  SITE_URL: 'site_url',
  SITE_LOGO: 'site_logo',
  SITE_FAVICON: 'site_favicon',
  
  // SEO设置
  SEO_TITLE_TEMPLATE: 'seo_title_template',
  SEO_DEFAULT_KEYWORDS: 'seo_default_keywords',
  SEO_DEFAULT_DESCRIPTION: 'seo_default_description',
  
  // 社交媒体
  SOCIAL_TWITTER: 'social_twitter',
  SOCIAL_GITHUB: 'social_github',
  SOCIAL_LINKEDIN: 'social_linkedin',
  SOCIAL_EMAIL: 'social_email',
  
  // 分析
  ANALYTICS_GOOGLE_ID: 'analytics_google_id',
  ANALYTICS_BAIDU_ID: 'analytics_baidu_id',
  
  // 外观
  THEME_PRIMARY_COLOR: 'theme_primary_color',
  THEME_FONT_FAMILY: 'theme_font_family',
  POSTS_PER_PAGE: 'posts_per_page',
  
  // 高级设置
  ENABLE_REGISTRATION: 'enable_registration',
  MAINTENANCE_MODE: 'maintenance_mode',
} as const

// 设置类型映射
export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS]