import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useResourceData } from '~/composables/useResourceData'

describe('useResourceData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch resources successfully', async () => {
    const { resources, loading, error } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(resources.value).toBeDefined()
    expect(resources.value!.length).toBeGreaterThan(0)
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should have correct resource structure', async () => {
    const { resources } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(resources.value).toBeDefined()
    expect(resources.value!.length).toBeGreaterThan(0)

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
  })

  it('should handle different pricing values', async () => {
    const { resources } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    const pricingModels = resources.value!.map(r => r.pricingModel)
    expect(pricingModels).toContain('Free Tier')
    expect(pricingModels).toContain('Free')
  })

  it('should handle different difficulty levels', async () => {
    const { resources } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(resources.value).toBeDefined()
    expect(resources.value!.length).toBeGreaterThan(0)

    const difficulties = resources.value!.map(r => r.difficulty)
    expect(difficulties).toContain('Beginner')
    expect(difficulties).toContain('Intermediate')
  })

  it('should expose computed filter values', async () => {
    const {
      resources,
      categories,
      pricingModels,
      difficultyLevels,
      technologies,
    } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(resources.value).toBeDefined()
    expect(categories.value).toBeDefined()
    expect(pricingModels.value).toBeDefined()
    expect(difficultyLevels.value).toBeDefined()
    expect(technologies.value).toBeDefined()

    expect(categories.value.length).toBeGreaterThan(0)
    expect(pricingModels.value.length).toBeGreaterThan(0)
    expect(difficultyLevels.value.length).toBeGreaterThan(0)
  })

  it('should provide retry functionality', async () => {
    const { resources, retryResources, loading, error } = useResourceData()

    await new Promise(resolve => setTimeout(resolve, 100))

    const initialResources = [...resources.value!]

    retryResources()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(resources.value).toEqual(initialResources)
  })
})
