import { describe, it, expect, vi } from 'vitest'
import { useSearchPage } from '~/composables/useSearchPage'

vi.mock('~/utils/analytics', () => ({
  trackSearch: vi.fn(),
  trackFilter: vi.fn(),
}))

describe('useSearchPage', () => {
  describe('initialization', () => {
    it('should provide filter options state', () => {
      const searchPage = useSearchPage()
      expect(searchPage.filterOptions).toBeDefined()
      expect(searchPage.filterOptions.value.searchQuery).toBe('')
      expect(searchPage.filterOptions.value.dateRange).toBe('anytime')
    })

    it('should provide sort option state', () => {
      const searchPage = useSearchPage()
      expect(searchPage.sortOption).toBeDefined()
      expect(searchPage.sortOption.value).toBe('relevance')
    })

    it('should provide filtered resources computed', () => {
      const searchPage = useSearchPage()
      expect(searchPage.filteredResources).toBeDefined()
      expect(Array.isArray(searchPage.filteredResources.value)).toBe(true)
    })

    it('should provide facet counts computed', () => {
      const searchPage = useSearchPage()
      expect(searchPage.facetCounts).toBeDefined()
      expect(typeof searchPage.facetCounts.value).toBe('object')
    })

    it('should provide toggle methods', () => {
      const searchPage = useSearchPage()
      expect(typeof searchPage.toggleCategory).toBe('function')
      expect(typeof searchPage.togglePricingModel).toBe('function')
      expect(typeof searchPage.toggleDifficultyLevel).toBe('function')
      expect(typeof searchPage.toggleTag).toBe('function')
    })

    it('should provide update methods', () => {
      const searchPage = useSearchPage()
      expect(typeof searchPage.updateSearchQuery).toBe('function')
      expect(typeof searchPage.setSortOption).toBe('function')
      expect(typeof searchPage.setDateRange).toBe('function')
    })

    it('should provide reset method', () => {
      const searchPage = useSearchPage()
      expect(typeof searchPage.resetFilters).toBe('function')
    })

    it('should provide search handler', () => {
      const searchPage = useSearchPage()
      expect(typeof searchPage.handleSearch).toBe('function')
    })
  })

  describe('filter options', () => {
    it('should have default filter options', () => {
      const searchPage = useSearchPage()
      const filters = searchPage.filterOptions.value
      expect(filters.searchQuery).toBe('')
      expect(filters.categories).toEqual([])
      expect(filters.pricingModels).toEqual([])
      expect(filters.difficultyLevels).toEqual([])
      expect(filters.technologies).toEqual([])
      expect(filters.tags).toEqual([])
      expect(filters.benefits).toEqual([])
      expect(filters.dateRange).toBe('anytime')
    })

    it('should update search query', () => {
      const searchPage = useSearchPage()
      searchPage.updateSearchQuery('vue framework')
      expect(searchPage.filterOptions.value.searchQuery).toBe('vue framework')
    })

    it('should toggle category', () => {
      const searchPage = useSearchPage()
      searchPage.toggleCategory('Framework')
      expect(searchPage.filterOptions.value.categories).toContain('Framework')

      searchPage.toggleCategory('Framework')
      expect(searchPage.filterOptions.value.categories).not.toContain(
        'Framework'
      )
    })

    it('should set sort option', () => {
      const searchPage = useSearchPage()
      searchPage.setSortOption('alphabetical-asc')
      expect(searchPage.sortOption.value).toBe('alphabetical-asc')
    })

    it('should reset all filters', () => {
      const searchPage = useSearchPage()
      searchPage.toggleCategory('Framework')
      searchPage.toggleTag('vue')
      searchPage.updateSearchQuery('test query')

      searchPage.resetFilters()

      expect(searchPage.filterOptions.value.searchQuery).toBe('')
      expect(searchPage.filterOptions.value.categories).toEqual([])
      expect(searchPage.filterOptions.value.tags).toEqual([])
      expect(searchPage.filterOptions.value.dateRange).toBe('anytime')
      expect(searchPage.sortOption.value).toBe('relevance')
    })
  })

  describe('search functionality', () => {
    it('should update search query via handleSearch', () => {
      const searchPage = useSearchPage()
      searchPage.handleSearch('vue framework')
      expect(searchPage.filterOptions.value.searchQuery).toBe('vue framework')
    })
  })

  describe('edge cases', () => {
    it('should handle empty search query', () => {
      const searchPage = useSearchPage()
      searchPage.updateSearchQuery('')
      expect(searchPage.filterOptions.value.searchQuery).toBe('')
    })

    it('should handle multiple category selections', () => {
      const searchPage = useSearchPage()
      searchPage.toggleCategory('Framework')
      searchPage.toggleCategory('Testing')
      expect(searchPage.filterOptions.value.categories?.length ?? 0).toBe(2)
    })

    it('should handle switching sort options', () => {
      const searchPage = useSearchPage()
      searchPage.setSortOption('alphabetical-asc')
      expect(searchPage.sortOption.value).toBe('alphabetical-asc')

      searchPage.setSortOption('popularity-desc')
      expect(searchPage.sortOption.value).toBe('popularity-desc')

      searchPage.setSortOption('relevance')
      expect(searchPage.sortOption.value).toBe('relevance')
    })
  })
})
