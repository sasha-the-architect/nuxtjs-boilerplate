<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filters</h3>
      <button
        class="text-sm text-gray-600 hover:text-gray-900"
        @click="onResetFilters"
      >
        Reset all
      </button>
    </div>

    <!-- Category Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Category</h4>
      <div
        role="group"
        :aria-label="'Category filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(category, index) in categories"
          :key="category"
          class="flex items-center justify-between"
          :tabindex="0"
          @keydown.enter.prevent="toggleCategory(category)"
          @keydown.space.prevent="toggleCategory(category)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="category"
              :checked="selectedCategories.includes(category)"
              class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              :aria-label="`Filter by ${category} (${getCountForOption(category, 'category')} results)`"
              @change="toggleCategory(category)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ category }}</span>
          </div>
          <span
            class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
            aria-label="result count"
          >
            {{ getCountForOption(category, 'category') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Pricing Model Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Pricing Model</h4>
      <div
        role="group"
        :aria-label="'Pricing model filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(pricingModel, index) in pricingModels"
          :key="pricingModel"
          class="flex items-center justify-between"
          :tabindex="0"
          @keydown.enter.prevent="togglePricingModel(pricingModel)"
          @keydown.space.prevent="togglePricingModel(pricingModel)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="pricingModel"
              :checked="selectedPricingModels.includes(pricingModel)"
              class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              :aria-label="`Filter by ${pricingModel} (${getCountForOption(pricingModel, 'pricing')} results)`"
              @change="togglePricingModel(pricingModel)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ pricingModel }}</span>
          </div>
          <span
            class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
            aria-label="result count"
          >
            {{ getCountForOption(pricingModel, 'pricing') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Difficulty Level Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Difficulty</h4>
      <div
        role="group"
        :aria-label="'Difficulty level filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(difficulty, index) in difficultyLevels"
          :key="difficulty"
          class="flex items-center justify-between"
          :tabindex="0"
          @keydown.enter.prevent="toggleDifficultyLevel(difficulty)"
          @keydown.space.prevent="toggleDifficultyLevel(difficulty)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="difficulty"
              :checked="selectedDifficultyLevels.includes(difficulty)"
              class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              :aria-label="`Filter by ${difficulty} (${getCountForOption(difficulty, 'difficulty')} results)`"
              @change="toggleDifficultyLevel(difficulty)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ difficulty }}</span>
          </div>
          <span
            class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
            aria-label="result count"
          >
            {{ getCountForOption(difficulty, 'difficulty') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Technology Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Technology</h4>
      <div
        role="group"
        :aria-label="'Technology filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(technology, index) in technologies"
          :key="technology"
          class="flex items-center justify-between"
          :tabindex="0"
          @keydown.enter.prevent="toggleTechnology(technology)"
          @keydown.space.prevent="toggleTechnology(technology)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="technology"
              :checked="selectedTechnologies.includes(technology)"
              class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              :aria-label="`Filter by ${technology} (${getCountForOption(technology, 'technology')} results)`"
              @change="toggleTechnology(technology)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ technology }}</span>
          </div>
          <span
            class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
            aria-label="result count"
          >
            {{ getCountForOption(technology, 'technology') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Tags Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Tags</h4>
      <div
        role="group"
        :aria-label="'Tag filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(tag, index) in tags"
          :key="tag"
          class="flex items-center"
          :tabindex="0"
          @keydown.enter.prevent="toggleTag(tag)"
          @keydown.space.prevent="toggleTag(tag)"
        >
          <input
            type="checkbox"
            :value="tag"
            :checked="selectedTags.includes(tag)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            :aria-label="`Filter by ${tag}`"
            @change="toggleTag(tag)"
          />
          <span class="ml-2 text-sm text-gray-800">{{ tag }}</span>
        </label>
      </div>
    </div>

    <!-- Benefits Filter -->
    <div v-if="allBenefits.length > 0" class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Benefits</h4>
      <div
        role="group"
        :aria-label="'Benefit filters'"
        class="space-y-2 max-h-40 overflow-y-auto"
      >
        <label
          v-for="(benefit, index) in allBenefits"
          :key="benefit"
          class="flex items-center justify-between"
          :tabindex="0"
          @keydown.enter.prevent="toggleBenefit(benefit)"
          @keydown.space.prevent="toggleBenefit(benefit)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="benefit"
              :checked="selectedBenefits.includes(benefit)"
              class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              :aria-label="`Filter by ${benefit} (${getCountForOption(benefit, 'benefits')} results)`"
              @change="toggleBenefit(benefit)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ benefit }}</span>
          </div>
          <span
            class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
            aria-label="result count"
          >
            {{ getCountForOption(benefit, 'benefits') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Date Added Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Date Added</h4>
      <div class="space-y-2">
        <label class="flex items-center">
          <input
            type="radio"
            value="anytime"
            :checked="selectedDateRange === 'anytime'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('anytime')"
          />
          <span class="ml-2 text-sm text-gray-800">Any time</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            value="lastWeek"
            :checked="selectedDateRange === 'lastWeek'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastWeek')"
          />
          <span class="ml-2 text-sm text-gray-800">Last week</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            value="lastMonth"
            :checked="selectedDateRange === 'lastMonth'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastMonth')"
          />
          <span class="ml-2 text-sm text-gray-800">Last month</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            value="lastYear"
            :checked="selectedDateRange === 'lastYear'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastYear')"
          />
          <span class="ml-2 text-sm text-gray-800">Last year</span>
        </label>
      </div>
    </div>

    <!-- Saved Searches -->
    <SavedSearches
      v-if="savedSearches && savedSearches.length > 0"
      :saved-searches="savedSearches"
      @use-saved-search="onUseSavedSearch"
      @remove-saved-search="onRemoveSavedSearch"
    />
  </div>
</template>

<script setup lang="ts">
import SavedSearches from '~/components/SavedSearches.vue'

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
  selectedBenefits: string[]
  selectedDateRange: string
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

// Computed property to get unique benefits from all resources
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

// Helper function to get count for a specific filter option
const getCountForOption = (option: string, filterType: string): number => {
  if (!props.facetCounts) return 0

  // The facetCounts should be structured as [filterType]_[option] = count
  const key = `${filterType}_${option}`
  return props.facetCounts[key] || 0
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
