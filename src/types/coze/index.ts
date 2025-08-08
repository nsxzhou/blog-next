/**
 * Coze API 类型定义
 */

// 工作流执行请求参数
export interface CozeWorkflowExecuteRequest {
  workflow_id: string
  parameters: Record<string, unknown>
}

// 工作流执行响应
export interface CozeWorkflowExecuteResponse {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  updated_at: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: {
    code: string
    message: string
  }
}

// 工作流状态枚举
export enum CozeWorkflowStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 客户端配置
export interface CozeClientConfig {
  token: string
  baseURL: string
  workflowId?: string
}

// API 错误响应
export interface CozeApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// 工作流执行结果
export interface CozeExecutionResult {
  success: boolean
  data?: CozeWorkflowExecuteResponse
  error?: CozeApiError
}