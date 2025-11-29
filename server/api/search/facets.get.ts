import { getQuery, setResponseStatus } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

/**
 * GET /api/search/facets
 *
 * Get faceted search counts for filters
 *
 * Query parameters:
 * - q: Search query term to apply before calculating facets
 * - category: Category filter to apply before calculating facets
 * - pricing: Pricing model filter to apply before calculating facets
 * - difficulty: Difficulty level filter to apply before calculating facets
 * - tags: Tags filter to apply before calculating facets (comma-separated)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search endpoint
    await rateLimit(event)

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = `facets:${JSON.stringify(query)}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters
    const searchQuery = query.q as string | undefined
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const tagsParam = query.tags as string | undefined

    // Apply filters (same as search endpoint)
    if (category) {
      resources = resources.filter(
        resource => resource.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (pricing) {
      resources = resources.filter(
        resource =>
          resource.pricingModel.toLowerCase() === pricing.toLowerCase()
      )
    }

    if (difficulty) {
      resources = resources.filter(
        resource =>
          resource.difficulty.toLowerCase() === difficulty.toLowerCase()
      )
    }

    if (tagsParam) {
      // Validate tags parameter - ensure it's a string before splitting
      if (typeof tagsParam === 'string') {
        const tags = tagsParam.split(',').map(tag => tag.trim().toLowerCase())
        resources = resources.filter(resource =>
          resource.tags.some(tag => tags.includes(tag.toLowerCase()))
        )
      } else {
        // Invalid tags parameter format
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid tags parameter. Must be a comma-separated string.',
          error: 'Bad Request',
        }
      }
    }

    // Apply search if query exists
    if (searchQuery) {
      if (typeof searchQuery !== 'string') {
        // Invalid search query format
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid search query parameter. Must be a string.',
          error: 'Bad Request',
        }
      }
      const searchTerm = searchQuery.toLowerCase()
      resources = resources.filter(
        resource =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Calculate faceted counts
    const facetCounts: Record<string, number> = {}

    // Count categories
    const categoryCounts: Record<string, number> = {}
    resources.forEach(resource => {
      const category = resource.category
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    Object.entries(categoryCounts).forEach(([category, count]) => {
      facetCounts[`category_${category}`] = count
    })

    // Count pricing models
    const pricingCounts: Record<string, number> = {}
    resources.forEach(resource => {
      const pricing = resource.pricingModel
      pricingCounts[pricing] = (pricingCounts[pricing] || 0) + 1
    })
    Object.entries(pricingCounts).forEach(([pricing, count]) => {
      facetCounts[`pricing_${pricing}`] = count
    })

    // Count difficulty levels
    const difficultyCounts: Record<string, number> = {}
    resources.forEach(resource => {
      const difficulty = resource.difficulty
      difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1
    })
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
      facetCounts[`difficulty_${difficulty}`] = count
    })

    // Count technologies
    const technologyCounts: Record<string, number> = {}
    resources.forEach(resource => {
      resource.technology.forEach(tech => {
        technologyCounts[tech] = (technologyCounts[tech] || 0) + 1
      })
    })
    Object.entries(technologyCounts).forEach(([technology, count]) => {
      facetCounts[`technology_${technology}`] = count
    })

    // Count tags
    const tagCounts: Record<string, number> = {}
    resources.forEach(resource => {
      resource.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    Object.entries(tagCounts).forEach(([tag, count]) => {
      facetCounts[`tag_${tag}`] = count
    })

    // Count benefits (if available in resources)
    const benefitCounts: Record<string, number> = {}
    resources.forEach(resource => {
      if (resource.benefits && Array.isArray(resource.benefits)) {
        resource.benefits.forEach(benefit => {
          benefitCounts[benefit] = (benefitCounts[benefit] || 0) + 1
        })
      }
    })
    Object.entries(benefitCounts).forEach(([benefit, count]) => {
      facetCounts[`benefits_${benefit}`] = count
    })

    // Prepare response
    const response = {
      success: true,
      data: {
        facetCounts,
        totalResults: resources.length,
      },
    }

    // Cache the result with tags for easier invalidation
    // Use shorter TTL for facet results since they change with filters
    await cacheSetWithTags(cacheKey, response, 60, [
      'search',
      'facets',
      'api-search',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response status
    setResponseStatus(event, 200)
    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error calculating faceted search counts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-search-facets',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while calculating faceted search counts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
