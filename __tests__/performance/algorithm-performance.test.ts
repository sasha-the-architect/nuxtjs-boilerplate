import { describe, expect, it } from 'vitest'
import {
  calculateSimilarity,
  calculateInterestMatch,
  calculateCollaborativeScore,
} from '~/utils/recommendation-algorithms'
import type { Resource } from '~/types/resource'
import type { UserPreferences } from '~/utils/recommendation-algorithms'

// Create mock resource
const createMockResource = (
  id: string,
  category: string,
  tags: string[],
  technology: string[]
): Resource => {
  return {
    id,
    title: `Resource ${id}`,
    description: `Description for ${id}`,
    category,
    url: `https://example.com/${id}`,
    pricingModel: 'free',
    difficulty: 'beginner',
    popularity: 5,
    tags,
    technology,
    benefits: [],
    lastUpdated: new Date(Date.now()).toISOString(),
    dateAdded: new Date(Date.now()).toISOString(),
    alternatives: [],
  }
}

describe('Algorithm Optimization: calculateSimilarity', () => {
  it('should handle small tags/technology arrays efficiently', () => {
    const resourceA = createMockResource(
      'a',
      'AI Tools',
      ['tag1', 'tag2', 'tag3'],
      ['tech1', 'tech2']
    )
    const resourceB = createMockResource(
      'b',
      'AI Tools',
      ['tag1', 'tag4', 'tag5'],
      ['tech1', 'tech3']
    )

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateSimilarity(resourceA, resourceB)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(10) // Should complete 1000 iterations in < 10ms

    console.log(
      `calculateSimilarity (1000 iterations, small arrays): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should handle large tags/technology arrays efficiently', () => {
    const resourceA = createMockResource(
      'a',
      'AI Tools',
      Array.from({ length: 20 }, (_, i) => `tag${i}`),
      Array.from({ length: 10 }, (_, i) => `tech${i}`)
    )
    const resourceB = createMockResource(
      'b',
      'Web Hosting',
      Array.from({ length: 20 }, (_, i) => `tag${i + 10}`),
      Array.from({ length: 10 }, (_, i) => `tech${i + 5}`)
    )

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateSimilarity(resourceA, resourceB)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(50) // Should complete 1000 iterations in < 50ms

    console.log(
      `calculateSimilarity (1000 iterations, large arrays): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should scale linearly with tag/technology size', () => {
    const sizes = [5, 10, 15, 20, 30]
    const times: number[] = []

    for (const size of sizes) {
      const resourceA = createMockResource(
        'a',
        'AI Tools',
        Array.from({ length: size }, (_, i) => `tag${i}`),
        Array.from({ length: Math.floor(size / 2) }, (_, i) => `tech${i}`)
      )
      const resourceB = createMockResource(
        'b',
        'AI Tools',
        Array.from({ length: size }, (_, i) => `tag${i + size}`),
        Array.from(
          { length: Math.floor(size / 2) },
          (_, i) => `tech${i + Math.floor(size / 2)}`
        )
      )

      const iterations = 100
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        calculateSimilarity(resourceA, resourceB)
      }

      const endTime = performance.now()
      times.push(endTime - startTime)
    }

    console.log('Scaling performance (calculateSimilarity):')
    sizes.forEach((size, i) => {
      console.log(`  ${size} tags: ${times[i].toFixed(4)}ms`)
    })

    expect(times[4] / times[0]).toBeLessThan(10)
  })
})

