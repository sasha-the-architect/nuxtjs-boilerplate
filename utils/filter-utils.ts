/**
 * Filter Utilities
 *
 * Pure utility functions for filtering and manipulating resource data.
 * These functions do not use Vue reactivity - they are pure functions.
 *
 * Architecture Principles:
 * - Pure Functions: No side effects, same input always produces same output
 * - Single Responsibility: Each function has one clear purpose
 * - Reusability: Can be used across composables, components, and server code
 */

import type { Resource, FilterOptions } from '~/types/resource'

/**
 * Check if a filter array has active values
 */
export const hasActiveFilter = (filters: string[] | undefined): boolean =>
  Boolean(filters && filters.length > 0)

/**
 * Match resource by category
 */
export const matchesCategory = (
  resource: Resource,
  categories: string[] | undefined
): boolean =>
  !hasActiveFilter(categories) || categories!.includes(resource.category)

/**
 * Match resource by pricing model
 */
export const matchesPricingModel = (
  resource: Resource,
  pricingModels: string[] | undefined
): boolean =>
  !hasActiveFilter(pricingModels) ||
  pricingModels!.includes(resource.pricingModel)

/**
 * Match resource by difficulty level
 */
export const matchesDifficultyLevel = (
  resource: Resource,
  difficultyLevels: string[] | undefined
): boolean =>
  !hasActiveFilter(difficultyLevels) ||
  difficultyLevels!.includes(resource.difficulty)

/**
 * Match resource by technology
 */
export const matchesTechnology = (
  resource: Resource,
  technologies: string[] | undefined
): boolean =>
  !hasActiveFilter(technologies) ||
  resource.technology.some(tech => technologies!.includes(tech))

/**
 * Match resource by tag
 */
export const matchesTag = (
  resource: Resource,
  tags: string[] | undefined
): boolean =>
  !hasActiveFilter(tags) || resource.tags.some(tag => tags!.includes(tag))

/**
 * Match resource by benefit
 */
export const matchesBenefit = (
  resource: Resource,
  benefits: string[] | undefined
): boolean =>
  !hasActiveFilter(benefits) ||
  (resource.benefits || []).some(benefit => benefits!.includes(benefit))

/**
 * Filter resources by all criteria (without date range or benefits)
 */
export const filterByAllCriteria = (
  resources: readonly Resource[],
  filterOptions: FilterOptions
): Resource[] => {
  const { categories, pricingModels, difficultyLevels, technologies, tags } =
    filterOptions

  return resources.filter(
    resource =>
      matchesCategory(resource, categories as string[] | undefined) &&
      matchesPricingModel(resource, pricingModels as string[] | undefined) &&
      matchesDifficultyLevel(
        resource,
        difficultyLevels as string[] | undefined
      ) &&
      matchesTechnology(resource, technologies as string[] | undefined) &&
      matchesTag(resource, tags as string[] | undefined)
  )
}

/**
 * Parse date string to timestamp
 */
export const parseDate = (dateString: string): number => {
  if (!dateString) return 0
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 0 : date.getTime()
}

/**
 * Match resource by date range
 */
export const matchesDateRange = (
  resource: Resource,
  dateRange: string | undefined
): boolean => {
  if (!dateRange || dateRange === 'anytime') return true

  const now = new Date()
  const resourceDate = new Date(resource.dateAdded || now)
  const timeDiff = now.getTime() - resourceDate.getTime()
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

  switch (dateRange) {
    case 'lastWeek':
      return daysDiff <= 7
    case 'lastMonth':
      return daysDiff <= 30
    case 'lastYear':
      return daysDiff <= 365
    default:
      return true
  }
}

/**
 * Filter resources by all criteria (including date range and benefits)
 */
export const filterByAllCriteriaWithDateRange = (
  resources: readonly Resource[],
  filterOptions: FilterOptions & { dateRange?: string; benefits?: string[] }
): Resource[] => {
  const {
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    tags,
    benefits,
    dateRange,
  } = filterOptions

  return resources.filter(
    resource =>
      matchesCategory(resource, categories as string[] | undefined) &&
      matchesPricingModel(resource, pricingModels as string[] | undefined) &&
      matchesDifficultyLevel(
        resource,
        difficultyLevels as string[] | undefined
      ) &&
      matchesTechnology(resource, technologies as string[] | undefined) &&
      matchesTag(resource, tags as string[] | undefined) &&
      matchesBenefit(resource, benefits as string[] | undefined) &&
      matchesDateRange(resource, dateRange)
  )
}

/**
 * Toggle an item in an array (add if not present, remove if present)
 * Used for filter toggle functionality
 */
export const toggleArrayItem = (
  currentArray: string[],
  item: string
): string[] => {
  const newArray = [...currentArray]
  const index = newArray.indexOf(item)
  if (index > -1) {
    newArray.splice(index, 1)
  } else {
    newArray.push(item)
  }
  return newArray
}
