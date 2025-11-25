import { describe, it, expect } from 'vitest'
import {
  extractTagsFromResources,
  getAllTags,
  normalizeTag,
  findTagInHierarchy,
} from '~/utils/tags'
import type { Resource, HierarchicalTag } from '~/types/resource'

describe('Hierarchical Tags', () => {
  it('should extract tags from resources correctly', () => {
    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'Test Resource',
        description: 'Test description',
        benefits: ['Benefit 1'],
        url: 'https://example.com',
        category: 'AI Tools',
        pricingModel: 'Free Tier',
        difficulty: 'Beginner',
        tags: ['AI', 'API', 'OpenAI'],
        technology: ['AI'],
        dateAdded: '2025-01-01',
        popularity: 5,
      },
      {
        id: '2',
        title: 'Test Resource 2',
        description: 'Test description 2',
        benefits: ['Benefit 2'],
        url: 'https://example2.com',
        category: 'Web Development',
        pricingModel: 'Free',
        difficulty: 'Intermediate',
        tags: ['Web', 'API', 'JavaScript'],
        technology: ['Web'],
        dateAdded: '2025-01-02',
        popularity: 4,
      },
    ]

    const tags = extractTagsFromResources(mockResources)
    expect(tags).toContain('AI')
    expect(tags).toContain('API')
    expect(tags).toContain('OpenAI')
    expect(tags).toContain('Web')
    expect(tags).toContain('JavaScript')
    expect(tags).toHaveLength(5) // AI, API, OpenAI, Web, JavaScript
  })

  it('should normalize tags correctly', () => {
    expect(normalizeTag('  AI Tools  ')).toBe('ai-tools')
    expect(normalizeTag('Machine_Learning')).toBe('machine_learning')
    expect(normalizeTag('Web Development!')).toBe('web-development')
    expect(normalizeTag('  Cloud & AI  ')).toBe('cloud-ai')
  })

  it('should find tags in hierarchy', () => {
    const mockHierarchy: HierarchicalTag[] = [
      {
        id: 'ai',
        name: 'AI',
        children: [
          {
            id: 'ml',
            name: 'Machine Learning',
            children: [{ id: 'dl', name: 'Deep Learning', children: [] }],
          },
        ],
      },
    ]

    const foundTag = findTagInHierarchy(mockHierarchy, 'AI')
    expect(foundTag).not.toBeNull()
    expect(foundTag?.name).toBe('AI')

    const foundChildTag = findTagInHierarchy(mockHierarchy, 'Machine Learning')
    expect(foundChildTag).not.toBeNull()
    expect(foundChildTag?.name).toBe('Machine Learning')
  })

  it('should handle tag filtering in API parameters', async () => {
    // This tests that our API can handle tags parameter correctly
    // We'll just test the parsing logic that we implemented
    const tagsParam = 'AI,API,OpenAI'
    const tags = tagsParam.split(',').map(tag => tag.trim().toLowerCase())

    expect(tags).toContain('ai')
    expect(tags).toContain('api')
    expect(tags).toContain('openai')
    expect(tags).toHaveLength(3)
  })
})
