import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as analyticsDb from '~/server/utils/analytics-db'

vi.mock('~/server/utils/db', () => ({
  default: {
    analyticsEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  },
}))

import prisma from '~/server/utils/db'

describe('analytics-db', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('insertAnalyticsEvent', () => {
    describe('Happy Path - Inserts event successfully', () => {
      it('should insert event with all fields', async () => {
        vi.mocked(prisma.analyticsEvent.create).mockResolvedValue({
          id: '1',
          type: 'resource_view',
          resourceId: 'resource-123',
          category: 'Development',
          url: 'https://example.com',
          userAgent: 'Mozilla/5.0',
          ip: '127.0.0.1',
          timestamp: Date.now(),
          properties: JSON.stringify({ referrer: 'google.com' }),
        })

        const event: analyticsDb.AnalyticsEvent = {
          type: 'resource_view',
          resourceId: 'resource-123',
          category: 'Development',
          url: 'https://example.com',
          userAgent: 'Mozilla/5.0',
          ip: '127.0.0.1',
          timestamp: Date.now(),
          properties: { referrer: 'google.com' },
        }

        const result = await analyticsDb.insertAnalyticsEvent(event)

        expect(result).toBe(true)
        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
          data: {
            type: event.type,
            resourceId: event.resourceId,
            category: event.category,
            url: event.url,
            userAgent: event.userAgent,
            ip: event.ip,
            timestamp: event.timestamp,
            properties: JSON.stringify(event.properties),
          },
        })
      })

      it('should insert event with minimal required fields', async () => {
        vi.mocked(prisma.analyticsEvent.create).mockResolvedValue({
          id: '1',
          type: 'search',
          timestamp: Date.now(),
        } as any)

        const event: analyticsDb.AnalyticsEvent = {
          type: 'search',
          timestamp: Date.now(),
        }

        const result = await analyticsDb.insertAnalyticsEvent(event)

        expect(result).toBe(true)
        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
          data: {
            type: event.type,
            resourceId: null,
            category: null,
            url: null,
            userAgent: null,
            ip: null,
            timestamp: event.timestamp,
            properties: null,
          },
        })
      })

      it('should handle null ip address', async () => {
        vi.mocked(prisma.analyticsEvent.create).mockResolvedValue({
          id: '1',
          type: 'resource_view',
          timestamp: Date.now(),
        } as any)

        const event: analyticsDb.AnalyticsEvent = {
          type: 'resource_view',
          timestamp: Date.now(),
          ip: null,
        }

        const result = await analyticsDb.insertAnalyticsEvent(event)

        expect(result).toBe(true)
        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ ip: null }),
        })
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return false on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.create).mockRejectedValue(
          new Error('Database connection failed')
        )

        const event: analyticsDb.AnalyticsEvent = {
          type: 'resource_view',
          timestamp: Date.now(),
        }

        const result = await analyticsDb.insertAnalyticsEvent(event)

        expect(result).toBe(false)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error inserting analytics event:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('getAnalyticsEventsByDateRange', () => {
    describe('Happy Path - Returns events in date range', () => {
      it('should return events ordered by timestamp descending', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([
          {
            id: '1',
            type: 'resource_view',
            resourceId: 'resource-1',
            category: 'Development',
            url: 'https://example.com/1',
            userAgent: 'Mozilla/5.0',
            ip: '127.0.0.1',
            timestamp: endDate.getTime(),
            properties: null,
          },
          {
            id: '2',
            type: 'search',
            resourceId: null,
            category: null,
            url: null,
            userAgent: null,
            ip: null,
            timestamp: startDate.getTime(),
            properties: JSON.stringify({ query: 'test' }),
          },
        ])

        const result = await analyticsDb.getAnalyticsEventsByDateRange(
          startDate,
          endDate
        )

        expect(result).toHaveLength(2)
        expect(result[0].type).toBe('resource_view')
        expect(result[1].type).toBe('search')
        expect(result[1].properties).toEqual({ query: 'test' })
        expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
          where: {
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 10000,
        })
      })

      it('should respect custom limit', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([])

        await analyticsDb.getAnalyticsEventsByDateRange(startDate, endDate, 500)

        expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
          where: expect.anything(),
          orderBy: expect.anything(),
          take: 500,
        })
      })

      it('should return empty array for no events', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([])

        const result = await analyticsDb.getAnalyticsEventsByDateRange(
          startDate,
          endDate
        )

        expect(result).toEqual([])
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return empty array on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.getAnalyticsEventsByDateRange(
          startDate,
          endDate
        )

        expect(result).toEqual([])
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error getting analytics events by date range:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('getAnalyticsEventsForResource', () => {
    describe('Happy Path - Returns events for resource', () => {
      it('should return events filtered by resource id and date range', async () => {
        const resourceId = 'resource-123'
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([
          {
            id: '1',
            type: 'resource_view',
            resourceId,
            category: 'Development',
            url: 'https://example.com',
            userAgent: 'Mozilla/5.0',
            ip: '127.0.0.1',
            timestamp: Date.now(),
            properties: null,
          },
        ])

        const result = await analyticsDb.getAnalyticsEventsForResource(
          resourceId,
          startDate,
          endDate
        )

        expect(result).toHaveLength(1)
        expect(result[0].resourceId).toBe(resourceId)
        expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
          where: {
            resourceId,
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        })
      })

      it('should filter by event type when specified', async () => {
        const resourceId = 'resource-123'
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([])

        await analyticsDb.getAnalyticsEventsForResource(
          resourceId,
          startDate,
          endDate,
          'resource_view'
        )

        expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
          where: {
            resourceId,
            timestamp: {
              gte: startDate.getTime(),
              lte: endDate.getTime(),
            },
            type: 'resource_view',
          },
          orderBy: expect.anything(),
        })
      })

      it('should return empty array when no events match', async () => {
        const resourceId = 'resource-123'
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([])

        const result = await analyticsDb.getAnalyticsEventsForResource(
          resourceId,
          startDate,
          endDate
        )

        expect(result).toEqual([])
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return empty array on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.findMany).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.getAnalyticsEventsForResource(
          'resource-123',
          new Date('2026-01-01'),
          new Date('2026-01-31')
        )

        expect(result).toEqual([])
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error getting analytics events for resource:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('getAggregatedAnalytics', () => {
    describe('Happy Path - Returns aggregated analytics data', () => {
      it('should return complete aggregation with all metrics', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.count).mockResolvedValue(100)
        vi.mocked(prisma.analyticsEvent.groupBy).mockResolvedValue([
          { type: 'resource_view', _count: 80 },
          { type: 'search', _count: 20 },
        ])
        vi.mocked(prisma.$queryRaw).mockResolvedValue([
          { date: '2026-01-01', count: 50 },
          { date: '2026-01-02', count: 50 },
        ])

        const result = await analyticsDb.getAggregatedAnalytics(
          startDate,
          endDate
        )

        expect(result.totalEvents).toBe(100)
        expect(result.eventsByType).toEqual({
          resource_view: 80,
          search: 20,
        })
        expect(result.resourceViews).toEqual({})
        expect(result.eventsByCategory).toEqual({})
        expect(result.dailyTrends).toEqual([
          { date: '2026-01-01', count: 50 },
          { date: '2026-01-02', count: 50 },
        ])
      })

      it('should aggregate resource views correctly', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.count).mockResolvedValue(80)
        vi.mocked(prisma.analyticsEvent.groupBy).mockImplementation(
          async (args: any) => {
            if (args && 'by' in args && args.by[0] === 'resourceId') {
              return [
                { resourceId: 'res-1', _count: 50 },
                { resourceId: 'res-2', _count: 30 },
              ]
            }
            return []
          }
        )
        vi.mocked(prisma.$queryRaw).mockResolvedValue([])

        const result = await analyticsDb.getAggregatedAnalytics(
          startDate,
          endDate
        )

        expect(result.resourceViews).toEqual({
          'res-1': 50,
          'res-2': 30,
        })
      })

      it('should aggregate events by category correctly', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.count).mockResolvedValue(100)
        vi.mocked(prisma.$queryRaw).mockResolvedValue([])

        vi.mocked(prisma.analyticsEvent.groupBy).mockImplementation(
          async (args: any) => {
            if (args && 'by' in args && args.by[0] === 'category') {
              return [
                { category: 'Development', _count: 60 },
                { category: 'Design', _count: 40 },
              ]
            }
            return []
          }
        )

        const result = await analyticsDb.getAggregatedAnalytics(
          startDate,
          endDate
        )

        expect(result.eventsByCategory).toEqual({
          Development: 60,
          Design: 40,
        })
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return default object on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.count).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.getAggregatedAnalytics(
          new Date('2026-01-01'),
          new Date('2026-01-31')
        )

        expect(result).toEqual({
          totalEvents: 0,
          eventsByType: {},
          eventsByCategory: {},
          resourceViews: {},
          dailyTrends: [],
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error getting aggregated analytics:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('getResourceAnalytics', () => {
    describe('Happy Path - Returns resource-specific analytics', () => {
      it('should return complete resource analytics', async () => {
        const resourceId = 'resource-123'
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.count).mockResolvedValue(100)
        vi.mocked(prisma.analyticsEvent.groupBy).mockResolvedValue([
          { ip: '127.0.0.1', _count: 1 },
          { ip: '192.168.1.1', _count: 1 },
        ])
        vi.mocked(prisma.analyticsEvent.findFirst).mockResolvedValue({
          timestamp: endDate.getTime(),
        } as any)
        vi.mocked(prisma.$queryRaw).mockResolvedValue([
          { date: '2026-01-01', count: 50 },
          { date: '2026-01-02', count: 50 },
        ])

        const result = await analyticsDb.getResourceAnalytics(
          resourceId,
          startDate,
          endDate
        )

        expect(result.resourceId).toBe(resourceId)
        expect(result.viewCount).toBe(100)
        expect(result.uniqueVisitors).toBe(2)
        expect(result.lastViewed).toBe(
          new Date(endDate.getTime()).toISOString()
        )
        expect(result.dailyViews).toEqual([
          { date: '2026-01-01', count: 50 },
          { date: '2026-01-02', count: 50 },
        ])
      })

      it('should return current time as lastViewed when no events', async () => {
        const resourceId = 'resource-123'
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.count).mockResolvedValue(0)
        vi.mocked(prisma.analyticsEvent.groupBy).mockResolvedValue([])
        vi.mocked(prisma.analyticsEvent.findFirst).mockResolvedValue(null)
        vi.mocked(prisma.$queryRaw).mockResolvedValue([])

        const result = await analyticsDb.getResourceAnalytics(
          resourceId,
          startDate,
          endDate
        )

        expect(result.viewCount).toBe(0)
        expect(result.uniqueVisitors).toBe(0)
        expect(result.lastViewed).toBeDefined()
        expect(result.dailyViews).toEqual([])
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return default object on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.count).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.getResourceAnalytics(
          'resource-123',
          new Date('2026-01-01'),
          new Date('2026-01-31')
        )

        expect(result).toEqual({
          resourceId: 'resource-123',
          viewCount: 0,
          uniqueVisitors: 0,
          lastViewed: expect.any(String),
          dailyViews: [],
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error getting resource analytics:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('exportAnalyticsToCsv', () => {
    describe('Happy Path - Exports analytics to CSV', () => {
      it('should generate CSV with headers and data', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([
          {
            id: '1',
            type: 'resource_view',
            resourceId: 'resource-123',
            category: 'Development',
            url: 'https://example.com',
            userAgent: 'Mozilla/5.0',
            ip: '127.0.0.1',
            timestamp: Date.now(),
            properties: JSON.stringify({ referrer: 'google.com' }),
          },
        ])

        const result = await analyticsDb.exportAnalyticsToCsv(
          startDate,
          endDate
        )

        expect(result).toContain(
          'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties'
        )
        expect(result).toContain('resource_view')
        expect(result).toContain('resource-123')
        expect(result).toContain('Development')
      })

      it('should escape quotes in properties', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([
          {
            id: '1',
            type: 'resource_view',
            resourceId: null,
            category: null,
            url: null,
            userAgent: null,
            ip: null,
            timestamp: Date.now(),
            properties: JSON.stringify({ title: 'Test "quoted" value' }),
          },
        ])

        const result = await analyticsDb.exportAnalyticsToCsv(
          startDate,
          endDate
        )

        expect(result).toContain('"quoted"')
      })

      it('should return only headers when no events', async () => {
        const startDate = new Date('2026-01-01')
        const endDate = new Date('2026-01-31')

        vi.mocked(prisma.analyticsEvent.findMany).mockResolvedValue([])

        const result = await analyticsDb.exportAnalyticsToCsv(
          startDate,
          endDate
        )

        expect(result).toContain(
          'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties'
        )
        const lines = result.split('\n').filter(line => line.trim())
        expect(lines).toHaveLength(1)
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return CSV headers on error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.findMany).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.exportAnalyticsToCsv(
          new Date('2026-01-01'),
          new Date('2026-01-31')
        )

        expect(result).toBe(
          'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'
        )
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error getting analytics events by date range:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('cleanupOldEvents', () => {
    describe('Happy Path - Deletes old events', () => {
      it('should delete events older than retention period', async () => {
        vi.mocked(prisma.analyticsEvent.deleteMany).mockResolvedValue({
          count: 100,
        })

        const result = await analyticsDb.cleanupOldEvents(30)

        expect(result).toBe(100)
        expect(prisma.analyticsEvent.deleteMany).toHaveBeenCalledWith({
          where: {
            timestamp: {
              lt: expect.any(Number),
            },
          },
        })
      })

      it('should use default 30 day retention period', async () => {
        vi.mocked(prisma.analyticsEvent.deleteMany).mockResolvedValue({
          count: 0,
        })

        await analyticsDb.cleanupOldEvents()

        expect(prisma.analyticsEvent.deleteMany).toHaveBeenCalledWith({
          where: {
            timestamp: {
              lt: expect.any(Number),
            },
          },
        })
      })

      it('should return 0 when no events to delete', async () => {
        vi.mocked(prisma.analyticsEvent.deleteMany).mockResolvedValue({
          count: 0,
        })

        const result = await analyticsDb.cleanupOldEvents(30)

        expect(result).toBe(0)
      })
    })

    describe('Sad Path - Handles errors gracefully', () => {
      it('should return 0 on database error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        vi.mocked(prisma.analyticsEvent.deleteMany).mockRejectedValue(
          new Error('Database connection failed')
        )

        const result = await analyticsDb.cleanupOldEvents(30)

        expect(result).toBe(0)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error cleaning up old analytics events:',
          expect.any(Error)
        )
        consoleErrorSpy.mockRestore()
      })
    })
  })

  describe('closeDatabase', () => {
    it('should disconnect from database', async () => {
      await analyticsDb.closeDatabase()

      expect(prisma.$disconnect).toHaveBeenCalled()
    })
  })
})
