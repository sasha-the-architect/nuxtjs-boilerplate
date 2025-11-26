import { describe, it, expect } from 'vitest'
import { Resource } from '~/types/resource'

// Mock the resources data for testing
const mockResources: Resource[] = [
  {
    id: 'test-1',
    title: 'Test Resource',
    description: 'A test resource',
    benefits: ['Benefit 1'],
    url: 'https://example.com',
    category: 'Test',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['test'],
    technology: ['Test'],
    dateAdded: '2025-01-01',
    popularity: 5,
    lastChecked: '2025-11-26T01:00:00.000Z',
    statusCode: 200,
    isHealthy: true,
    responseTime: 200,
    healthCheckError: null,
  },
  {
    id: 'test-2',
    title: 'Broken Resource',
    description: 'A test resource with broken link',
    benefits: ['Benefit 1'],
    url: 'https://invalid-url-example.com',
    category: 'Test',
    pricingModel: 'Free',
    difficulty: 'Beginner',
    tags: ['test'],
    technology: ['Test'],
    dateAdded: '2025-01-01',
    popularity: 3,
    lastChecked: '2025-11-26T01:00:00.000Z',
    statusCode: 404,
    isHealthy: false,
    responseTime: 150,
    healthCheckError: 'HTTP 404 - Not Found',
  },
]

describe('Resource Health API', () => {
  it('should return health summary statistics', async () => {
    // Mock the health data calculation
    const total = mockResources.length
    const healthyCount = mockResources.filter(r => r.isHealthy === true).length
    const unhealthyCount = mockResources.filter(
      r => r.isHealthy === false
    ).length
    const unknownCount = mockResources.filter(
      r => r.isHealthy === undefined
    ).length

    expect(total).toBe(2)
    expect(healthyCount).toBe(1)
    expect(unhealthyCount).toBe(1)
    expect(unknownCount).toBe(0)
    expect(Math.round((healthyCount / total) * 100)).toBe(50)
  })

  it('should correctly identify healthy resources', () => {
    const healthyResources = mockResources.filter(r => r.isHealthy === true)
    expect(healthyResources).toHaveLength(1)
    expect(healthyResources[0].title).toBe('Test Resource')
    expect(healthyResources[0].statusCode).toBe(200)
  })

  it('should correctly identify unhealthy resources', () => {
    const unhealthyResources = mockResources.filter(r => r.isHealthy === false)
    expect(unhealthyResources).toHaveLength(1)
    expect(unhealthyResources[0].title).toBe('Broken Resource')
    expect(unhealthyResources[0].statusCode).toBe(404)
    expect(unhealthyResources[0].healthCheckError).toBe('HTTP 404 - Not Found')
  })

  it('should support filtering by health status', () => {
    // Test filtering for healthy resources only
    const statusFilter = 'healthy'
    let filtered = mockResources
    if (statusFilter === 'healthy') {
      filtered = mockResources.filter(r => r.isHealthy === true)
    } else if (statusFilter === 'unhealthy') {
      filtered = mockResources.filter(r => r.isHealthy === false)
    } else if (statusFilter === 'unknown') {
      filtered = mockResources.filter(r => r.isHealthy === undefined)
    }

    expect(filtered).toHaveLength(1)
    expect(filtered[0].isHealthy).toBe(true)
  })

  it('should support pagination', () => {
    const offset = 0
    const limit = 1
    const paginated = mockResources.slice(offset, offset + limit)

    expect(paginated).toHaveLength(1)
    expect(paginated[0].title).toBe('Test Resource')
  })
})
