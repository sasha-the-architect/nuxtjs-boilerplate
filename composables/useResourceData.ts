import { ref, computed, readonly } from 'vue'
import { logError } from '~/utils/errorLogger'
import logger from '~/utils/logger'
import type { Resource } from '~/types/resource'

// Main composable for managing resource data
export const useResourceData = () => {
  const resources = ref<Resource[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3
  const lastError = ref<Error | null>(null)

  // Initialize resources
  const initResources = async (attempt = 1) => {
    try {
      // Set loading state
      if (attempt === 1) {
        loading.value = true
      }
      error.value = null

      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      resources.value = resourcesModule.default || resourcesModule

      loading.value = false
      error.value = null
      lastError.value = null
    } catch (err) {
      // Store the actual error object
      lastError.value = err as Error

      // Log error using our error logging service
      logError(
        `Failed to load resources (attempt ${attempt}/${maxRetries}): ${err instanceof Error ? err.message : 'Unknown error'}`,
        err as Error,
        'useResourceData',
        { attempt, maxRetries, errorType: err?.constructor?.name }
      )

      // Log error using structured logger
      logger.error('Error loading resources:', err)
      error.value = `Failed to load resources${attempt < maxRetries ? '. Retrying...' : ''}`

      // Retry if we haven't exceeded max retries
      if (attempt < maxRetries) {
        retryCount.value = attempt
        // Wait for a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        await initResources(attempt + 1)
      } else {
        loading.value = false
      }
    }
  }

  // Retry loading resources
  const retryResources = async () => {
    loading.value = true
    error.value = null
    retryCount.value = 0
    lastError.value = null
    await initResources()
  }

  // Compute all unique values in a single pass
  const filterValues = computed(() => {
    if (!resources.value || !Array.isArray(resources.value)) {
      return {
        categories: [],
        pricingModels: [],
        difficultyLevels: [],
        technologies: [],
      }
    }

    const categoriesSet = new Set<string>()
    const pricingModelsSet = new Set<string>()
    const difficultyLevelsSet = new Set<string>()
    const technologiesSet = new Set<string>()

    resources.value.forEach(resource => {
      categoriesSet.add(resource.category)
      pricingModelsSet.add(resource.pricingModel)
      difficultyLevelsSet.add(resource.difficulty)
      resource.technology.forEach(tech => technologiesSet.add(tech))
    })

    return {
      categories: Array.from(categoriesSet),
      pricingModels: Array.from(pricingModelsSet),
      difficultyLevels: Array.from(difficultyLevelsSet),
      technologies: Array.from(technologiesSet),
    }
  })

  const categories = computed(() => filterValues.value.categories)
  const pricingModels = computed(() => filterValues.value.pricingModels)
  const difficultyLevels = computed(() => filterValues.value.difficultyLevels)
  const technologies = computed(() => filterValues.value.technologies)

  // Initialize resources when composable is created
  initResources()

  return {
    resources: readonly(resources),
    loading: readonly(loading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    maxRetries,
    lastError: readonly(lastError),
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    retryResources,
  }
}
