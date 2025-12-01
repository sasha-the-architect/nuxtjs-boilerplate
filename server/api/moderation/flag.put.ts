import { readBody } from 'h3'
import type { Flag } from '~/types/resource'

// Mock data for demonstration - in a real application, this would come from a database
let mockFlags: Flag[] = []
let mockResources: any[] = []

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.resourceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Resource ID is required',
      })
    }

    if (
      !body.reason ||
      typeof body.reason !== 'string' ||
      body.reason.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Flag reason is required',
      })
    }

    if (!body.reportedBy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reporter ID is required',
      })
    }

    // Check if resource exists
    const resourceExists = mockResources.some(res => res.id === body.resourceId)

    if (!resourceExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource not found',
      })
    }

    // Create the flag
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

    return {
      success: true,
      message: 'Resource flagged successfully',
      flag: newFlag,
    }
  } catch (error: any) {
    console.error('Error flagging resource:', error)

    if (error.statusCode) {
      return {
        success: false,
        message: error.statusMessage,
      }
    }

    return {
      success: false,
      message: 'An error occurred while flagging the resource',
    }
  }
})
