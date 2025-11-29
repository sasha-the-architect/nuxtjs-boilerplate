import { describe, it, expect } from 'vitest'
import { createEvent } from 'h3'
import { createResourceFactory } from '~/__tests__/factories/resource'

// Mock the resources.json import
vi.mock('~/data/resources.json', () => {
  const resources = [
    createResourceFactory({
      id: '1',
      title: 'Test Resource 1',
      category: 'Development',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['JavaScript', 'Vue.js'],
      tags: ['frontend', 'web'],
      benefits: ['Easy to use', 'Fast'],
    }),
    createResourceFactory({
      id: '2',
      title: 'Test Resource 2',
      category: 'Design',
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      technology: ['Figma', 'Photoshop'],
      tags: ['ui', 'ux'],
      benefits: ['Creative', 'Intuitive'],
    }),
    createResourceFactory({
      id: '3',
      title: 'Test Resource 3',
      category: 'Development',
      pricingModel: 'Free',
      difficulty: 'Advanced',
      technology: ['React', 'TypeScript'],
      tags: ['frontend', 'javascript'],
      benefits: ['Powerful', 'Scalable'],
    }),
  ]
  return { default: resources }
})

describe('Faceted Search API', () => {
  it('should return faceted counts for all filter types', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.facetCounts).toBeDefined()
    expect(response.data.totalResults).toBe(3)

    // Check that we have counts for categories
    expect(response.data.facetCounts['category_Development']).toBe(2)
    expect(response.data.facetCounts['category_Design']).toBe(1)

    // Check that we have counts for pricing models
    expect(response.data.facetCounts['pricing_Free']).toBe(2)
    expect(response.data.facetCounts['pricing_Paid']).toBe(1)

    // Check that we have counts for difficulty levels
    expect(response.data.facetCounts['difficulty_Beginner']).toBe(1)
    expect(response.data.facetCounts['difficulty_Intermediate']).toBe(1)
    expect(response.data.facetCounts['difficulty_Advanced']).toBe(1)

    // Check that we have counts for technologies
    expect(response.data.facetCounts['technology_JavaScript']).toBe(1)
    expect(response.data.facetCounts['technology_Vue.js']).toBe(1)
    expect(response.data.facetCounts['technology_React']).toBe(1)
    expect(response.data.facetCounts['technology_TypeScript']).toBe(1)

    // Check that we have counts for tags
    expect(response.data.facetCounts['tag_frontend']).toBe(2)
    expect(response.data.facetCounts['tag_web']).toBe(1)

    // Check that we have counts for benefits
    expect(response.data.facetCounts['benefits_Easy to use']).toBe(1)
    expect(response.data.facetCounts['benefits_Powerful']).toBe(1)
  })

  it('should return filtered faceted counts when search query is provided', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { q: 'test' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(3) // All resources match 'test' in title
  })

  it('should return filtered faceted counts when category filter is applied', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { category: 'Development' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(2) // Two development resources
    expect(response.data.facetCounts['category_Development']).toBe(2)
    // Should not appear since we filtered by Development
    expect(response.data.facetCounts['category_Design']).toBeUndefined()
  })

  it('should return filtered faceted counts when multiple filters are applied', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { category: 'Development', pricing: 'Free' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(2) // Two free development resources
    expect(response.data.facetCounts['category_Development']).toBe(2)
    expect(response.data.facetCounts['pricing_Free']).toBe(2)
    // Should not appear since we filtered by Free
    expect(response.data.facetCounts['pricing_Paid']).toBeUndefined()
  })

  it('should handle invalid tags parameter gracefully', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters with invalid tags
    event.context.params = {}
    event._query = { tags: 123 } // Invalid tags parameter

    const response = await handler.default(event)

    expect(response.success).toBe(false)
    expect(response.message).toContain('Invalid tags parameter')
  })

  it('should handle invalid search query parameter gracefully', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters with invalid search query
    event.context.params = {}
    event._query = { q: [] } // Invalid search query parameter

    const response = await handler.default(event)

    expect(response.success).toBe(false)
    expect(response.message).toContain('Invalid search query parameter')
  })
})

describe('Faceted Search API', () => {
  it('should return faceted counts for all filter types', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.facetCounts).toBeDefined()
    expect(response.data.totalResults).toBe(3)

    // Check that we have counts for categories
    expect(response.data.facetCounts['category_Development']).toBe(2)
    expect(response.data.facetCounts['category_Design']).toBe(1)

    // Check that we have counts for pricing models
    expect(response.data.facetCounts['pricing_Free']).toBe(2)
    expect(response.data.facetCounts['pricing_Paid']).toBe(1)

    // Check that we have counts for difficulty levels
    expect(response.data.facetCounts['difficulty_Beginner']).toBe(1)
    expect(response.data.facetCounts['difficulty_Intermediate']).toBe(1)
    expect(response.data.facetCounts['difficulty_Advanced']).toBe(1)

    // Check that we have counts for technologies
    expect(response.data.facetCounts['technology_JavaScript']).toBe(1)
    expect(response.data.facetCounts['technology_Vue.js']).toBe(1)
    expect(response.data.facetCounts['technology_React']).toBe(1)
    expect(response.data.facetCounts['technology_TypeScript']).toBe(1)

    // Check that we have counts for tags
    expect(response.data.facetCounts['tag_frontend']).toBe(2)
    expect(response.data.facetCounts['tag_web']).toBe(1)

    // Check that we have counts for benefits
    expect(response.data.facetCounts['benefits_Easy to use']).toBe(1)
    expect(response.data.facetCounts['benefits_Powerful']).toBe(1)
  })

  it('should return filtered faceted counts when search query is provided', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { q: 'test' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(3) // All resources match 'test' in title
  })

  it('should return filtered faceted counts when category filter is applied', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { category: 'Development' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(2) // Two development resources
    expect(response.data.facetCounts['category_Development']).toBe(2)
    expect(response.data.facetCounts['category_Design']).toBeUndefined() // Should not appear since we filtered by Development
  })

  it('should return filtered faceted counts when multiple filters are applied', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters
    event.context.params = {}
    event._query = { category: 'Development', pricing: 'Free' }

    const response = await handler.default(event)

    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.totalResults).toBe(2) // Two free development resources
    expect(response.data.facetCounts['category_Development']).toBe(2)
    expect(response.data.facetCounts['pricing_Free']).toBe(2)
    expect(response.data.facetCounts['pricing_Paid']).toBeUndefined() // Should not appear since we filtered by Free
  })

  it('should handle invalid tags parameter gracefully', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters with invalid tags
    event.context.params = {}
    event._query = { tags: 123 } // Invalid tags parameter

    const response = await handler.default(event)

    expect(response.success).toBe(false)
    expect(response.message).toContain('Invalid tags parameter')
  })

  it('should handle invalid search query parameter gracefully', async () => {
    const handler = await import('~/server/api/search/facets.get')
    const event = createEvent()
    // Mock query parameters with invalid search query
    event.context.params = {}
    event._query = { q: [] } // Invalid search query parameter

    const response = await handler.default(event)

    expect(response.success).toBe(false)
    expect(response.message).toContain('Invalid search query parameter')
  })
})
