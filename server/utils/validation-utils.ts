import type { ZodError } from 'zod'
import { readBody, getQuery } from 'h3'
import { sendBadRequestError } from './api-response'

export function validateRequest<T>(schema: any, data: unknown, event?: any): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (event) {
      const errors = (result.error as ZodError<any>).issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      sendBadRequestError(event, 'Validation failed', { errors })
    }

    throw new Error('Validation failed')
  }

  return result.data
}

export async function validateRequestBody<T>(
  schema: any,
  event: any
): Promise<T> {
  try {
    const body = await readBody(event)
    return validateRequest(schema, body, event)
  } catch (error) {
    if (error instanceof Error && error.message === 'Validation failed') {
      throw error
    }
    throw new Error('Failed to read request body')
  }
}

export function validateQueryParams<T>(schema: any, event: any): T {
  const query = getQuery(event)
  return validateRequest(schema, query, event)
}
