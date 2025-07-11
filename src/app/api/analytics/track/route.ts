import { NextRequest, NextResponse } from 'next/server'
import { trackPageView } from '@/lib/analytics'
import { v4 as uuidv4 } from 'uuid'

// 解析用户代理字符串
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // 检测设备类型
  let device = 'desktop'
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    device = 'mobile'
  } else if (/tablet|ipad/i.test(ua)) {
    device = 'tablet'
  }
  
  // 检测浏览器
  let browser = 'unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // 检测操作系统
  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  return { device, browser, os }
}

// POST /api/analytics/track - 追踪页面访问
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageUrl, postId, duration } = body
    
    // 从请求头获取信息
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || null
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     null
    
    // 从cookie获取或生成session ID
    const sessionId = request.cookies.get('analytics_session')?.value || uuidv4()
    
    // 解析用户代理
    const { device, browser, os } = parseUserAgent(userAgent)
    
    // 获取用户ID（如果已登录）
    // 这里简化处理，实际应该从session中获取
    const userId = null
    
    // 记录访问
    await trackPageView({
      sessionId,
      postId: postId || undefined,
      userId: userId || undefined,
      pageUrl,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
      referrer: referer || undefined,
      device: device || undefined,
      browser: browser || undefined,
      os: os || undefined,
      country: undefined,
      city: undefined,
      duration
    })
    
    // 设置session cookie
    const response = NextResponse.json({ success: true })
    if (!request.cookies.get('analytics_session')) {
      response.cookies.set('analytics_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30天
      })
    }
    
    return response
  } catch (error) {
    console.error('追踪页面访问失败:', error)
    return NextResponse.json({ error: '追踪失败' }, { status: 500 })
  }
}