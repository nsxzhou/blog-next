import { NextResponse } from 'next/server'
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api/response'

/**
 * 创建成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status })
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  message?: string,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    error,
    message
  }, { status })
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message: string = '未授权访问'): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', message, 401)
}

/**
 * 创建禁止访问响应
 */
export function forbiddenResponse(message: string = '禁止访问'): NextResponse<ApiErrorResponse> {
  return errorResponse('FORBIDDEN', message, 403)
}

/**
 * 创建资源未找到响应
 */
export function notFoundResponse(message: string = '资源未找到'): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', message, 404)
}