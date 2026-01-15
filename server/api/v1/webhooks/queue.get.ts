import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const queueStats = webhookQueueSystem.getQueueStats()
    const queue = webhookStorage.getQueue()
    const deadLetterQueue = webhookStorage.getDeadLetterQueue()

    sendSuccessResponse(event, {
      stats: queueStats,
      queue: queue.map(item => ({
        id: item.id,
        webhookId: item.webhookId,
        event: item.event,
        scheduledFor: item.scheduledFor,
        retryCount: item.retryCount,
        maxRetries: item.maxRetries,
        createdAt: item.createdAt,
      })),
      deadLetterQueue: deadLetterQueue.map(dl => ({
        id: dl.id,
        webhookId: dl.webhookId,
        event: dl.event,
        failureReason: dl.failureReason,
        lastAttemptAt: dl.lastAttemptAt,
        deliveryAttempts: dl.deliveryAttempts.length,
        createdAt: dl.createdAt,
      })),
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
