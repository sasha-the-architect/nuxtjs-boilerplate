import prisma from './db'

export interface AnalyticsEvent {
  type: string
  resourceId?: string
  category?: string
  url?: string
  userAgent?: string
  ip?: string | null
  timestamp: number
  properties?: Record<string, unknown>
}

export async function insertAnalyticsEvent(
  event: AnalyticsEvent
): Promise<boolean> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: event.type,
        resourceId: event.resourceId || null,
        category: event.category || null,
        url: event.url || null,
        userAgent: event.userAgent || null,
        ip: event.ip || null,
        timestamp: event.timestamp,
        properties: event.properties ? JSON.stringify(event.properties) : null,
      },
    })
    return true
  } catch (error) {
    console.error('Error inserting analytics event:', error)
    return false
  }
}

function mapDbEventToAnalyticsEvent(event: {
  type: string
  resourceId: string | null
  category: string | null
  url: string | null
  userAgent: string | null
  ip: string | null
  timestamp: number
  properties: string | null
}): AnalyticsEvent {
  return {
    type: event.type,
    resourceId: event.resourceId || undefined,
    category: event.category || undefined,
    url: event.url || undefined,
    userAgent: event.userAgent || undefined,
    ip: event.ip || undefined,
    timestamp: event.timestamp,
    properties: event.properties ? JSON.parse(event.properties) : undefined,
  }
}

export async function getAnalyticsEventsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 10000
): Promise<AnalyticsEvent[]> {
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: startDate.getTime(),
          lte: endDate.getTime(),
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    console.error('Error getting analytics events by date range:', error)
    return []
  }
}

export async function getAnalyticsEventsForResource(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  eventType?: string
): Promise<AnalyticsEvent[]> {
  try {
    const where: any = {
      resourceId,
      timestamp: {
        gte: startDate.getTime(),
        lte: endDate.getTime(),
      },
    }

    if (eventType) {
      where.type = eventType
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    console.error('Error getting analytics events for resource:', error)
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
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: {
          timestamp: {
            gte: startDate.getTime(),
            lte: endDate.getTime(),
          },
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
        },
        _count: true,
      }),
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          date(datetime(timestamp/1000, 'unixepoch')) as date,
          COUNT(*) as count
        FROM AnalyticsEvent
        WHERE timestamp >= ${startDate.getTime()} AND timestamp <= ${endDate.getTime()}
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
        },
        _count: true,
      }),
    ])

    const eventsByTypeMap: Record<string, number> = {}
    eventsByType.forEach((item: any) => {
      eventsByTypeMap[item.type] = item._count
    })

    const resourceViewsMap: Record<string, number> = {}
    resourceViews.forEach((item: any) => {
      if (item.resourceId) {
        resourceViewsMap[item.resourceId] = item._count
      }
    })

    const eventsByCategory: Record<string, number> = {}
    categoryData.forEach((item: any) => {
      if (item.category) {
        eventsByCategory[item.category] = item._count
      }
    })

    return {
      totalEvents,
      eventsByType: eventsByTypeMap,
      eventsByCategory,
      resourceViews: resourceViewsMap,
      dailyTrends,
    }
  } catch (error) {
    console.error('Error getting aggregated analytics:', error)
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
    console.error('Error getting resource analytics:', error)
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
    console.error('Error exporting analytics to CSV:', error)
    return 'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'
  }
}

export async function cleanupOldEvents(
  retentionDays: number = 30
): Promise<number> {
  try {
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000

    const result = await prisma.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('Error cleaning up old analytics events:', error)
    return 0
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect()
}
