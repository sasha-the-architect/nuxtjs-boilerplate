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
          v-for="category in categories"
          :key="category"
          class="flex items-center"
          :tabindex="0"
          @keydown.enter.prevent="toggleCategory(category)"
          @keydown.space.prevent="toggleCategory(category)"
        >
          <input
            type="checkbox"
            :value="category"
            :checked="selectedCategories.includes(category)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            :aria-label="`Filter by ${category}`"
            @change="toggleCategory(category)"
          />
          <span class="ml-2 text-sm text-gray-800">{{ category }}</span>
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
          v-for="pricingModel in pricingModels"
          :key="pricingModel"
          class="flex items-center"
          :tabindex="0"
          @keydown.enter.prevent="togglePricingModel(pricingModel)"
          @keydown.space.prevent="togglePricingModel(pricingModel)"
        >
          <input
            type="checkbox"
            :value="pricingModel"
            :checked="selectedPricingModels.includes(pricingModel)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            :aria-label="`Filter by ${pricingModel}`"
            @change="togglePricingModel(pricingModel)"
          />
          <span class="ml-2 text-sm text-gray-800">{{ pricingModel }}</span>
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
          v-for="difficulty in difficultyLevels"
          :key="difficulty"
          class="flex items-center"
          :tabindex="0"
          @keydown.enter.prevent="toggleDifficultyLevel(difficulty)"
          @keydown.space.prevent="toggleDifficultyLevel(difficulty)"
        >
          <input
            type="checkbox"
            :value="difficulty"
            :checked="selectedDifficultyLevels.includes(difficulty)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            :aria-label="`Filter by ${difficulty}`"
            @change="toggleDifficultyLevel(difficulty)"
          />
          <span class="ml-2 text-sm text-gray-800">{{ difficulty }}</span>
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
          v-for="technology in technologies"
          :key="technology"
          class="flex items-center"
          :tabindex="0"
          @keydown.enter.prevent="toggleTechnology(technology)"
          @keydown.space.prevent="toggleTechnology(technology)"
        >
          <input
            type="checkbox"
            :value="technology"
            :checked="selectedTechnologies.includes(technology)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            :aria-label="`Filter by ${technology}`"
            @change="toggleTechnology(technology)"
          />
          <span class="ml-2 text-sm text-gray-800">{{ technology }}</span>
        </label>
      </div>
    </div>

    <!-- Hierarchical Tags Filter -->
    <div>
      <h4 class="text-sm font-medium text-gray-900 mb-3">Tags</h4>
      <TagSelector
        v-model="selectedHierarchicalTags"
        @update:model-value="onUpdateTags"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TagSelector from '~/components/TagSelector.vue'

interface Props {
  categories: string[]
  pricingModels: string[]
  difficultyLevels: string[]
  technologies: string[]
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  selectedTags?: string[] // Added for hierarchical tags
}

interface Emits {
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void // Added for hierarchical tags
  (event: 'reset-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedTags: () => [],
})
const emit = defineEmits<Emits>()

// Local state for hierarchical tags
const selectedHierarchicalTags = ref<string[]>(props.selectedTags || [])

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

// Handle hierarchical tag selection changes
const onUpdateTags = (tags: string[]) => {
  selectedHierarchicalTags.value = tags
  // Emit individual events for each tag added/removed
  // For now, we'll just emit the complete list
  tags.forEach(tag => {
    emit('toggle-tag', tag)
  })
}

const onResetFilters = () => {
  // Reset hierarchical tags as well
  selectedHierarchicalTags.value = []
  emit('reset-filters')
}
</script>
