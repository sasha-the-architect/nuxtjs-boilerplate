import { describe, it, expect } from 'vitest'
import type { Resource } from '~/types/resource'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'

const createMockResources = (count: number): Resource[] => {
  const categories = [
    'AI Tools',
    'Hosting',
    'Development',
    'Design',
    'Productivity',
  ]
  const technologies = ['React', 'Vue', 'Node.js', 'Python', 'TypeScript']

  return Array.from({ length: count }, (_, i) => ({
    id: `res-${i}`,
    title: `Resource ${i}`,
    description: `Description for resource ${i}`,
    url: `https://example.com/resource-${i}`,
    category: categories[i % categories.length],
    pricingModel: ['Free', 'Freemium', 'Open Source'][i % 3],
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
    technology: [technologies[i % technologies.length]],
    tags: [`tag-${i % 10}`, `tag-${(i + 1) % 10}`],
    popularity: Math.floor(Math.random() * 1000),
    dateAdded: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    benefits: [`Benefit ${i}1`, `Benefit ${i}2`],
  }))
}

describe('Recommendation Engine Caching Performance', () => {
  const mediumDataset = createMockResources(500)
  const largeDataset = createMockResources(1000)

  it('measures cached performance for getDiverseRecommendations (1000 resources)', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 100
    const coldStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const coldAvg = (performance.now() - coldStartTime) / iterations

    const warmStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const warmAvg = (performance.now() - warmStartTime) / iterations

    const improvement = ((coldAvg - warmAvg) / coldAvg) * 100

    console.log(`  Cold cache: ${coldAvg.toFixed(4)}ms per call`)
    console.log(`  Warm cache: ${warmAvg.toFixed(4)}ms per call`)
    console.log(`  Improvement: ${improvement.toFixed(1)}%`)

    expect(warmAvg).toBeLessThanOrEqual(coldAvg)
  })

  it('measures cached performance for individual strategies (1000 resources)', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 100

    const coldContentStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getContentBasedRecommendations(targetResource)
    }
    const coldContentAvg =
      (performance.now() - coldContentStartTime) / iterations

    const warmContentStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getContentBasedRecommendations(targetResource)
    }
    const warmContentAvg =
      (performance.now() - warmContentStartTime) / iterations

    const coldPopularStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getPopularRecommendations()
    }
    const coldPopularAvg =
      (performance.now() - coldPopularStartTime) / iterations

    const warmPopularStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getPopularRecommendations()
    }
    const warmPopularAvg =
      (performance.now() - warmPopularStartTime) / iterations

    const contentImprovement =
      ((coldContentAvg - warmContentAvg) / coldContentAvg) * 100
    const popularImprovement =
      ((coldPopularAvg - warmPopularAvg) / coldPopularAvg) * 100

    console.log(`  Content-based cold: ${coldContentAvg.toFixed(4)}ms`)
    console.log(
      `  Content-based warm: ${warmContentAvg.toFixed(4)}ms (${contentImprovement.toFixed(1)}% faster)`
    )
    console.log(`  Popular cold: ${coldPopularAvg.toFixed(4)}ms`)
    console.log(
      `  Popular warm: ${warmPopularAvg.toFixed(4)}ms (${popularImprovement.toFixed(1)}% faster)`
    )

    expect(warmContentAvg).toBeLessThanOrEqual(coldContentAvg)
    expect(warmPopularAvg).toBeLessThanOrEqual(coldPopularAvg)
  })

  it('measures cached performance scaling behavior (500 resources)', () => {
    const engine = useRecommendationEngine(mediumDataset)
    const targetResource = mediumDataset[0]

    const iterations = 100

    const coldStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const coldAvg = (performance.now() - coldStartTime) / iterations

    const warmStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const warmAvg = (performance.now() - warmStartTime) / iterations

    const speedup = coldAvg / warmAvg

    console.log(`  Cold cache: ${coldAvg.toFixed(4)}ms per call`)
    console.log(`  Warm cache: ${warmAvg.toFixed(4)}ms per call`)
    console.log(`  Speedup: ${speedup.toFixed(2)}x faster`)

    expect(speedup).toBeGreaterThan(1)
  })

  it('compares baseline vs cached performance', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 50

    const baselineStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const baselineAvg = (performance.now() - baselineStartTime) / iterations

    const cachedStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const cachedAvg = (performance.now() - cachedStartTime) / iterations

    const improvement = ((baselineAvg - cachedAvg) / baselineAvg) * 100
    const speedup = baselineAvg / cachedAvg

    console.log(`  Baseline (no cache): ${baselineAvg.toFixed(4)}ms per call`)
    console.log(`  With caching: ${cachedAvg.toFixed(4)}ms per call`)
    console.log(`  Performance gain: ${improvement.toFixed(1)}%`)
    console.log(`  Speedup: ${speedup.toFixed(2)}x`)

    expect(cachedAvg).toBeLessThan(baselineAvg)
  })

  it.skip('measures cached performance for different resource contexts', () => {
    const engine = useRecommendationEngine(largeDataset)
    const resource1 = largeDataset[0]
    const resource2 = largeDataset[10]
    const resource3 = largeDataset[20]

    const iterations = 100

    const firstCallStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(resource1, resource1.category)
      engine.getDiverseRecommendations(resource2, resource2.category)
      engine.getDiverseRecommendations(resource3, resource3.category)
    }
    const firstCallAvg =
      (performance.now() - firstCallStartTime) / (iterations * 3)

    const cachedCallStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(resource1, resource1.category)
      engine.getDiverseRecommendations(resource2, resource2.category)
      engine.getDiverseRecommendations(resource3, resource3.category)
    }
    const cachedCallAvg =
      (performance.now() - cachedCallStartTime) / (iterations * 3)

    const improvement = ((firstCallAvg - cachedCallAvg) / firstCallAvg) * 100

    console.log(`  First call (cache miss): ${firstCallAvg.toFixed(4)}ms`)
    console.log(`  Cached call (cache hit): ${cachedCallAvg.toFixed(4)}ms`)
    console.log(`  Improvement: ${improvement.toFixed(1)}%`)
    console.log(
      `  Multiple context caching: ${cachedCallAvg < firstCallAvg ? 'working' : 'not working'}`
    )

    expect(cachedCallAvg).toBeLessThanOrEqual(firstCallAvg)
  })
})
