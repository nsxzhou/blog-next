import { CozeAPI } from '@coze/api'
import { CozeClientConfig } from '@/types/coze'

/**
 * 创建 Coze API 客户端实例
 * @param config 客户端配置
 * @returns CozeAPI 实例
 */
export function createCozeClient(config: CozeClientConfig): CozeAPI {
  return new CozeAPI({
    token: config.token,
    baseURL: config.baseURL
  })
}

/**
 * 获取默认的 Coze 客户端实例
 * 使用环境变量中的配置
 * @returns CozeAPI 实例
 */
export function getDefaultCozeClient(): CozeAPI {
  const token = process.env.COZE_API_TOKEN
  const baseURL = process.env.COZE_BASE_URL

  if (!token) {
    throw new Error('COZE_API_TOKEN 环境变量未设置')
  }

  if (!baseURL) {
    throw new Error('COZE_BASE_URL 环境变量未设置')
  }

  return createCozeClient({
    token,
    baseURL
  })
}

/**
 * 获取默认工作流 ID
 * @returns 工作流 ID
 */
export function getDefaultWorkflowId(): string {
  const workflowId = process.env.COZE_WORKFLOW_ID
  
  if (!workflowId) {
    throw new Error('COZE_WORKFLOW_ID 环境变量未设置')
  }

  return workflowId
}