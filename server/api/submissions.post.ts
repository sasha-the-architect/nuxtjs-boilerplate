// For Nuxt 3, we'll use built-in storage system instead of file system directly
import { defineEventHandler, readBody } from 'h3'
import { logger } from '~/utils/logger'
import type { Submission } from '~/types/submission'
import {
  sendSuccessResponse,
  sendValidationError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { createSubmissionSchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  try {
    // Parse request body
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = createSubmissionSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (body as Record<string, unknown>)[firstError.path[0] as string]
      )
    }

    const validatedData = validationResult.data

    // Create a submission object with metadata
    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resourceData: {
        title: validatedData.title.trim(),
        description: validatedData.description.trim(),
        url: validatedData.url.trim(),
        category: validatedData.category.trim(),
        tags: validatedData.tags,
        pricingModel: validatedData.pricingModel,
        difficulty: validatedData.difficulty,
        technology: validatedData.technology,
        benefits: validatedData.benefits,
      },
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: 'anonymous',
    }

    // For now, we'll log the submission (in a real app, this would go to a database)
    logger.info(`Resource submitted: ${submission.id}`, { submission })

    return sendSuccessResponse(event, {
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
