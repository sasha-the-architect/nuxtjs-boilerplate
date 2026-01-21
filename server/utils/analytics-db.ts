import prisma from './db'
import { analyticsEventSchema } from './validation-schemas'
import { logger } from '~/utils/logger'

export interface AnalyticsEvent {
  id?: string
  type: string
  resourceId?: string
  category?: string
  url?: string
  userAgent?: string
  ip?: string | null
  timestamp: number
  deletedAt?: number | null
  properties?: Record<string, unknown>
}

export async function insertAnalyticsEvent(
  event: AnalyticsEvent
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = analyticsEventSchema.safeParse(event)

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      logger.error('Analytics event validation failed:', errorMessage)
      return { success: false, error: errorMessage }
    }

    const validatedEvent = validation.data

    await prisma.analyticsEvent.create({
      data: {
        type: validatedEvent.type,
        resourceId: validatedEvent.resourceId || null,
        category: validatedEvent.category || null,
        url: validatedEvent.url || null,
        userAgent: validatedEvent.userAgent || null,
        ip: validatedEvent.ip || null,
        timestamp: validatedEvent.timestamp,
        properties: validatedEvent.properties
          ? JSON.stringify(validatedEvent.properties)
          : null,
        deletedAt: null,
      },
    })
    return { success: true }
  } catch (error) {
    logger.error('Error inserting analytics event:', error)
    return { success: false, error: String(error) }
  }
}

function mapDbEventToAnalyticsEvent(event: {
  id: string
  type: string
  resourceId: string | null
  category: string | null
  url: string | null
  userAgent: string | null
  ip: string | null
  timestamp: number
  deletedAt: number | null
  properties: string | null
}): AnalyticsEvent {
  return {
    id: event.id,
    type: event.type,
    resourceId: event.resourceId || undefined,
    category: event.category || undefined,
    url: event.url || undefined,
    userAgent: event.userAgent || undefined,
    ip: event.ip || undefined,
    timestamp: event.timestamp,
    deletedAt: event.deletedAt || undefined,
    properties: event.properties ? JSON.parse(event.properties) : undefined,
  }
}

export async function getAnalyticsEventsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 10000,
  includeDeleted: boolean = false
): Promise<AnalyticsEvent[]> {
  try {
    const where: Record<string, unknown> = {
      timestamp: {
        gte: startDate.getTime(),
        lte: endDate.getTime(),
      },
    }

    if (!includeDeleted) {
      where.deletedAt = null
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting analytics events by date range:', error)
    return []
  }
}

export async function getAnalyticsEventsForResource(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  eventType?: string,
  includeDeleted: boolean = false,
  limit: number = 10000
): Promise<AnalyticsEvent[]> {
  try {
    const where: Record<string, unknown> = {
      resourceId,
      timestamp: {
        gte: startDate.getTime(),
        lte: endDate.getTime(),
      },
    }

    if (eventType) {
      where.type = eventType
    }

    if (!includeDeleted) {
      where.deletedAt = null
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting analytics events for resource:', error)
    return []
  }
}

export async function getAggregatedAnalytics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  resourceViews: Record<string, number>
  dailyTrends: Array<{ date: string; count: number }>
}> {
  try {
    const [
      totalEvents,
      eventsByType,
      resourceViews,
      dailyTrends,
      categoryData,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          timestamp: {
            gte: startDate.getTime(),
            lte: endDate.getTime(),
          },
          deletedAt: null,
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: {
          timestamp: {
            gte: startDate.getTime(),
            lte: endDate.getTime(),
          },
          deletedAt: null,
        },
        _count: true,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['resourceId'],
        where: {
          timestamp: {
            gte: startDate.getTime(),
            lte: endDate.getTime(),
          },
          type: 'resource_view',
          deletedAt: null,
        },
        _count: true,
      }),
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          date(datetime(timestamp/1000, 'unixepoch')) as date,
          COUNT(*) as count
        FROM AnalyticsEvent
        WHERE timestamp >= ${startDate.getTime()} 
          AND timestamp <= ${endDate.getTime()}
          AND deletedAt IS NULL
        GROUP BY date(timestamp/1000, 'unixepoch')
        ORDER BY date
      `,
      prisma.analyticsEvent.groupBy({
        by: ['category'],
        where: {
          timestamp: {
            gte: startDate.getTime(),
            lte: endDate.getTime(),
          },
          category: {
            not: null,
          },
          deletedAt: null,
        },
        _count: true,
      }),
    ])

    const eventsByTypeMap: Record<string, number> = {}
    eventsByType.forEach((item: { type: string; _count: number }) => {
      eventsByTypeMap[item.type] = item._count
    })

    const resourceViewsMap: Record<string, number> = {}
    resourceViews.forEach(
      (item: { resourceId: string | null; _count: number }) => {
        if (item.resourceId) {
          resourceViewsMap[item.resourceId] = item._count
        }
      }
    )

    const eventsByCategory: Record<string, number> = {}
    categoryData.forEach(
      (item: { category: string | null; _count: number }) => {
        if (item.category) {
          eventsByCategory[item.category] = item._count
        }
      }
    )

    return {
      totalEvents,
      eventsByType: eventsByTypeMap,
      eventsByCategory,
      resourceViews: resourceViewsMap,
      dailyTrends,
    }
  } catch (error) {
    logger.error('Error getting aggregated analytics:', error)
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByCategory: {},
      resourceViews: {},
      dailyTrends: [],
    }
  }
}

export async function getResourceAnalytics(
  resourceId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  resourceId: string
  viewCount: number
  uniqueVisitors: number
  lastViewed: string
  dailyViews: Array<{ date: string; count: number }>
}> {
  try {
    const [viewCount, uniqueVisitorsGroups, lastViewed, dailyViews] =
      await Promise.all([
        prisma.analyticsEvent.count({
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
            deletedAt: null,
          },
        }),
        prisma.analyticsEvent.groupBy({
          by: ['ip'],
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
            deletedAt: null,
          },
        }),
        prisma.analyticsEvent.findFirst({
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
            deletedAt: null,
          },
          orderBy: {
            timestamp: 'desc',
          },
        }),
        prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          date(datetime(timestamp/1000, 'unixepoch')) as date,
          COUNT(*) as count
        FROM AnalyticsEvent
        WHERE resourceId = ${resourceId}
          AND type = 'resource_view'
          AND timestamp >= ${startDate.getTime()}
          AND timestamp <= ${endDate.getTime()}
          AND deletedAt IS NULL
        GROUP BY date(timestamp/1000, 'unixepoch')
        ORDER BY date
      `,
      ])

    return {
      resourceId,
      viewCount,
      uniqueVisitors: uniqueVisitorsGroups.length,
      lastViewed: lastViewed
        ? new Date(lastViewed.timestamp).toISOString()
        : new Date().toISOString(),
      dailyViews,
    }
  } catch (error) {
    logger.error('Error getting resource analytics:', error)
    return {
      resourceId,
      viewCount: 0,
      uniqueVisitors: 0,
      lastViewed: new Date().toISOString(),
      dailyViews: [],
    }
  }
}

