import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useResources } from '~/composables/useResources'

// Mock the resources.json import
vi.mock('~/data/resources.json', () => ({
  default: [
    {
      id: '1',
      title: 'Test Resource',
      description: 'Test description',
      benefits: ['Free tier', 'Easy setup'],
      url: 'https://example.com',
      category: 'AI Tools',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['test', 'mock'],
      technology: ['Vue', 'Nuxt'],
      dateAdded: '2023-01-01',
      popularity: 100,
    },
    {
      id: '2',
      title: 'Another Resource',
      description: 'Another description',
      benefits: ['Open source', 'Community'],
      url: 'https://example2.com',
      category: 'Development',
      pricingModel: 'Freemium',
      difficulty: 'Intermediate',
      tags: ['dev', 'tool'],
      technology: ['React', 'TypeScript'],
      dateAdded: '2023-02-01',
      popularity: 80,
    },
  ],
}))

describe('useResources', () => {
  let resourcesComposable: ReturnType<typeof useResources>

  beforeEach(() => {
    // Reset the composable for each test
    resourcesComposable = useResources()
  })

  it('loads resources correctly', async () => {
    // Wait for the async initResources to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(resourcesComposable.resources.value).toHaveLength(2)
    expect(resourcesComposable.loading.value).toBe(false)
    expect(resourcesComposable.error.value).toBeNull()
  })

  it('returns correct categories', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const categories = resourcesComposable.categories.value
    expect(categories).toContain('AI Tools')
    expect(categories).toContain('Development')
  })

  it('returns correct pricing models', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const pricingModels = resourcesComposable.pricingModels.value
    expect(pricingModels).toContain('Free')
    expect(pricingModels).toContain('Freemium')
  })

  it('returns correct difficulty levels', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const difficultyLevels = resourcesComposable.difficultyLevels.value
    expect(difficultyLevels).toContain('Beginner')
    expect(difficultyLevels).toContain('Intermediate')
  })

  it('returns correct technologies', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const technologies = resourcesComposable.technologies.value
    expect(technologies).toContain('Vue')
    expect(technologies).toContain('Nuxt')
    expect(technologies).toContain('React')
    expect(technologies).toContain('TypeScript')
  })

  it('filters resources by category', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    resourcesComposable.toggleCategory('AI Tools')
    const filtered = resourcesComposable.filteredResources.value
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Test Resource')
  })

  it('filters resources by search query', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    resourcesComposable.updateSearchQuery('Another')
    const filtered = resourcesComposable.filteredResources.value
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Another Resource')
  })

  it('sorts resources alphabetically', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    resourcesComposable.setSortOption('alphabetical-asc')
    const sorted = resourcesComposable.filteredResources.value
    expect(sorted[0].title).toBe('Another Resource')
    expect(sorted[1].title).toBe('Test Resource')
  })

  it('sorts resources by popularity', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    resourcesComposable.setSortOption('popularity-desc')
    const sorted = resourcesComposable.filteredResources.value
    expect(sorted[0].title).toBe('Test Resource') // higher popularity (100)
    expect(sorted[1].title).toBe('Another Resource') // lower popularity (80)
  })

  it('resets filters correctly', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    resourcesComposable.toggleCategory('AI Tools')
    resourcesComposable.updateSearchQuery('Another')
    resourcesComposable.setSortOption('alphabetical-asc')

    resourcesComposable.resetFilters()

    expect(resourcesComposable.filterOptions.value.searchQuery).toBe('')
    expect(resourcesComposable.filterOptions.value.categories).toEqual([])
    expect(resourcesComposable.sortOption.value).toBe('popularity-desc')
  })

  it('highlights search terms correctly', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const highlighted = resourcesComposable.highlightSearchTerms(
      'This is a test',
      'test'
    )
    expect(highlighted).toContain('<mark')
    expect(highlighted).toContain('test')
  })

  it('sanitizes highlighted content to prevent XSS in highlightSearchTerms', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    // Test that XSS attempts are sanitized in search highlighting
    const highlighted = resourcesComposable.highlightSearchTerms(
      'This has <script>alert("xss")</script> malicious content',
      'script'
    )
    expect(highlighted).not.toContain('alert')
    expect(highlighted).not.toContain('<script')
    expect(highlighted).not.toContain('javascript:')
  })

  it('allows safe mark tags in highlighted content', async () => {
    await new Promise(resolve => setTimeout(resolve, 100))

    const highlighted = resourcesComposable.highlightSearchTerms(
      'This has a test keyword',
      'test'
    )
    expect(highlighted).toContain('<mark')
    expect(highlighted).toContain('test')
    expect(highlighted).toContain('class="bg-yellow-200')
  })

  it('provides retry functionality', async () => {
    // The retry functionality exists as a method on the composable
    expect(resourcesComposable.retryResources).toBeDefined()
    expect(typeof resourcesComposable.retryResources).toBe('function')
  })
})
