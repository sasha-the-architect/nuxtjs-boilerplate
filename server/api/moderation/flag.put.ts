import { readBody } from 'h3'
import type { Flag } from '~/types/resource'

const mockFlags: Flag[] = []
const mockResources: unknown[] = []

import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.resourceId) {
      sendBadRequestError(event, 'Resource ID is required')
      return
    }

    if (
      !body.reason ||
      typeof body.reason !== 'string' ||
      body.reason.trim().length === 0
    ) {
      sendBadRequestError(event, 'Flag reason is required')
      return
    }

    if (!body.reportedBy) {
      sendBadRequestError(event, 'Reporter ID is required')
      return
    }

    const resourceExists = mockResources.some(
      res =>
        res &&
        typeof res === 'object' &&
        'id' in res &&
        (res as { id: string }).id === body.resourceId
    )

    if (!resourceExists) {
      sendNotFoundError(event, 'Resource', body.resourceId)
      return
    }

    // Create a flag
    const newFlag: Flag = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resourceId: body.resourceId,
      reason: body.reason,
      reportedBy: body.reportedBy,
      createdAt: new Date().toISOString(),
      resolved: false,
    }

    // Add to flags (in a real app, this would be stored in a database)
    mockFlags.push(newFlag)

    sendSuccessResponse(event, {
      message: 'Resource flagged successfully',
      flag: newFlag,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
