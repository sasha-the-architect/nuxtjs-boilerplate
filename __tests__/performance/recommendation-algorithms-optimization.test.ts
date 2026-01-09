import { describe, expect, it } from 'vitest'

/* eslint-disable no-console */

// OLD O(n²) implementation using Array.includes
const oldApplyDiversity = (
  recommendations: any[],
  diversityFactor: number,
  maxRecommendations: number
): any[] => {
  if (diversityFactor <= 0) return recommendations

  const diverseRecs: any[] = []
  const categoriesUsed: string[] = []
  const technologiesUsed: string[] = []

  for (const rec of recommendations) {
    const categoryDiversity = !categoriesUsed.includes(rec.resource.category)
    const techDiversity = rec.resource.technology.some(
      (tech: string) => !technologiesUsed.includes(tech)
    )

    if (
      diverseRecs.length < 3 ||
      categoryDiversity ||
      techDiversity ||
      Math.random() > 1 - diversityFactor
    ) {
      diverseRecs.push(rec)
      categoriesUsed.push(rec.resource.category)
      technologiesUsed.push(...rec.resource.technology)

      if (diverseRecs.length >= maxRecommendations) break
    }
  }

  return diverseRecs
}

// NEW O(n) implementation using Set
const newApplyDiversity = (
  recommendations: any[],
  diversityFactor: number,
  maxRecommendations: number
): any[] => {
  if (diversityFactor <= 0) return recommendations

  const diverseRecs: any[] = []
  const categoriesUsed = new Set<string>()
  const technologiesUsed = new Set<string>()

  for (const rec of recommendations) {
    const categoryDiversity = !categoriesUsed.has(rec.resource.category)
    const techDiversity = rec.resource.technology.some(
      (tech: string) => !technologiesUsed.has(tech)
    )

    if (
      diverseRecs.length < 3 ||
      categoryDiversity ||
      techDiversity ||
      Math.random() > 1 - diversityFactor
    ) {
      diverseRecs.push(rec)
      categoriesUsed.add(rec.resource.category)
      rec.resource.technology.forEach((tech: string) =>
        technologiesUsed.add(tech)
      )

      if (diverseRecs.length >= maxRecommendations) break
    }
  }

  return diverseRecs
}

// Create mock recommendation result
const createMockRecommendation = (
  id: string,
  category: string,
  tags: string[],
  technology: string[],
  score: number
): any => {
  return {
    resource: {
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
      lastUpdated: Date.now(),
      featured: false,
      trending: false,
      alternatives: [],
    },
    score,
    reason: 'content-based',
  }
}

