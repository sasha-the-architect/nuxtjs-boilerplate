import { describe, it, expect } from 'vitest'
import { createTestResource } from '../tests/factories/resource'

describe('Utils and Factories', () => {
  it('should create a test resource with default values', () => {
    const resource = createTestResource()

    expect(resource.id).toBeDefined()
    expect(resource.title).toBe('Test Resource')
    expect(resource.description).toBe('Test resource description')
    expect(resource.benefits).toEqual(['Benefit 1', 'Benefit 2'])
    expect(resource.url).toBe('https://example.com')
    expect(resource.category).toBe('Test Category')
    expect(Array.isArray(resource.benefits)).toBe(true)
    expect(typeof resource.id).toBe('string')
  })

  it('should allow overrides for test resource', () => {
    const customResource = createTestResource({
      title: 'Custom Title',
      url: 'https://custom.com',
      category: 'Custom Category',
    })

    expect(customResource.title).toBe('Custom Title')
    expect(customResource.url).toBe('https://custom.com')
    expect(customResource.category).toBe('Custom Category')
  })
})
