import type { Resource, FilterOptions } from '~/types/resource'

const hasActiveFilter = (filters: string[] | undefined): boolean =>
  Boolean(filters && filters.length > 0)

const matchesCategory = (
  resource: Resource,
  categories: string[] | undefined
): boolean =>
  !hasActiveFilter(categories) || categories!.includes(resource.category)

const matchesPricingModel = (
  resource: Resource,
  pricingModels: string[] | undefined
): boolean =>
  !hasActiveFilter(pricingModels) ||
  pricingModels!.includes(resource.pricingModel)

const matchesDifficultyLevel = (
  resource: Resource,
  difficultyLevels: string[] | undefined
): boolean =>
  !hasActiveFilter(difficultyLevels) ||
  difficultyLevels!.includes(resource.difficulty)

const matchesTechnology = (
  resource: Resource,
  technologies: string[] | undefined
): boolean =>
  !hasActiveFilter(technologies) ||
  resource.technology.some(tech => technologies!.includes(tech))

const matchesTag = (resource: Resource, tags: string[] | undefined): boolean =>
  !hasActiveFilter(tags) || resource.tags.some(tag => tags!.includes(tag))

const matchesBenefit = (
  resource: Resource,
  benefits: string[] | undefined
): boolean =>
  !hasActiveFilter(benefits) ||
  (resource.benefits || []).some(benefit => benefits!.includes(benefit))

const filterByAllCriteria = (
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

const parseDate = (dateString: string): number => {
  if (!dateString) return 0
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 0 : date.getTime()
}

const matchesDateRange = (
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

const filterByAllCriteriaWithDateRange = (
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

const toggleArrayItem = (currentArray: string[], item: string): string[] => {
  const newArray = [...currentArray]
  const index = newArray.indexOf(item)
  if (index > -1) {
    newArray.splice(index, 1)
  } else {
    newArray.push(item)
  }
  return newArray
}

export const useFilterUtils = () => ({
  filterByAllCriteria,
  filterByAllCriteriaWithDateRange,
  parseDate,
  hasActiveFilter,
  matchesCategory,
  matchesPricingModel,
  matchesDifficultyLevel,
  matchesTechnology,
  matchesTag,
  matchesBenefit,
  matchesDateRange,
  toggleArrayItem,
})
