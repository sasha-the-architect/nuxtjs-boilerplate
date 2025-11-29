import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useResourceComparison } from '~/composables/useResourceComparison'
import type { Resource } from '~/types/resource'

describe('useResourceComparison', () => {
  let resources: Resource[]

  beforeEach(() => {
    resources = [
      {
        id: '1',
        title: 'Resource 1',
        description: 'Description 1',
        benefits: ['Benefit 1'],
        url: 'https://example.com/1',
        category: 'Category 1',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag1'],
        technology: ['tech1'],
        dateAdded: '2023-01-01',
        popularity: 10,
      },
      {
        id: '2',
        title: 'Resource 2',
        description: 'Description 2',
        benefits: ['Benefit 2'],
        url: 'https://example.com/2',
        category: 'Category 2',
        pricingModel: 'Paid',
        difficulty: 'Intermediate',
        tags: ['tag2'],
        technology: ['tech2'],
        dateAdded: '2023-01-02',
        popularity: 20,
      },
      {
        id: '3',
        title: 'Resource 3',
        description: 'Description 3',
        benefits: ['Benefit 3'],
        url: 'https://example.com/3',
        category: 'Category 3',
        pricingModel: 'Freemium',
        difficulty: 'Advanced',
        tags: ['tag3'],
        technology: ['tech3'],
        dateAdded: '2023-01-03',
        popularity: 30,
      },
    ]
  })

  it('should initialize with empty selected resources', () => {
    const { selectedResources } = useResourceComparison()
    expect(selectedResources.value).toEqual([])
  })

  it('should add a resource to comparison', () => {
    const { selectedResources, addResource } = useResourceComparison()

    const success = addResource(resources[0])

    expect(success).toBe(true)
    expect(selectedResources.value).toHaveLength(1)
    expect(selectedResources.value[0]).toEqual(resources[0])
  })

  it('should not add the same resource twice', () => {
    const { selectedResources, addResource } = useResourceComparison()

    // Add the same resource twice
    const success1 = addResource(resources[0])
    const success2 = addResource(resources[0])

    expect(success1).toBe(true)
    expect(success2).toBe(false)
    expect(selectedResources.value).toHaveLength(1)
  })

  it('should respect the max resource limit', () => {
    const { selectedResources, addResource, config } = useResourceComparison()

    // Add resources up to the max limit
    for (let i = 0; i < config.value.maxResources; i++) {
      const success = addResource({
        ...resources[0],
        id: `resource-${i}`,
      })
      expect(success).toBe(true)
    }

    // Try to add another resource beyond the limit
    const success = addResource({
      ...resources[0],
      id: 'resource-beyond-limit',
    })

    expect(success).toBe(false)
    expect(selectedResources.value).toHaveLength(config.value.maxResources)
  })

  it('should remove a resource from comparison', () => {
    const { selectedResources, addResource, removeResource } =
      useResourceComparison()

    // Add two resources
    addResource(resources[0])
    addResource(resources[1])

    expect(selectedResources.value).toHaveLength(2)

    // Remove one resource
    removeResource(resources[0].id)

    expect(selectedResources.value).toHaveLength(1)
    expect(selectedResources.value[0].id).toBe(resources[1].id)
  })

  it('should clear all selected resources', () => {
    const { selectedResources, addResource, clearComparison } =
      useResourceComparison()

    // Add some resources
    addResource(resources[0])
    addResource(resources[1])

    expect(selectedResources.value).toHaveLength(2)

    // Clear all resources
    clearComparison()

    expect(selectedResources.value).toEqual([])
  })

  it('should check if a resource is in comparison', () => {
    const { addResource, isInComparison } = useResourceComparison()

    addResource(resources[0])

    expect(isInComparison(resources[0].id)).toBe(true)
    expect(isInComparison(resources[1].id)).toBe(false)
  })

  it('should return comparison data with resources and criteria', () => {
    const { addResource, getComparisonData } = useResourceComparison()

    addResource(resources[0])
    addResource(resources[1])

    const data = getComparisonData()

    expect(data.resources).toHaveLength(2)
    expect(data.criteria).toBeDefined()
    expect(data.comparisonId).toBeDefined()
  })

  it('should update configuration', () => {
    const { config, updateConfig } = useResourceComparison()

    const newConfig = {
      maxResources: 10,
      similarityThreshold: 0.5,
    }

    updateConfig(newConfig)

    expect(config.value.maxResources).toBe(10)
    expect(config.value.similarityThreshold).toBe(0.5)
  })

  it('should compute isComparisonReady correctly', () => {
    const { addResource, isComparisonReady } = useResourceComparison()

    expect(isComparisonReady.value).toBe(false)

    addResource(resources[0])
    expect(isComparisonReady.value).toBe(false)

    addResource(resources[1])
    expect(isComparisonReady.value).toBe(true)
  })

  it('should compute canAddMoreResources correctly', () => {
    const { addResource, canAddMoreResources, config } = useResourceComparison()

    // Initially should be able to add more
    expect(canAddMoreResources.value).toBe(true)

    // Add resources up to the limit
    for (let i = 0; i < config.value.maxResources; i++) {
      addResource({
        ...resources[0],
        id: `resource-${i}`,
      })
    }

    expect(canAddMoreResources.value).toBe(false)
  })

  it('should compute comparisonCount correctly', () => {
    const { addResource, comparisonCount } = useResourceComparison()

    expect(comparisonCount.value).toBe(0)

    addResource(resources[0])
    expect(comparisonCount.value).toBe(1)

    addResource(resources[1])
    expect(comparisonCount.value).toBe(2)
  })
})
