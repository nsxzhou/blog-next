import { prisma } from '@/lib/prisma'
import { Setting } from '@prisma/client'

// 设置项的键名定义
export const SETTING_KEYS = {
  // 站点设置
  SITE_TITLE: 'site_title',
  SITE_DESCRIPTION: 'site_description',
  SITE_KEYWORDS: 'site_keywords',
  SITE_LOGO: 'site_logo',
  SITE_FAVICON: 'site_favicon',
  SITE_URL: 'site_url',
  
  // 功能设置
  ENABLE_REGISTRATION: 'enable_registration',
  ENABLE_COMMENTS: 'enable_comments',
  ENABLE_LIKES: 'enable_likes',
  ENABLE_ANALYTICS: 'enable_analytics',
  
  // 邮件设置
  SMTP_HOST: 'smtp_host',
  SMTP_PORT: 'smtp_port',
  SMTP_USER: 'smtp_user',
  SMTP_PASS: 'smtp_pass',
  SMTP_FROM: 'smtp_from',
  SMTP_SECURE: 'smtp_secure',
  
  // 存储设置
  STORAGE_LIMIT: 'storage_limit',
  UPLOAD_MAX_SIZE: 'upload_max_size',
  ALLOWED_FILE_TYPES: 'allowed_file_types',
  
  // SEO设置
  GOOGLE_ANALYTICS_ID: 'google_analytics_id',
  BAIDU_ANALYTICS_ID: 'baidu_analytics_id',
  
  // 社交媒体
  SOCIAL_GITHUB: 'social_github',
  SOCIAL_TWITTER: 'social_twitter',
  SOCIAL_WEIBO: 'social_weibo',
  SOCIAL_EMAIL: 'social_email',
  
  // 主题设置
  THEME_PRIMARY_COLOR: 'theme_primary_color',
  THEME_RADIUS: 'theme_radius',
  THEME_FONT_FAMILY: 'theme_font_family',
  
  // 其他设置
  MAINTENANCE_MODE: 'maintenance_mode',
  MAINTENANCE_MESSAGE: 'maintenance_message',
  COPYRIGHT_TEXT: 'copyright_text',
  ICP_RECORD: 'icp_record',
} as const

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS]

// 获取单个设置
export async function getSetting(key: SettingKey): Promise<Setting | null> {
  return prisma.setting.findUnique({
    where: { key }
  })
}

// 获取多个设置
export async function getSettings(keys?: SettingKey[]): Promise<Setting[]> {
  if (keys && keys.length > 0) {
    return prisma.setting.findMany({
      where: {
        key: { in: keys }
      }
    })
  }
  return prisma.setting.findMany()
}

// 获取设置值（带默认值）
export async function getSettingValue<T = string>(
  key: SettingKey,
  defaultValue?: T
): Promise<T> {
  const setting = await getSetting(key)
  if (!setting) return defaultValue as T
  
  try {
    // 尝试解析JSON
    if (setting.value === null) return defaultValue as T
    if (typeof setting.value === 'string') {
      return JSON.parse(setting.value)
    }
    return setting.value as T
  } catch {
    // 如果不是JSON，直接返回
    return setting.value as unknown as T
  }
}

// 获取多个设置值
export async function getSettingValues(
  keys: SettingKey[]
): Promise<Record<string, any>> {
  const settings = await getSettings(keys)
  const result: Record<string, any> = {}
  
  for (const setting of settings) {
    try {
      if (setting.value === null) {
        result[setting.key] = null
      } else if (typeof setting.value === 'string') {
        result[setting.key] = JSON.parse(setting.value)
      } else {
        result[setting.key] = setting.value
      }
    } catch {
      result[setting.key] = setting.value
    }
  }
  
  return result
}

// 保存设置
export async function saveSetting(
  key: SettingKey,
  value: any,
  description?: string
): Promise<Setting> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  
  return prisma.setting.upsert({
    where: { key },
    update: { 
      value: stringValue,
      ...(description && { description })
    },
    create: {
      key,
      value: stringValue,
      description
    }
  })
}

