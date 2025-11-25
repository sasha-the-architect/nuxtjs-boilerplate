/**
 * Resource test data factory
 * Provides consistent test data for resource-related tests
 */

export interface Resource {
  id: string
  title: string
  description: string
  benefits: string[]
  url: string
  category: string
  tags?: string[]
  lastUpdated?: string
}

export const createTestResource = (
  overrides: Partial<Resource> = {}
): Resource => {
  return {
    id: overrides.id || `test-resource-${Date.now()}`,
    title: overrides.title || 'Test Resource',
    description: overrides.description || 'Test resource description',
    benefits: overrides.benefits || ['Benefit 1', 'Benefit 2'],
    url: overrides.url || 'https://example.com',
    category: overrides.category || 'Test Category',
    tags: overrides.tags || [],
    lastUpdated: overrides.lastUpdated || new Date().toISOString(),
    ...overrides,
  }
}