describe('Algorithm Optimization: calculateInterestMatch', () => {
  const userPreferences: UserPreferences = {
    interests: [
      'AI Tools',
      'Web Hosting',
      'Databases',
      'tag1',
      'tag2',
      'tag3',
      'tech1',
      'tech2',
      'tech3',
    ],
  }

  it('should handle matching interests efficiently', () => {
    const resource = createMockResource(
      'resource',
      'AI Tools',
      ['tag1', 'tag2', 'tag4'],
      ['tech1', 'tech4']
    )

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateInterestMatch(resource, userPreferences)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(10) // Should complete 1000 iterations in < 10ms

    console.log(
      `calculateInterestMatch (1000 iterations): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should handle non-matching interests efficiently', () => {
    const resource = createMockResource(
      'resource',
      'CDN',
      ['tag10', 'tag11', 'tag12'],
      ['tech10', 'tech11']
    )

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateInterestMatch(resource, userPreferences)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(10) // Should complete 1000 iterations in < 10ms

    console.log(
      `calculateInterestMatch (1000 iterations, no match): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should scale linearly with interests array size', () => {
    const interestSizes = [5, 10, 20, 30, 50]
    const times: number[] = []

    for (const size of interestSizes) {
      const preferences: UserPreferences = {
        interests: Array.from({ length: size }, (_, i) => `interest${i}`),
      }
      const resource = createMockResource(
        'resource',
        'AI Tools',
        Array.from({ length: 5 }, (_, i) => `tag${i}`),
        Array.from({ length: 3 }, (_, i) => `tech${i}`)
      )

      const iterations = 100
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        calculateInterestMatch(resource, preferences)
      }

      const endTime = performance.now()
      times.push(endTime - startTime)
    }

    console.log('Scaling performance (calculateInterestMatch):')
    interestSizes.forEach((size, i) => {
      console.log(`  ${size} interests: ${times[i].toFixed(4)}ms`)
    })

    expect(times[4] / times[0]).toBeLessThan(10)
  })
})

describe('Algorithm Optimization: calculateCollaborativeScore', () => {
  it('should handle matched resources efficiently', () => {
    const userPreferences: UserPreferences = {
      viewedResources: ['resource1', 'resource2', 'resource3'],
      bookmarkedResources: ['resource4', 'resource5'],
    }

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateCollaborativeScore('resource1', userPreferences)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(5) // Should complete 1000 iterations in < 5ms

    console.log(
      `calculateCollaborativeScore (1000 iterations, match): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should handle unmatched resources efficiently', () => {
    const userPreferences: UserPreferences = {
      viewedResources: ['resource1', 'resource2', 'resource3'],
      bookmarkedResources: ['resource4', 'resource5'],
    }

    const iterations = 1000
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      calculateCollaborativeScore('resource99', userPreferences)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    expect(executionTime).toBeLessThan(5) // Should complete 1000 iterations in < 5ms

    console.log(
      `calculateCollaborativeScore (1000 iterations, no match): ${executionTime.toFixed(4)}ms`
    )
  })

  it('should scale with user preferences size', () => {
    const sizes = [10, 50, 100, 200, 500]
    const times: number[] = []

    for (const size of sizes) {
      const preferences: UserPreferences = {
        viewedResources: Array.from(
          { length: Math.floor(size / 2) },
          (_, i) => `viewed${i}`
        ),
        bookmarkedResources: Array.from(
          { length: Math.floor(size / 2) },
          (_, i) => `bookmarked${i}`
        ),
      }

      const iterations = 100
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        calculateCollaborativeScore('viewed0', preferences)
      }

      const endTime = performance.now()
      times.push(endTime - startTime)
    }

    console.log('Scaling performance (calculateCollaborativeScore):')
    sizes.forEach((size, i) => {
      console.log(`  ${size} resources: ${times[i].toFixed(4)}ms`)
    })

    expect(times[4] / times[0]).toBeLessThan(50)
  })
})

describe('Overall Algorithm Performance', () => {
  it('should handle recommendation workflow efficiently', () => {
    const resource = createMockResource(
      'resource',
      'AI Tools',
      ['tag1', 'tag2', 'tag3'],
      ['tech1', 'tech2']
    )

    const otherResources = Array.from({ length: 100 }, (_, i) =>
      createMockResource(
        `resource-${i}`,
        i % 5 === 0 ? 'AI Tools' : 'Web Hosting',
        [`tag${i % 10}`, `tag${(i + 1) % 10}`],
        [`tech${i % 5}`]
      )
    )

    const userPreferences: UserPreferences = {
      interests: ['AI Tools', 'tag1', 'tag2', 'tech1'],
      viewedResources: ['resource1', 'resource2'],
      bookmarkedResources: ['resource3'],
    }

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      otherResources.forEach(other => {
        calculateSimilarity(resource, other)
        calculateInterestMatch(other, userPreferences)
        calculateCollaborativeScore(other.id, userPreferences)
      })
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    const operations = iterations * otherResources.length * 3
    const avgTimePerOperation = executionTime / operations

    expect(executionTime).toBeLessThan(500) // Should complete in < 500ms

    console.log('Overall recommendation workflow performance:')
    console.log(`  Total time: ${executionTime.toFixed(4)}ms`)
    console.log(`  Operations: ${operations}`)
    console.log(`  Avg per operation: ${avgTimePerOperation.toFixed(6)}ms`)
  })
})
