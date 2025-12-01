import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useResourceData } from '~/composables/useResourceData'

// Mock the Nuxt composables
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useAsyncData: vi.fn(() => ({
      data: {
        value: [
          {
            id: '1',
            title: 'Test Resource',
            description: 'This is a test resource',
            benefits: ['Benefit 1', 'Benefit 2'],
            url: 'https://example.com',
            category: 'Testing',
            tags: ['test', 'resource'],
            pricingModel: 'Free',
            difficulty: 'Beginner',
            lastUpdated: '2023-01-01',
          },
          {
            id: '2',
            title: 'Another Resource',
            description: 'This is another test resource',
            benefits: ['Benefit 3'],
            url: 'https://example2.com',
            category: 'Development',
            tags: ['dev', 'tool'],
            pricingModel: 'Paid',
            difficulty: 'Intermediate',
            lastUpdated: '2023-01-02',
          },
        ],
      },
      pending: false,
      error: null,
    })),
  }
})

// Mock the server API
vi.mock('~/server/api/resources.get', () => ({
  default: vi.fn(),
}))

describe('useResourceData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch resources successfully', async () => {
    const { resources, loading, error } = useResourceData()

    expect(resources.value).toBeDefined()
    expect(resources.value).toHaveLength(2)
    expect(resources.value![0].id).toBe('1')
    expect(resources.value![1].id).toBe('2')
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should have the correct resource structure', async () => {
    const { resources } = await useResourceData()

    const firstResource = resources.value![0]
    expect(firstResource).toHaveProperty('id')
    expect(firstResource).toHaveProperty('title')
    expect(firstResource).toHaveProperty('description')
    expect(firstResource).toHaveProperty('benefits')
    expect(firstResource).toHaveProperty('url')
    expect(firstResource).toHaveProperty('category')
    expect(firstResource).toHaveProperty('tags')
    expect(firstResource).toHaveProperty('pricingModel')
    expect(firstResource).toHaveProperty('difficulty')
    expect(firstResource).toHaveProperty('lastUpdated')
  })

  it('should handle empty resource list', async () => {
    // Mock empty response
    vi.mock('#app', async () => {
      const actual = await vi.importActual('#app')
      return {
        ...actual,
        useAsyncData: vi.fn(() => ({
          data: { value: [] },
          pending: false,
          error: null,
        })),
      }
    })

    const { resources } = await useResourceData()

    expect(resources.value).toBeDefined()
    expect(resources.value).toHaveLength(0)
  })

  it('should handle resource with all expected fields', async () => {
    const { resources } = await useResourceData()

    const resource = resources.value![0]
    expect(typeof resource.id).toBe('string')
    expect(typeof resource.title).toBe('string')
    expect(typeof resource.description).toBe('string')
    expect(Array.isArray(resource.benefits)).toBe(true)
    expect(typeof resource.url).toBe('string')
    expect(typeof resource.category).toBe('string')
    expect(Array.isArray(resource.tags)).toBe(true)
    expect(typeof resource.pricingModel).toBe('string')
    expect(typeof resource.difficulty).toBe('string')
    expect(typeof resource.lastUpdated).toBe('string')
  })

  it('should handle different pricing values', async () => {
    const { resources } = await useResourceData()

    const resourceWithFreePricing = resources.value!.find(r => r.id === '1')
    const resourceWithPaidPricing = resources.value!.find(r => r.id === '2')

    expect(resourceWithFreePricing?.pricingModel).toBe('Free')
    expect(resourceWithPaidPricing?.pricingModel).toBe('Paid')
  })

  it('should handle different difficulty levels', async () => {
    const { resources } = await useResourceData()

    const beginnerResource = resources.value![0]
    const intermediateResource = resources.value![1]

    expect(beginnerResource.difficulty).toBe('Beginner')
    expect(intermediateResource.difficulty).toBe('Intermediate')
  })
})
