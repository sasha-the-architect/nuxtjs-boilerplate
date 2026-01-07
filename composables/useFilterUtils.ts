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

const filterByAllCriteria = (
  resources: Resource[],
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

export const useFilterUtils = () => ({
  filterByAllCriteria,
  parseDate,
  hasActiveFilter,
  matchesCategory,
  matchesPricingModel,
  matchesDifficultyLevel,
  matchesTechnology,
  matchesTag,
})
