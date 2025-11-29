import { describe, it, expect, beforeEach } from 'vitest'
import { useResourceSearch } from '~/composables/useResourceSearch'
import type { Resource } from '~/types/resource'

describe('useResourceSearch', () => {
  const mockResources: readonly Resource[] = [
    {
      id: '1',
      title: 'Test Resource',
      description: 'This is a test resource',
      benefits: ['Benefit 1', 'Benefit 2'],
      url: 'https://example.com',
      category: 'Testing',
      tags: ['test', 'resource'],
      pricing: 'Free',
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
      pricing: 'Free',
      difficulty: 'Intermediate',
      lastUpdated: '2023-01-02',
    },
  ]

  let searchComposable: ReturnType<typeof useResourceSearch>

  beforeEach(() => {
    searchComposable = useResourceSearch(mockResources)
  })

  describe('searchResources', () => {
    it('should return all resources when query is empty', () => {
      const results = searchComposable.searchResources('')
      expect(results).toHaveLength(2)
      expect(results).toEqual(mockResources)
    })

    it('should return resources matching the search query', () => {
      const results = searchComposable.searchResources('Test Resource')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Test Resource')
    })

    it('should return resources matching description', () => {
      const results = searchComposable.searchResources('another')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Another Resource')
    })

    it('should return resources matching benefits', () => {
      const results = searchComposable.searchResources('Benefit 3')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Another Resource')
    })

    it('should return resources matching tags', () => {
      const results = searchComposable.searchResources('dev')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Another Resource')
    })
  })

  describe('getSuggestions', () => {
    it('should return suggestions based on search query', () => {
      const results = searchComposable.getSuggestions('Test Resource', 5)
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Test Resource')
    })

    it('should limit results to specified limit', () => {
      const results = searchComposable.getSuggestions('resource', 1)
      expect(results).toHaveLength(1)
    })

    it('should return empty array for empty query', () => {
      const results = searchComposable.getSuggestions('')
      expect(results).toHaveLength(0)
    })
  })

  describe('highlightSearchTerms', () => {
    it('should highlight search terms in text', () => {
      const highlighted = searchComposable.highlightSearchTerms(
        'This is a test text',
        'test'
      )
      expect(highlighted).toContain(
        '<mark class="bg-yellow-200 text-gray-900">test</mark>'
      )
    })

    it('should return original text if no query provided', () => {
      const highlighted = searchComposable.highlightSearchTerms(
        'This is a test text',
        ''
      )
      expect(highlighted).toBe('This is a test text')
    })

    it('should handle XSS attempts safely', () => {
      const highlighted = searchComposable.highlightSearchTerms(
        'Normal text',
        '<script>alert("XSS")</script>'
      )
      expect(highlighted).toBe('Normal text')
      expect(highlighted).not.toContain('script')
      expect(highlighted).not.toContain('alert')
    })
  })
})