// 批量保存设置
export async function saveSettings(
  settings: Array<{
    key: string  // 接受任意字符串，内部会进行验证
    value: any
    description?: string
  }>
): Promise<Setting[]> {
  const results: Setting[] = []
  
  for (const setting of settings) {
    // 验证key是否是有效的SettingKey
    if (!Object.values(SETTING_KEYS).includes(setting.key as SettingKey)) {
      console.warn(`Invalid setting key: ${setting.key}`)
      continue
    }
    
    const result = await saveSetting(
      setting.key as SettingKey,
      setting.value,
      setting.description
    )
    results.push(result)
  }
  
  return results
}

// 删除设置
export async function deleteSetting(key: SettingKey): Promise<Setting> {
  return prisma.setting.delete({
    where: { key }
  })
}

// 获取站点设置
export async function getSiteSettings() {
  const keys: SettingKey[] = [
    SETTING_KEYS.SITE_TITLE,
    SETTING_KEYS.SITE_DESCRIPTION,
    SETTING_KEYS.SITE_KEYWORDS,
    SETTING_KEYS.SITE_LOGO,
    SETTING_KEYS.SITE_FAVICON,
    SETTING_KEYS.SITE_URL,
    SETTING_KEYS.COPYRIGHT_TEXT,
    SETTING_KEYS.ICP_RECORD,
  ]
  
  return getSettingValues(keys)
}

// 获取邮件设置
export async function getEmailSettings() {
  const keys: SettingKey[] = [
    SETTING_KEYS.SMTP_HOST,
    SETTING_KEYS.SMTP_PORT,
    SETTING_KEYS.SMTP_USER,
    SETTING_KEYS.SMTP_PASS,
    SETTING_KEYS.SMTP_FROM,
    SETTING_KEYS.SMTP_SECURE,
  ]
  
  return getSettingValues(keys)
}

// 获取功能开关
export async function getFeatureFlags() {
  const keys: SettingKey[] = [
    SETTING_KEYS.ENABLE_REGISTRATION,
    SETTING_KEYS.ENABLE_COMMENTS,
    SETTING_KEYS.ENABLE_LIKES,
    SETTING_KEYS.ENABLE_ANALYTICS,
    SETTING_KEYS.MAINTENANCE_MODE,
  ]
  
  return getSettingValues(keys)
}

// 获取社交媒体链接
export async function getSocialLinks() {
  const keys: SettingKey[] = [
    SETTING_KEYS.SOCIAL_GITHUB,
    SETTING_KEYS.SOCIAL_TWITTER,
    SETTING_KEYS.SOCIAL_WEIBO,
    SETTING_KEYS.SOCIAL_EMAIL,
  ]
  
  return getSettingValues(keys)
}

// 检查是否处于维护模式
export async function isMaintenanceMode(): Promise<boolean> {
  const setting = await getSetting(SETTING_KEYS.MAINTENANCE_MODE)
  return setting?.value === 'true'
}

// 获取缓存的设置（用于高频访问）
let cachedSettings: Record<string, any> | null = null
let cacheExpiry: number = 0

export async function getCachedSettings(
  forceRefresh = false
): Promise<Record<string, any>> {
  const now = Date.now()
  
  if (!forceRefresh && cachedSettings && cacheExpiry > now) {
    return cachedSettings
  }
  
  const settings = await getSettings()
  cachedSettings = {}
  
  for (const setting of settings) {
    try {
      if (setting.value === null) {
        cachedSettings[setting.key] = null
      } else if (typeof setting.value === 'string') {
        cachedSettings[setting.key] = JSON.parse(setting.value)
      } else {
        cachedSettings[setting.key] = setting.value
      }
    } catch {
      cachedSettings[setting.key] = setting.value
    }
  }
  
  // 缓存5分钟
  cacheExpiry = now + 5 * 60 * 1000
  
  return cachedSettings
}

// 清除设置缓存
export function clearSettingsCache() {
  cachedSettings = null
  cacheExpiry = 0
}