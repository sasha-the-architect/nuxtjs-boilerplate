<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filters</h3>
      <button
        class="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
        aria-label="Reset all filters"
        @click="onResetFilters"
      >
        Reset all
      </button>
    </div>

    <FilterSection
      id="category"
      label="Category"
      :aria-label="'Category filters'"
      :options="categories"
      :selected-options="selectedCategories"
      :show-count="true"
      :get-count-for-option="getCategoryCount"
      @toggle="toggleCategory"
    />

    <FilterSection
      id="pricing"
      label="Pricing Model"
      :aria-label="'Pricing model filters'"
      :options="pricingModels"
      :selected-options="selectedPricingModels"
      :show-count="true"
      :get-count-for-option="getPricingCount"
      @toggle="togglePricingModel"
    />

    <FilterSection
      id="difficulty"
      label="Difficulty"
      :aria-label="'Difficulty level filters'"
      :options="difficultyLevels"
      :selected-options="selectedDifficultyLevels"
      :show-count="true"
      :get-count-for-option="getDifficultyCount"
      @toggle="toggleDifficultyLevel"
    />

    <FilterSection
      id="technology"
      label="Technology"
      :aria-label="'Technology filters'"
      :options="technologies"
      :selected-options="selectedTechnologies"
      :show-count="true"
      :get-count-for-option="getTechnologyCount"
      @toggle="toggleTechnology"
    />

    <FilterSection
      id="tags"
      label="Tags"
      :aria-label="'Tag filters'"
      :options="tags"
      :selected-options="selectedTags"
      :show-count="false"
      :get-count-for-option="undefined"
      @toggle="toggleTag"
    />

    <FilterSection
      v-if="allBenefits.length > 0"
      id="benefits"
      label="Benefits"
      :aria-label="'Benefit filters'"
      :options="allBenefits"
      :selected-options="selectedBenefits"
      :show-count="true"
      :get-count-for-option="getBenefitCount"
      @toggle="toggleBenefit"
    />

    <fieldset class="mb-6">
      <legend class="text-sm font-medium text-gray-900 mb-3">Date Added</legend>
      <div
        role="radiogroup"
        aria-label="Filter by date added"
        class="space-y-2"
      >
        <label class="flex items-center" :for="'date-anytime'">
          <input
            id="date-anytime"
            type="radio"
            name="date-filter"
            value="anytime"
            :checked="selectedDateRange === 'anytime'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('anytime')"
          />
          <span class="ml-2 text-sm text-gray-800">Any time</span>
        </label>
        <label class="flex items-center" :for="'date-last-week'">
          <input
            id="date-last-week"
            type="radio"
            name="date-filter"
            value="lastWeek"
            :checked="selectedDateRange === 'lastWeek'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastWeek')"
          />
          <span class="ml-2 text-sm text-gray-800">Last week</span>
        </label>
        <label class="flex items-center" :for="'date-last-month'">
          <input
            id="date-last-month"
            type="radio"
            name="date-filter"
            value="lastMonth"
            :checked="selectedDateRange === 'lastMonth'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastMonth')"
          />
          <span class="ml-2 text-sm text-gray-800">Last month</span>
        </label>
        <label class="flex items-center" :for="'date-last-year'">
          <input
            id="date-last-year"
            type="radio"
            name="date-filter"
            value="lastYear"
            :checked="selectedDateRange === 'lastYear'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastYear')"
          />
          <span class="ml-2 text-sm text-gray-800">Last year</span>
        </label>
      </div>
    </fieldset>

    <SavedSearches
      v-if="savedSearches && savedSearches.length > 0"
      :saved-searches="savedSearches"
      @use-saved-search="onUseSavedSearch"
      @remove-saved-search="onRemoveSavedSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SavedSearches from '~/components/SavedSearches.vue'
import FilterSection from '~/components/FilterSection.vue'

interface FacetCounts {
  [key: string]: number
}

interface Props {
  categories: string[]
  pricingModels: string[]
  difficultyLevels: string[]
  technologies: string[]
  tags: string[]
  benefits: string[]
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  selectedTags: string[]
  selectedBenefits?: string[]
  selectedDateRange?: string
  searchQuery?: string
  facetCounts?: FacetCounts
  savedSearches?: Array<{ name: string; query: string; createdAt: Date }>
}

interface Emits {
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void
  (event: 'toggle-benefit', benefit: string): void
  (event: 'date-range-change', dateRange: string): void
  (event: 'reset-filters'): void
  (
    event: 'use-saved-search',
    search: { name: string; query: string; createdAt: Date }
  ): void
  (event: 'remove-saved-search', query: string): void
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  facetCounts: () => ({}),
  selectedBenefits: () => [],
  selectedDateRange: 'anytime',
  savedSearches: () => [],
})

const emit = defineEmits<Emits>()

const toggleCategory = (category: string) => {
  emit('toggle-category', category)
}

const togglePricingModel = (pricingModel: string) => {
  emit('toggle-pricing-model', pricingModel)
}

const toggleDifficultyLevel = (difficulty: string) => {
  emit('toggle-difficulty-level', difficulty)
}

const toggleTechnology = (technology: string) => {
  emit('toggle-technology', technology)
}

const toggleTag = (tag: string) => {
  emit('toggle-tag', tag)
}

const toggleBenefit = (benefit: string) => {
  emit('toggle-benefit', benefit)
}

const onDateRangeChange = (dateRange: string) => {
  emit('date-range-change', dateRange)
}

const onResetFilters = () => {
  emit('reset-filters')
}

const allBenefits = computed(() => {
  const uniqueBenefits = new Set<string>()
  Object.keys(props.facetCounts || {}).forEach(key => {
    if (key.startsWith('benefits_')) {
      const benefit = key.replace('benefits_', '')
      uniqueBenefits.add(benefit)
    }
  })
  return Array.from(uniqueBenefits)
})

const getCategoryCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`category_${option}`] || 0
}

const getPricingCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`pricing_${option}`] || 0
}

const getDifficultyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`difficulty_${option}`] || 0
}

const getTechnologyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`technology_${option}`] || 0
}

const getBenefitCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`benefits_${option}`] || 0
}

const onUseSavedSearch = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (query: string) => {
  emit('remove-saved-search', query)
}
</script>
