"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "配置错误",
    description: "认证系统配置有误，请联系管理员。",
  },
  AccessDenied: {
    title: "访问被拒绝",
    description: "您没有权限访问此资源。",
  },
  Verification: {
    title: "验证失败",
    description: "邮箱验证链接已过期或无效。",
  },
  Default: {
    title: "认证错误",
    description: "登录过程中出现错误，请重试。",
  },
  OAuthSignin: {
    title: "OAuth 登录失败",
    description: "使用第三方账户登录时出现错误。",
  },
  OAuthCallback: {
    title: "OAuth 回调错误",
    description: "处理第三方登录回调时出现错误。",
  },
  OAuthCreateAccount: {
    title: "创建账户失败",
    description: "无法创建新账户，可能邮箱已被使用。",
  },
  EmailCreateAccount: {
    title: "邮箱注册失败",
    description: "使用该邮箱创建账户时出现错误。",
  },
  Callback: {
    title: "回调错误",
    description: "认证回调处理失败。",
  },
  OAuthAccountNotLinked: {
    title: "账户未关联",
    description: "该邮箱已经与其他登录方式关联，请使用原有方式登录。",
  },
  SessionRequired: {
    title: "需要登录",
    description: "请先登录后再访问此页面。",
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  
  const errorInfo = errorMessages[error || ""] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 mb-8">
            {errorInfo.description}
          </p>
          
          {error && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">错误代码: {error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              返回登录
            </Link>
            
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            如果问题持续存在，请联系网站管理员
          </p>
        </div>
      </div>
    </div>
  )
}