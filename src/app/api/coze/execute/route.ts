import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api/response'
import { CozeService } from '@/lib/services/coze.service'
import {
  validateRequest,
  handleValidationError,
} from '@/lib/utils/validation'
import { CozeExecuteSchema } from '@/lib/validations/coze'

/**
 * 执行 Coze 工作流
 * POST /api/coze/execute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = await validateRequest(CozeExecuteSchema, body)

    const result = await CozeService.executeDefaultWorkflow(validatedData.parameters)

    if (!result.success) {
      return errorResponse(
        result.error?.code || 'UNKNOWN_ERROR',
        result.error?.message || '工作流执行失败',
        500
      )
    }

    return successResponse(result.data, '工作流执行成功', 200)
  } catch (error) {
    console.error('Coze API 调用失败:', error)
    return handleValidationError(error)
  }
}

/**
 * 验证 Coze 配置
 * GET /api/coze/execute
 */
export async function GET() {
  try {
    const validation = await CozeService.validateConfiguration()

    if (!validation.valid) {
      return errorResponse('CONFIGURATION_INVALID', `配置验证失败: ${validation.errors.join(', ')}`, 500)
    }

    return successResponse({ status: 'ok' }, 'Coze 配置验证成功')
  } catch (error) {
    console.error('Coze 配置验证失败:', error)
    return errorResponse(
      'CONFIGURATION_ERROR',
      error instanceof Error ? error.message : '配置验证失败',
      500
    )
  }
}