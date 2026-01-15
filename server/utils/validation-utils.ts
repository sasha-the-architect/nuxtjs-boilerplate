import type { ZodError, ZodType } from 'zod'
import type { H3Event } from 'h3'
import { readBody, getQuery } from 'h3'
import { sendBadRequestError } from './api-response'

export function validateRequest<T>(
  schema: ZodType<T>,
  data: unknown,
  event?: H3Event
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (event) {
      const errors = (result.error as ZodError).issues.map(err => ({
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
  schema: ZodType<T>,
  event: H3Event
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

export function validateQueryParams<T>(schema: ZodType<T>, event: H3Event): T {
  const query = getQuery(event)
  return validateRequest(schema, query, event)
}
