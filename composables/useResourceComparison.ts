import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonData, ComparisonCriteria } from '~/types/comparison'

// Configuration for comparison system
interface ComparisonConfig {
  maxResources: number
  defaultCriteria: ComparisonCriteria[]
  similarityThreshold: number
}

// Main composable for resource comparison
export const useResourceComparison = () => {
  // State management for comparison
  const selectedResources = ref<Resource[]>([])
  const comparisonCriteria = ref<ComparisonCriteria[]>([])
  const config = ref<ComparisonConfig>({
    maxResources: 4,
    similarityThreshold: 0.3,
    defaultCriteria: [
      {
        id: 'title',
        name: 'Name',
        type: 'text',
        category: 'basic',
        weight: 1,
      },
      {
        id: 'description',
        name: 'Description',
        type: 'text',
        category: 'basic',
        weight: 1,
      },
      {
        id: 'pricingModel',
        name: 'Pricing',
        type: 'text',
        category: 'business',
        weight: 1,
      },
      {
        id: 'category',
        name: 'Category',
        type: 'text',
        category: 'basic',
        weight: 0.8,
      },
      {
        id: 'technology',
        name: 'Technology',
        type: 'list',
        category: 'technical',
        weight: 1,
      },
      {
        id: 'popularity',
        name: 'Popularity',
        type: 'number',
        category: 'metrics',
        weight: 0.7,
      },
      {
        id: 'benefits',
        name: 'Benefits',
        type: 'list',
        category: 'features',
        weight: 1,
      },
      {
        id: 'limitiations',
        name: 'Limitations',
        type: 'list',
        category: 'features',
        weight: 0.8,
      },
      {
        id: 'platforms',
        name: 'Platforms',
        type: 'list',
        category: 'technical',
        weight: 0.7,
      },
      {
        id: 'features',
        name: 'Features',
        type: 'list',
        category: 'features',
        weight: 1,
      },
    ],
  })

  // Add a resource to comparison
  const addResource = (resource: Resource) => {
    if (selectedResources.value.length >= config.value.maxResources) {
      return false
    }

    // Check if resource is already in comparison
    if (selectedResources.value.some(r => r.id === resource.id)) {
      return false
    }

    selectedResources.value = [...selectedResources.value, resource]
    return true
  }

  // Remove a resource from comparison
  const removeResource = (resourceId: string) => {
    selectedResources.value = selectedResources.value.filter(
      r => r.id !== resourceId
    )
  }

  // Clear all selected resources
  const clearComparison = () => {
    selectedResources.value = []
  }

  // Check if a resource is in the comparison
  const isInComparison = (resourceId: string) => {
    return selectedResources.value.some(r => r.id === resourceId)
  }

  // Get comparison data
  const getComparisonData = () => {
    return {
      resources: selectedResources.value,
      criteria:
        comparisonCriteria.value.length > 0
          ? comparisonCriteria.value
          : config.value.defaultCriteria,
      comparisonId: `cmp_${Date.now()}`,
    } as ComparisonData
  }

  // Set custom criteria
  const setComparisonCriteria = (criteria: ComparisonCriteria[]) => {
    comparisonCriteria.value = criteria
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<ComparisonConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // Computed properties
  const isComparisonReady = computed(() => selectedResources.value.length >= 2)
  const canAddMoreResources = computed(
    () => selectedResources.value.length < config.value.maxResources
  )
  const comparisonCount = computed(() => selectedResources.value.length)

  return {
    // State
    selectedResources: readonly(selectedResources),
    comparisonCriteria: readonly(comparisonCriteria),
    config: readonly(config),

    // Methods
    addResource,
    removeResource,
    clearComparison,
    isInComparison,
    getComparisonData,
    setComparisonCriteria,
    updateConfig,

    // Computed
    isComparisonReady,
    canAddMoreResources,
    comparisonCount,
  }
}
