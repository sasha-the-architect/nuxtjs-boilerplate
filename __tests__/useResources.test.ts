import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useResources } from '~/composables/useResources'
import { useResourceData } from '~/composables/useResourceData'
import { useResourceFilters } from '~/composables/useResourceFilters'
import { useResourceSearch } from '~/composables/useResourceSearch'
import { useResourceSort } from '~/composables/useResourceSort'
import { useSearchHistory } from '~/composables/useSearchHistory'
import { useResourceSearchFilter } from '~/composables/useResourceSearchFilter'
import type { Resource } from '~/types/resource'

// Mock the dependent composables
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: vi.fn(() => ({
    resources: ref([]),
    loading: ref(false),
    error: ref(null),
    retryCount: ref(0),
    maxRetries: ref(3),
    lastError: ref(null),
    categories: ref([]),
    pricingModels: ref([]),
    difficultyLevels: ref([]),
    technologies: ref([]),
    retryResources: vi.fn(),
  })),
}))

vi.mock('~/composables/useResourceFilters', () => ({
  useResourceFilters: vi.fn(() => ({
    filterOptions: ref({
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
      tags: [],
    }),
    sortOption: ref('relevance'),
    updateSearchQuery: vi.fn(),
    toggleCategory: vi.fn(),
    togglePricingModel: vi.fn(),
    toggleDifficultyLevel: vi.fn(),
    toggleTechnology: vi.fn(),
    toggleTag: vi.fn(),
    setSortOption: vi.fn(),
    resetFilters: vi.fn(),
  })),
}))

vi.mock('~/composables/useResourceSearch', () => ({
  useResourceSearch: vi.fn(() => ({
    fuse: ref(null),
    searchResources: vi.fn(),
    getSuggestions: vi.fn(),
    highlightSearchTerms: vi.fn(),
  })),
}))

vi.mock('~/composables/useResourceSort', () => ({
  useResourceSort: vi.fn(() => ({
    sortedResources: ref([]),
  })),
}))

vi.mock('~/composables/useSearchHistory', () => ({
  useSearchHistory: vi.fn(() => ({
    getSearchHistory: vi.fn(),
    addSearchToHistory: vi.fn(),
    clearSearchHistory: vi.fn(),
  })),
}))

vi.mock('~/composables/useResourceSearchFilter', () => ({
  useResourceSearchFilter: vi.fn(() => ({
    finalResources: ref([]),
  })),
}))

describe('useResources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all expected properties', () => {
    const resources = useResources()

    expect(resources).toHaveProperty('resources')
    expect(resources).toHaveProperty('filteredResources')
    expect(resources).toHaveProperty('loading')
    expect(resources).toHaveProperty('error')
    expect(resources).toHaveProperty('retryCount')
    expect(resources).toHaveProperty('maxRetries')
    expect(resources).toHaveProperty('lastError')
    expect(resources).toHaveProperty('categories')
    expect(resources).toHaveProperty('pricingModels')
    expect(resources).toHaveProperty('difficultyLevels')
    expect(resources).toHaveProperty('technologies')
    expect(resources).toHaveProperty('allTags')
    expect(resources).toHaveProperty('filterOptions')
    expect(resources).toHaveProperty('sortOption')
    expect(resources).toHaveProperty('updateSearchQuery')
    expect(resources).toHaveProperty('toggleCategory')
    expect(resources).toHaveProperty('togglePricingModel')
    expect(resources).toHaveProperty('toggleDifficultyLevel')
    expect(resources).toHaveProperty('toggleTechnology')
    expect(resources).toHaveProperty('toggleTag')
    expect(resources).toHaveProperty('setSortOption')
    expect(resources).toHaveProperty('resetFilters')
    expect(resources).toHaveProperty('highlightSearchTerms')
    expect(resources).toHaveProperty('retryResources')
    expect(resources).toHaveProperty('getSuggestions')
    expect(resources).toHaveProperty('getSearchHistory')
    expect(resources).toHaveProperty('addSearchToHistory')
    expect(resources).toHaveProperty('clearSearchHistory')
  })

  it('should initialize with empty resource array', () => {
    const { resources } = useResources()
    expect(resources.value).toEqual([])
  })

  it('should initialize with loading state as false', () => {
    const { loading } = useResources()
    expect(loading.value).toBe(false)
  })

  it('should have empty filter options initially', () => {
    const { filterOptions } = useResources()
    expect(filterOptions.value.searchQuery).toBe('')
    expect(filterOptions.value.categories).toEqual([])
    expect(filterOptions.value.pricingModels).toEqual([])
    expect(filterOptions.value.difficultyLevels).toEqual([])
    expect(filterOptions.value.technologies).toEqual([])
    expect(filterOptions.value.tags).toEqual([])
  })

  it('should have default sort option', () => {
    const { sortOption } = useResources()
    expect(sortOption.value).toBe('relevance')
  })

  it('should have empty allTags array initially', () => {
    const { allTags } = useResources()
    expect(allTags.value).toEqual([])
  })

  it('should handle resources with tags and extract unique tags', () => {
    // Create a new instance of the composable after updating the mock
    const mockResources = ref([
      { id: '1', name: 'Resource 1', tags: ['tag1', 'tag2'] } as Resource,
      { id: '2', name: 'Resource 2', tags: ['tag2', 'tag3'] } as Resource,
      {
        id: '3',
        name: 'Resource 3',
        tags: ['tag1', 'tag3', 'tag4'],
      } as Resource,
    ])

    // Update the mock to return these resources
    vi.mocked(useResourceData).mockReturnValue({
      resources: mockResources,
      loading: ref(false),
      error: ref(null),
      retryCount: ref(0),
      maxRetries: ref(3),
      lastError: ref(null),
      categories: ref([]),
      pricingModels: ref([]),
      difficultyLevels: ref([]),
      technologies: ref([]),
      retryResources: vi.fn(),
    })

    // Create new instance after mock update
    const { allTags } = useResources()

    // The allTags should contain unique tags in sorted order
    expect(allTags.value).toEqual(['tag1', 'tag2', 'tag3', 'tag4'])
  })
})
