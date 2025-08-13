import { getDefaultCozeClient, getDefaultWorkflowId } from '@/lib/utils/coze-client'
import { 
  CozeWorkflowExecuteRequest, 
  CozeExecutionResult
} from '@/types/coze'

/**
 * Coze API 服务类
 * 提供工作流执行相关的业务逻辑
 */
export class CozeService {
  /**
   * 执行工作流
   * @param request 工作流执行请求参数
   * @returns 执行结果
   */
  static async executeWorkflow(request: CozeWorkflowExecuteRequest): Promise<CozeExecutionResult> {
    try {
      const client = getDefaultCozeClient()
      
      const response = await client.workflows.runs.create({
        workflow_id: request.workflow_id,
        parameters: request.parameters
      })

      return {
        success: true,
        data: {
          id: (response as { id?: string })?.id || Date.now().toString(),
          workflow_id: request.workflow_id,
          status: 'running',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          input: request.parameters,
          output: response as unknown as Record<string, unknown>
        }
      }
    } catch (error) {
      console.error('工作流执行失败:', error)
      
      return {
        success: false,
        error: {
          code: 'WORKFLOW_EXECUTION_FAILED',
          message: error instanceof Error ? error.message : '工作流执行失败',
          details: error instanceof Error ? { stack: error.stack } : undefined
        }
      }
    }
  }

  /**
   * 使用默认工作流 ID 执行工作流
   * @param parameters 工作流参数
   * @returns 执行结果
   */
  static async executeDefaultWorkflow(parameters: Record<string, unknown> = {}): Promise<CozeExecutionResult> {
    try {
      const workflowId = getDefaultWorkflowId()
      
      return await this.executeWorkflow({
        workflow_id: workflowId,
        parameters
      })
    } catch (error) {
      console.error('默认工作流执行失败:', error)
      
      return {
        success: false,
        error: {
          code: 'DEFAULT_WORKFLOW_EXECUTION_FAILED',
          message: error instanceof Error ? error.message : '默认工作流执行失败',
          details: error instanceof Error ? { stack: error.stack } : undefined
        }
      }
    }
  }

  /**
   * 验证工作流配置
   * @returns 验证结果
   */
  static async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // 检查环境变量
      if (!process.env.COZE_API_TOKEN) {
        errors.push('COZE_API_TOKEN 环境变量未设置')
      }

      if (!process.env.COZE_BASE_URL) {
        errors.push('COZE_BASE_URL 环境变量未设置')
      }

      if (!process.env.COZE_WORKFLOW_ID) {
        errors.push('COZE_WORKFLOW_ID 环境变量未设置')
      }

      // 如果环境变量完整，尝试创建客户端
      if (errors.length === 0) {
        getDefaultCozeClient()
        getDefaultWorkflowId()
      }

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '配置验证失败')
      
      return {
        valid: false,
        errors
      }
    }
  }
}