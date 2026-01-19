import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed, readonly } from 'vue'
import { useResources } from '~/composables/useResources'
import { useResourceData } from '~/composables/useResourceData'

// Mock the dependent composables
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: vi.fn(() => ({
    resources: readonly(ref([])),
    loading: readonly(ref(false)),
    error: readonly(ref(null)),
    retryCount: readonly(ref(0)),
    maxRetries: 3,
    lastError: readonly(ref(null)),
    categories: computed(() => []),
    pricingModels: computed(() => []),
    difficultyLevels: computed(() => []),
    technologies: computed(() => []),
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
    expect(sortOption.value).toBe('popularity-desc')
  })

  it('should have empty allTags array initially', () => {
    const { allTags } = useResources()
    expect(allTags.value).toEqual([])
  })

  it('should handle resources with tags and extract unique tags', () => {
    // Create a new instance of composable after updating the mock
    const mockResources = ref([
      {
        id: '1',
        title: 'Resource 1',
        description: 'Test resource 1',
        url: 'https://example.com/1',
        benefits: ['Benefit 1'],
        category: 'Development',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag1', 'tag2'],
        technology: ['tech1'],
        dateAdded: '2023-01-01',
        popularity: 10,
      },
      {
        id: '2',
        title: 'Resource 2',
        description: 'Test resource 2',
        url: 'https://example.com/2',
        benefits: ['Benefit 2'],
        category: 'Development',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag2', 'tag3'],
        technology: ['tech1'],
        dateAdded: '2023-01-01',
        popularity: 8,
      },
      {
        id: '3',
        title: 'Resource 3',
        description: 'Test resource 3',
        url: 'https://example.com/3',
        benefits: ['Benefit 3'],
        category: 'Development',
        pricingModel: 'Free',
        difficulty: 'Beginner',
        tags: ['tag1', 'tag3', 'tag4'],
        technology: ['tech1'],
        dateAdded: '2023-01-01',
        popularity: 6,
      },
    ])

    // Update the mock to return these resources
    vi.mocked(useResourceData).mockReturnValue({
      resources: readonly(mockResources),
      loading: readonly(ref(false)),
      error: readonly(ref(null)),
      retryCount: readonly(ref(0)),
      maxRetries: 3,
      lastError: readonly(ref(null)),
      categories: computed(() => []),
      pricingModels: computed(() => []),
      difficultyLevels: computed(() => []),
      technologies: computed(() => []),
      retryResources: vi.fn(),
    })

    // Create new instance after mock update
    const { allTags } = useResources()

    // The allTags should contain unique tags in sorted order
    expect(allTags.value).toEqual(['tag1', 'tag2', 'tag3', 'tag4'])
  })
})
