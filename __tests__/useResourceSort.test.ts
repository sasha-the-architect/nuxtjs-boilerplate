import { describe, it, expect } from 'vitest'
import { useResourceSort } from '~/composables/useResourceSort'
import type { Resource } from '~/types/resource'
import { ref, computed } from 'vue'

describe('useResourceSort', () => {
  const mockResources: readonly Resource[] = [
    {
      id: '3',
      title: 'Resource C',
      description: 'Third resource',
      benefits: ['Benefit 3'],
      url: 'https://example3.com',
      category: 'Testing',
      tags: ['tag3'],
      pricingModel: 'Free',
      difficulty: 'Advanced',
      technology: ['Vue.js'],
      dateAdded: '2023-03-01',
      popularity: 5,
    },
    {
      id: '1',
      title: 'Resource A',
      description: 'First resource',
      benefits: ['Benefit 1'],
      url: 'https://example1.com',
      category: 'Development',
      tags: ['tag1'],
      pricingModel: 'Paid',
      difficulty: 'Beginner',
      technology: ['React'],
      dateAdded: '2023-01-01',
      popularity: 10,
    },
    {
      id: '2',
      title: 'Resource B',
      description: 'Second resource',
      benefits: ['Benefit 2'],
      url: 'https://example2.com',
      category: 'Testing',
      tags: ['tag2'],
      pricingModel: 'Free',
      difficulty: 'Intermediate',
      technology: ['Angular'],
      dateAdded: '2023-02-01',
      popularity: 8,
    },
  ]

  it('should sort by alphabetical ascending order', () => {
    const resourcesRef = ref([...mockResources])
    const sortOptionRef = ref<
      | 'alphabetical-asc'
      | 'alphabetical-desc'
      | 'popularity-desc'
      | 'date-added-desc'
    >('alphabetical-asc')
    const sortComposable = useResourceSort(
      computed(() => resourcesRef.value),
      computed(() => sortOptionRef.value)
    )

    const sorted = sortComposable.sortedResources.value
    expect(sorted[0].title).toBe('Resource A')
    expect(sorted[1].title).toBe('Resource B')
    expect(sorted[2].title).toBe('Resource C')
  })

  it('should sort by alphabetical descending order', () => {
    const resourcesRef = ref([...mockResources])
    const sortOptionRef = ref<
      | 'alphabetical-asc'
      | 'alphabetical-desc'
      | 'popularity-desc'
      | 'date-added-desc'
    >('alphabetical-desc')
    const sortComposable = useResourceSort(
      computed(() => resourcesRef.value),
      computed(() => sortOptionRef.value)
    )

    const sorted = sortComposable.sortedResources.value
    expect(sorted[0].title).toBe('Resource C')
    expect(sorted[1].title).toBe('Resource B')
    expect(sorted[2].title).toBe('Resource A')
  })

  it('should sort by popularity descending order', () => {
    const resourcesRef = ref([...mockResources])
    const sortOptionRef = ref<
      | 'alphabetical-asc'
      | 'alphabetical-desc'
      | 'popularity-desc'
      | 'date-added-desc'
    >('popularity-desc')
    const sortComposable = useResourceSort(
      computed(() => resourcesRef.value),
      computed(() => sortOptionRef.value)
    )

    const sorted = sortComposable.sortedResources.value
    // Resource A has popularity: 10, Resource B: 8, Resource C: 5
    expect(sorted[0].title).toBe('Resource A')
    expect(sorted[1].title).toBe('Resource B')
    expect(sorted[2].title).toBe('Resource C')
  })

  it('should sort by date added descending order', () => {
    const resourcesRef = ref([...mockResources])
    const sortOptionRef = ref<
      | 'alphabetical-asc'
      | 'alphabetical-desc'
      | 'popularity-desc'
      | 'date-added-desc'
    >('date-added-desc')
    const sortComposable = useResourceSort(
      computed(() => resourcesRef.value),
      computed(() => sortOptionRef.value)
    )

    const sorted = sortComposable.sortedResources.value
    // Resource C was added on 2023-03-01, Resource B: 2023-02-01, Resource A: 2023-01-01
    expect(sorted[0].title).toBe('Resource C')
    expect(sorted[1].title).toBe('Resource B')
    expect(sorted[2].title).toBe('Resource A')
  })

  it('should return empty array when no resources provided', () => {
    const resourcesRef = ref<Resource[]>([])
    const sortOptionRef = ref<
      | 'alphabetical-asc'
      | 'alphabetical-desc'
      | 'popularity-desc'
      | 'date-added-desc'
    >('alphabetical-asc')
    const sortComposable = useResourceSort(
      computed(() => resourcesRef.value),
      computed(() => sortOptionRef.value)
    )

    const sorted = sortComposable.sortedResources.value
    expect(sorted).toEqual([])
  })
})
