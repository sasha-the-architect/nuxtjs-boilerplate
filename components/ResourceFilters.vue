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
    <div>
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

    <!-- Popularity Range Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Popularity</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-600 mb-1"
            >Min: {{ selectedPopularityRange[0] }}</label
          >
          <input
            type="range"
            min="0"
            max="100"
            :value="selectedPopularityRange[0]"
            class="w-full"
            @input="onMinPopularityChange"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1"
            >Max: {{ selectedPopularityRange[1] }}</label
          >
          <input
            type="range"
            min="0"
            max="100"
            :value="selectedPopularityRange[1]"
            class="w-full"
            @input="onMaxPopularityChange"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>

    <!-- Date Added Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Date Added</h4>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-600 mb-1">From</label>
          <input
            type="date"
            :value="selectedDateRange.start"
            class="w-full p-2 border border-gray-300 rounded text-sm"
            @change="onDateStartChange"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">To</label>
          <input
            type="date"
            :value="selectedDateRange.end"
            class="w-full p-2 border border-gray-300 rounded text-sm"
            @change="onDateEndChange"
          />
        </div>
        <!-- Preset date range buttons -->
        <div class="flex flex-wrap gap-1 mt-2">
          <button
            type="button"
            class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            @click="setDatePreset('lastWeek')"
          >
            Last Week
          </button>
          <button
            type="button"
            class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            @click="setDatePreset('lastMonth')"
          >
            Last Month
          </button>
          <button
            type="button"
            class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            @click="setDatePreset('lastYear')"
          >
            Last Year
          </button>
        </div>
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
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  selectedTags: string[]
  selectedPopularityRange?: [number, number]
  selectedDateRange?: {
    start?: string
    end?: string
  }
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
  (event: 'set-popularity-range', range: [number, number]): void
  (event: 'set-date-range', range: { start?: string; end?: string }): void
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
  selectedPopularityRange: () => [0, 100] as [number, number],
  selectedDateRange: () => ({}),
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

const setPopularityRange = (min: number, max: number) => {
  emit('set-popularity-range', [min, max])
}

const setDateRange = (start?: string, end?: string) => {
  emit('set-date-range', { start, end })
}

const onResetFilters = () => {
  emit('reset-filters')
}

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

const onMinPopularityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const min = parseInt(target.value)
  setPopularityRange(min, props.selectedPopularityRange[1])
}

const onMaxPopularityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const max = parseInt(target.value)
  setPopularityRange(props.selectedPopularityRange[0], max)
}

const onDateStartChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newStart = target.value
  setDateRange(newStart, props.selectedDateRange.end)
}

const onDateEndChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newEnd = target.value
  setDateRange(props.selectedDateRange.start, newEnd)
}

const setDatePreset = (preset: 'lastWeek' | 'lastMonth' | 'lastYear') => {
  const endDate = new Date()
  let startDate = new Date()

  switch (preset) {
    case 'lastWeek':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'lastMonth':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case 'lastYear':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]
  setDateRange(startStr, endStr)
}
</script>
