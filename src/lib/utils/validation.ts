import { z } from 'zod'
import { NextResponse } from 'next/server'
import { errorResponse } from './api/response'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      throw new ValidationError(message)
    }
    throw error
  }
}

export async function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): Promise<T> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return await validateRequest(schema, params)
}

export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return errorResponse('VALIDATION_ERROR', error.message, 400)
  }
  return errorResponse('INTERNAL_ERROR', '服务器内部错误', 500)
}