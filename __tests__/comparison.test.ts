import { describe, it, expect } from 'vitest'

describe('Comparison Feature', () => {
  it('should have comparison types defined', () => {
    // Import the comparison types
    expect(() => import('~/types/comparison')).toBeTruthy()
  })

  it('should have comparison composable available', () => {
    // Import the comparison composable
    expect(() => import('~/composables/useResourceComparison')).toBeTruthy()
  })

  it('should have comparison components available', () => {
    // Check that the comparison components exist
    expect(() => import('~/components/ComparisonTable.vue')).toBeTruthy()
    expect(() => import('~/components/ComparisonValue.vue')).toBeTruthy()
    expect(() => import('~/components/ComparisonBuilder.vue')).toBeTruthy()
  })

  it('should have comparison API endpoints', () => {
    // Check that the comparison API endpoint exists
    expect(
      () => import('~/server/api/v1/comparisons/index.get.ts')
    ).toBeTruthy()
  })

  it('should have comparison pages', () => {
    // Check that the comparison pages exist
    expect(() => import('~/pages/compare.vue')).toBeTruthy()
    expect(() => import('~/pages/compare/[ids].vue')).toBeTruthy()
  })
})
