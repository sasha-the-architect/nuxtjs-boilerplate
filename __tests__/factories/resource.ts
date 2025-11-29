import type { Resource } from '~/types/resource'

// Default resource template
const defaultResource: Resource = {
  id: 'test-resource-1',
  title: 'Test Resource',
  description: 'Test Description',
  benefits: ['Test Benefit'],
  url: 'https://example.com',
  category: 'Test Category',
  pricingModel: 'Free',
  difficulty: 'Beginner',
  tags: ['test', 'example'],
  technology: ['Test Tech'],
  dateAdded: '2023-01-01',
  popularity: 50,
}

/**
 * Creates a resource object with default values that can be overridden
 * @param overrides - Properties to override in the default resource
 * @returns A resource object with default values merged with overrides
 */
export const createResource = (overrides: Partial<Resource> = {}): Resource => {
  return {
    ...defaultResource,
    id:
      overrides.id ||
      `test-resource-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...overrides,
  }
}

/**
 * Creates multiple resource objects with default values
 * @param count - Number of resources to create
 * @param overrides - Properties to override in the default resource
 * @returns An array of resource objects
 */
export const createResources = (
  count: number,
  overrides: Partial<Resource> = {}
): Resource[] => {
  return Array.from({ length: count }, (_, index) =>
    createResource({
      ...overrides,
      id: overrides.id ? `${overrides.id}-${index}` : undefined,
    })
  )
}
