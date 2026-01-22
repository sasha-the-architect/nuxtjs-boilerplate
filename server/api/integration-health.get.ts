import { defineEventHandler } from 'h3'
import {
  getAllCircuitBreakerStats,
  type CircuitBreakerStats,
} from '~/server/utils/circuit-breaker'
import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

interface IntegrationHealthReport {
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    totalCircuitBreakers: number
    openCircuitBreakers: number
    totalWebhooksQueued: number
    totalDeadLetterWebhooks: number
  }
  circuitBreakers: Record<string, CircuitBreakerStats>
  webhooks: {
    queue: {
      pending: number
      nextScheduled: string | null
    }
    deadLetter: {
      count: number
      items: Array<{
        id: string
        webhookId: string
        event: string
        failureReason: string
        createdAt: string
      }>
    }
  }
}

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    const circuitBreakerStats = getAllCircuitBreakerStats()
    const webhookQueueStats = await webhookQueueSystem.getQueueStats()
    const deadLetterQueue = await webhookStorage.getDeadLetterQueue()

    const openBreakers = Object.values(circuitBreakerStats).filter(
      stats => stats.state === 'open'
    )

    const halfOpenBreakers = Object.values(circuitBreakerStats).filter(
      stats => stats.state === 'half-open'
    )

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    if (openBreakers.length > 0) {
      overallStatus = 'unhealthy'
    } else if (halfOpenBreakers.length > 0 || deadLetterQueue.length > 0) {
      overallStatus = 'degraded'
    }

    const report: IntegrationHealthReport = {
      overall: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        totalCircuitBreakers: Object.keys(circuitBreakerStats).length,
        openCircuitBreakers: openBreakers.length,
        totalWebhooksQueued: webhookQueueStats.pending,
        totalDeadLetterWebhooks: deadLetterQueue.length,
      },
      circuitBreakers: circuitBreakerStats,
      webhooks: {
        queue: webhookQueueStats,
        deadLetter: {
          count: deadLetterQueue.length,
          items: deadLetterQueue.map(
            (dl: {
              id: string
              webhookId: string
              event: string
              failureReason: string
              lastAttemptAt: string
              createdAt: string
            }) => ({
              id: dl.id,
              webhookId: dl.webhookId,
              event: dl.event,
              failureReason: dl.failureReason,
              createdAt: dl.createdAt,
            })
          ),
        },
      },
    }

    return sendSuccessResponse(event, report)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