export async function exportAnalyticsToCsv(
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    const events = await getAnalyticsEventsByDateRange(
      startDate,
      endDate,
      100000
    )

    let csvContent =
      'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'

    for (const event of events) {
      const timestamp = new Date(event.timestamp).toISOString()
      const properties = JSON.stringify(event.properties || {}).replace(
        /"/g,
        '""'
      )

      csvContent +=
        [
          `"${event.type || ''}"`,
          `"${event.resourceId || ''}"`,
          `"${event.category || ''}"`,
          `"${event.url || ''}"`,
          `"${event.ip || ''}"`,
          `"${timestamp}"`,
          `"${properties}"`,
        ].join(',') + '\n'
    }

    return csvContent
  } catch (error) {
    logger.error('Error exporting analytics to CSV:', error)
    return 'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'
  }
}

export async function cleanupOldEvents(
  retentionDays: number = 30
): Promise<number> {
  try {
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    const deletedAt = Date.now()

    const result = await prisma.analyticsEvent.updateMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    })

    return result.count
  } catch (error) {
    logger.error('Error cleaning up old analytics events:', error)
    return 0
  }
}

export async function getSoftDeletedEventsCount(): Promise<number> {
  try {
    return await prisma.analyticsEvent.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    })
  } catch (error) {
    logger.error('Error getting soft-deleted events count:', error)
    return 0
  }
}

export async function getSoftDeletedEvents(
  limit: number = 1000
): Promise<AnalyticsEvent[]> {
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting soft-deleted events:', error)
    return []
  }
}

export async function restoreSoftDeletedEvents(
  eventIds: string[]
): Promise<number> {
  try {
    const result = await prisma.analyticsEvent.updateMany({
      where: {
        id: {
          in: eventIds,
        },
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    })

    return result.count
  } catch (error) {
    logger.error('Error restoring soft-deleted events:', error)
    return 0
  }
}

export async function exportSoftDeletedEventsToCsv(): Promise<string> {
  try {
    const events = await getSoftDeletedEvents(100000)

    let csvContent =
      'ID,Type,Resource ID,Category,URL,IP Address,Timestamp,Deleted At,Properties\n'

    for (const event of events) {
      const timestamp = new Date(event.timestamp).toISOString()
      const properties = JSON.stringify(event.properties || {}).replace(
        /"/g,
        '""'
      )

      csvContent +=
        [
          `"${event.id || ''}"`,
          `"${event.type || ''}"`,
          `"${event.resourceId || ''}"`,
          `"${event.category || ''}"`,
          `"${event.url || ''}"`,
          `"${event.ip || ''}"`,
          `"${timestamp}"`,
          `"${event.deletedAt ? new Date(event.deletedAt).toISOString() : ''}"`,
          `"${properties}"`,
        ].join(',') + '\n'
    }

    return csvContent
  } catch (error) {
    logger.error('Error exporting soft-deleted events to CSV:', error)
    return 'ID,Type,Resource ID,Category,URL,IP Address,Timestamp,Deleted At,Properties\n'
  }
}

export async function cleanupSoftDeletedEvents(
  backup: boolean = true
): Promise<{ deletedCount: number; backupPath?: string }> {
  try {
    let backupPath: string | undefined

    if (backup) {
      const csvContent = await exportSoftDeletedEventsToCsv()
      const fs = await import('fs/promises')
      const path = await import('path')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(process.cwd(), 'backups')

      await fs.mkdir(backupDir, { recursive: true })
      backupPath = path.join(backupDir, `soft-deleted-events-${timestamp}.csv`)
      await fs.writeFile(backupPath, csvContent, 'utf-8')
    }

    const result = await prisma.analyticsEvent.deleteMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
    })

    return { deletedCount: result.count, backupPath }
  } catch (error) {
    logger.error('Error cleaning up soft-deleted events:', error)
    return { deletedCount: 0 }
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect()
}
