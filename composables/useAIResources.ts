import { computed } from 'vue'
import { useResources } from '~/composables/useResources'

const AI_CATEGORIES = [
  'AI Tools',
  'AI & Machine Learning',
  'ai tools',
  'AI/ML',
] as const

function isAICategory(category: string): boolean {
  return AI_CATEGORIES.some(aiCategory =>
    category.toLowerCase().includes(aiCategory.toLowerCase())
  )
}

export const useAIResources = () => {
  const {
    filteredResources,
    loading,
    error,
    categories,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    setSortOption,
    resetFilters,
  } = useResources()

  const aiResources = computed(() => {
    return filteredResources.value.filter(resource =>
      isAICategory(resource.category)
    )
  })

  const allCategories = computed(() => {
    return categories.value.filter(category => isAICategory(category))
  })

  const hasAIResources = computed(() => {
    return aiResources.value.length > 0
  })

  return {
    aiResources,
    hasAIResources,
    loading,
    error,
    categories: allCategories,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    setSortOption,
    resetFilters,
  }
}
