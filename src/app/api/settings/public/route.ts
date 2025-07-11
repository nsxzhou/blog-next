import { NextResponse } from 'next/server'
import { getSiteSettings, getSocialLinks } from '@/lib/settings'

// GET /api/settings/public - 获取公开的站点设置
export async function GET() {
  try {
    const [siteSettings, socialLinks] = await Promise.all([
      getSiteSettings(),
      getSocialLinks()
    ])
    
    return NextResponse.json({
      site: siteSettings,
      social: socialLinks
    })
  } catch (error) {
    console.error('获取公开设置失败:', error)
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 })
  }
}