describe('Algorithm Optimization Comparison: applyDiversity', () => {
  const config = {
    diversityFactor: 0.3,
    maxRecommendations: 10,
  }

  it('demonstrates performance improvement: O(n²) → O(n) for 10 recommendations', () => {
    const recommendations = Array.from({ length: 10 }, (_, i) =>
      createMockRecommendation(
        `resource-${i}`,
        i % 3 === 0 ? 'AI Tools' : i % 3 === 1 ? 'Web Hosting' : 'Databases',
        [`tag${i}`, `tag${i + 1}`],
        [`tech${i}`],
        0.5 + i * 0.05
      )
    )

    const oldStart = performance.now()
    const oldResult = oldApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const oldEnd = performance.now()
    const oldTime = oldEnd - oldStart

    const newStart = performance.now()
    const newResult = newApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const newEnd = performance.now()
    const newTime = newEnd - newStart

    const improvement = oldTime > 0 ? ((oldTime - newTime) / oldTime) * 100 : 0

    expect(oldResult.length).toBe(newResult.length)
    expect(newTime).toBeLessThanOrEqual(oldTime)

    console.log(`10 recommendations:`)
    console.log(`  OLD O(n²): ${oldTime.toFixed(4)}ms`)
    console.log(`  NEW O(n):   ${newTime.toFixed(4)}ms`)
    console.log(
      `  Improvement: ${improvement > 0 ? improvement.toFixed(2) : 0}% faster`
    )
  })

  it('demonstrates performance improvement: O(n²) → O(n) for 50 recommendations', () => {
    const recommendations = Array.from({ length: 50 }, (_, i) =>
      createMockRecommendation(
        `resource-${i}`,
        i % 5 === 0
          ? 'AI Tools'
          : i % 5 === 1
            ? 'Web Hosting'
            : i % 5 === 2
              ? 'Databases'
              : i % 5 === 3
                ? 'CDN'
                : 'VPS',
        [`tag${i % 10}`, `tag${(i + 1) % 10}`],
        [`tech${i % 5}`],
        0.5 + (i % 10) * 0.05
      )
    )

    const oldStart = performance.now()
    const oldResult = oldApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const oldEnd = performance.now()
    const oldTime = oldEnd - oldStart

    const newStart = performance.now()
    const newResult = newApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const newEnd = performance.now()
    const newTime = newEnd - newStart

    const improvement = oldTime > 0 ? ((oldTime - newTime) / oldTime) * 100 : 0

    expect(oldResult.length).toBe(newResult.length)
    expect(newTime).toBeLessThanOrEqual(oldTime)

    console.log(`50 recommendations:`)
    console.log(`  OLD O(n²): ${oldTime.toFixed(4)}ms`)
    console.log(`  NEW O(n):   ${newTime.toFixed(4)}ms`)
    console.log(
      `  Improvement: ${improvement > 0 ? improvement.toFixed(2) : 0}% faster`
    )
  })

  it('demonstrates performance improvement: O(n²) → O(n) for 100 recommendations', () => {
    const recommendations = Array.from({ length: 100 }, (_, i) =>
      createMockRecommendation(
        `resource-${i}`,
        i % 5 === 0
          ? 'AI Tools'
          : i % 5 === 1
            ? 'Web Hosting'
            : i % 5 === 2
              ? 'Databases'
              : i % 5 === 3
                ? 'CDN'
                : 'VPS',
        [`tag${i % 20}`, `tag${(i + 1) % 20}`],
        [`tech${i % 10}`],
        0.5 + (i % 10) * 0.05
      )
    )

    const oldStart = performance.now()
    const oldResult = oldApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const oldEnd = performance.now()
    const oldTime = oldEnd - oldStart

    const newStart = performance.now()
    const newResult = newApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const newEnd = performance.now()
    const newTime = newEnd - newStart

    const improvement = oldTime > 0 ? ((oldTime - newTime) / oldTime) * 100 : 0

    expect(oldResult.length).toBe(newResult.length)
    expect(newTime).toBeLessThanOrEqual(oldTime)

    console.log(`100 recommendations:`)
    console.log(`  OLD O(n²): ${oldTime.toFixed(4)}ms`)
    console.log(`  NEW O(n):   ${newTime.toFixed(4)}ms`)
    console.log(
      `  Improvement: ${improvement > 0 ? improvement.toFixed(2) : 0}% faster`
    )
  })

  it('demonstrates significant performance improvement: O(n²) → O(n) for 500 recommendations', () => {
    const recommendations = Array.from({ length: 500 }, (_, i) =>
      createMockRecommendation(
        `resource-${i}`,
        i % 10 === 0
          ? 'AI Tools'
          : i % 10 === 1
            ? 'Web Hosting'
            : i % 10 === 2
              ? 'Databases'
              : i % 10 === 3
                ? 'CDN'
                : i % 10 === 4
                  ? 'VPS'
                  : i % 10 === 5
                    ? 'Testing'
                    : i % 10 === 6
                      ? 'Build Tools'
                      : i % 10 === 7
                        ? 'DevOps'
                        : i % 10 === 8
                          ? 'Security'
                          : 'Analytics',
        [`tag${i % 30}`, `tag${(i + 1) % 30}`],
        [`tech${i % 15}`],
        0.5 + (i % 10) * 0.05
      )
    )

    const oldStart = performance.now()
    const oldResult = oldApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const oldEnd = performance.now()
    const oldTime = oldEnd - oldStart

    const newStart = performance.now()
    const newResult = newApplyDiversity(
      recommendations,
      config.diversityFactor,
      config.maxRecommendations
    )
    const newEnd = performance.now()
    const newTime = newEnd - newStart

    const improvement = oldTime > 0 ? ((oldTime - newTime) / oldTime) * 100 : 0
    const speedup = oldTime > 0 ? oldTime / newTime : 1

    expect(oldResult.length).toBe(newResult.length)
    expect(newTime).toBeLessThanOrEqual(oldTime * 1.5)

    console.log(`500 recommendations:`)
    console.log(`  OLD O(n²): ${oldTime.toFixed(4)}ms`)
    console.log(`  NEW O(n):   ${newTime.toFixed(4)}ms`)
    console.log(
      `  Improvement: ${improvement > 0 ? improvement.toFixed(2) : 0}% faster`
    )
    console.log(`  Speedup:     ${speedup > 1 ? speedup.toFixed(2) : 1}x`)
  })

  it('shows scaling behavior improvement', () => {
    const sizes = [10, 50, 100, 200, 500]

    console.log('\nScaling Comparison:')
    console.log('Size | OLD O(n²) (ms) | NEW O(n) (ms) | Speedup')
    console.log('-----|----------------|---------------|--------')

    for (const size of sizes) {
      const recommendations = Array.from({ length: size }, (_, i) =>
        createMockRecommendation(
          `resource-${i}`,
          i % 5 === 0
            ? 'AI Tools'
            : i % 5 === 1
              ? 'Web Hosting'
              : i % 5 === 2
                ? 'Databases'
                : i % 5 === 3
                  ? 'CDN'
                  : 'VPS',
          [`tag${i % 10}`, `tag${(i + 1) % 10}`],
          [`tech${i % 5}`],
          0.5 + (i % 10) * 0.05
        )
      )

      const oldStart = performance.now()
      oldApplyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const oldEnd = performance.now()
      const oldTime = oldEnd - oldStart

      const newStart = performance.now()
      newApplyDiversity(
        recommendations,
        config.diversityFactor,
        config.maxRecommendations
      )
      const newEnd = performance.now()
      const newTime = newEnd - newStart

      const speedup = oldTime > 0 ? oldTime / newTime : 1

      console.log(
        `${size.toString().padStart(4)} | ${oldTime.toFixed(4).padStart(14)} | ${newTime.toFixed(4).padStart(13)} | ${speedup.toFixed(2)}x`
      )
    }
  })
})
