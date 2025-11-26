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
              :aria-label="`Filter by ${category}`"
              @change="toggleCategory(category)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ category }}</span>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{
            facetedCounts.categories[category] || 0
          }}</span>
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
              :aria-label="`Filter by ${pricingModel}`"
              @change="togglePricingModel(pricingModel)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ pricingModel }}</span>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{
            facetedCounts.pricingModels[pricingModel] || 0
          }}</span>
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
              :aria-label="`Filter by ${difficulty}`"
              @change="toggleDifficultyLevel(difficulty)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ difficulty }}</span>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{
            facetedCounts.difficultyLevels[difficulty] || 0
          }}</span>
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
              :aria-label="`Filter by ${technology}`"
              @change="toggleTechnology(technology)"
            />
            <span class="ml-2 text-sm text-gray-800">{{ technology }}</span>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{
            facetedCounts.technologies[technology] || 0
          }}</span>
        </label>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="border-t border-gray-200 pt-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h4>

      <!-- Popularity Range Filter -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Popularity Range</label
        >
        <div class="flex space-x-2">
          <select
            v-model="selectedPopularityMin"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            @change="onPopularityRangeChange"
          >
            <option value="">Min</option>
            <option value="0">0</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="75">75</option>
            <option value="100">100</option>
          </select>
          <select
            v-model="selectedPopularityMax"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            @change="onPopularityRangeChange"
          >
            <option value="">Max</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="75">75</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>

      <!-- Date Added Filter -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Added in Last</label
        >
        <select
          v-model="selectedDateRange"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          @change="onDateRangeChange"
        >
          <option value="">Any time</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
          <option value="365">365 days</option>
        </select>
      </div>

      <!-- Open Source Filter -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Open Source</label
        >
        <div class="flex space-x-4">
          <label class="flex items-center">
            <input
              type="radio"
              v-model="selectedOpenSource"
              :value="true"
              class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              @change="onOpenSourceChange"
            />
            <span class="ml-2 text-sm text-gray-700">Yes</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              v-model="selectedOpenSource"
              :value="false"
              class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              @change="onOpenSourceChange"
            />
            <span class="ml-2 text-sm text-gray-700">No</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              v-model="selectedOpenSource"
              :value="null"
              class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              @change="onOpenSourceChange"
            />
            <span class="ml-2 text-sm text-gray-700">Any</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdvancedSearch } from '~/composables/useAdvancedSearch'

interface Props {
  categories: string[]
  pricingModels: string[]
  difficultyLevels: string[]
  technologies: string[]
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  searchQuery?: string
}

interface Emits {
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'reset-filters'): void
  (
    event: 'popularity-range-change',
    min: number | null,
    max: number | null
  ): void
  (event: 'date-range-change', days: number | null): void
  (event: 'open-source-change', isOpenSource: boolean | null): void
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
})
const emit = defineEmits<Emits>()

// Initialize advanced search functionality
const { getFacetedCounts } = useAdvancedSearch()

// Compute faceted counts based on current search query
const facetedCounts = computed(() => ({
  categories: getFacetedCounts('categories', props.searchQuery),
  pricingModels: getFacetedCounts('pricingModels', props.searchQuery),
  difficultyLevels: getFacetedCounts('difficultyLevels', props.searchQuery),
  technologies: getFacetedCounts('technologies', props.searchQuery),
}))

// Advanced filter values
const selectedPopularityMin = ref<number | null>(null)
const selectedPopularityMax = ref<number | null>(null)
const selectedDateRange = ref<number | null>(null)
const selectedOpenSource = ref<boolean | null>(null)

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

const onResetFilters = () => {
  // Reset basic filters
  emit('reset-filters')

  // Reset advanced filters
  selectedPopularityMin.value = null
  selectedPopularityMax.value = null
  selectedDateRange.value = null
  selectedOpenSource.value = null
}

const onPopularityRangeChange = () => {
  emit(
    'popularity-range-change',
    selectedPopularityMin.value,
    selectedPopularityMax.value
  )
}

const onDateRangeChange = () => {
  emit('date-range-change', selectedDateRange.value)
}

const onOpenSourceChange = () => {
  emit('open-source-change', selectedOpenSource.value)
}
</script>
