import { z } from 'zod'

/**
 * 工作流执行请求验证模式
 */
export const CozeWorkflowExecuteSchema = z.object({
  workflow_id: z.string().min(1, '工作流 ID 不能为空'),
  parameters: z.record(z.string(), z.unknown()).default({})
})

/**
 * 工作流执行请求（使用默认工作流 ID）
 */
export const CozeExecuteSchema = z.object({
  parameters: z.record(z.string(), z.unknown()).default({})
})

/**
 * 工作流 ID 验证模式
 */
export const CozeWorkflowIdSchema = z.object({
  workflow_id: z.string().min(1, '工作流 ID 不能为空')
})

// 导出类型
export type CozeWorkflowExecuteInput = z.infer<typeof CozeWorkflowExecuteSchema>
export type CozeExecuteInput = z.infer<typeof CozeExecuteSchema>
export type CozeWorkflowIdInput = z.infer<typeof CozeWorkflowIdSchema>