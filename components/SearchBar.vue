<template>
  <div class="relative w-full max-w-2xl">
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        id="search-input"
        ref="searchInputRef"
        type="search"
        :value="modelValue"
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        placeholder="Search resources by name, description, tags..."
        aria-label="Search resources"
        aria-describedby="search-results-info"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div
        v-if="modelValue"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Suggestions Dropdown -->
    <SearchSuggestions
      v-if="
        showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)
      "
      :suggestions="suggestions"
      :search-history="searchHistory"
      :visible="showSuggestions"
      @select-suggestion="handleSuggestionSelect"
      @select-history="handleHistorySelect"
      @clear-history="handleClearHistory"
      @navigate="handleNavigate"
    />

    <!-- ARIA live region for search results information -->
    <div
      id="search-results-info"
      role="status"
      aria-live="polite"
      class="sr-only"
    >
      Search results will be updated automatically
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchSuggestions from '~/components/SearchSuggestions.vue'
import { useResources } from '~/composables/useResources'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'

interface Props {
  modelValue: string
  debounceTime?: number
  enableAdvancedFeatures?: boolean
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  debounceTime: 300,
  enableAdvancedFeatures: true,
})
const emit = defineEmits<Emits>()

// Reactive variables
const searchInputRef = ref<HTMLInputElement>()
const inputTimeout = ref<number>()
const debouncedQuery = ref('')
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
const searchHistory = ref<string[]>([])

// Use the resources composable
const { resources } = useResourceData()
const {
  getAdvancedSuggestions,
  addToSearchHistory,
  searchHistory: advancedSearchHistory,
} = useAdvancedResourceSearch(resources)

// Use the basic resources composable for fallback
const {
  getSuggestions: getBasicSuggestions,
  getSearchHistory: getBasicSearchHistory,
  addSearchToHistory: addBasicSearchToHistory,
  clearSearchHistory: clearBasicSearchHistory,
} = useResources()

// Load search history on component mount
onMounted(() => {
  searchHistory.value = advancedSearchHistory.value
})

// Handle input with debounce
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Update the model value immediately
  emit('update:modelValue', value)

  // Debounce the search to avoid constant updates
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }

  inputTimeout.value = setTimeout(() => {
    debouncedQuery.value = value
    updateSuggestions(value)
    emit('search', value)
  }, props.debounceTime)
}

// Update suggestions based on input
const updateSuggestions = (query: string) => {
  if (query && query.length > 1) {
    // Use advanced suggestions if enabled, otherwise use basic suggestions
    const suggestionsData = props.enableAdvancedFeatures
      ? getAdvancedSuggestions(query, 5)
      : getBasicSuggestions(query, 5)

    suggestions.value = suggestionsData.map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      description:
        resource.description.substring(0, 100) +
        (resource.description.length > 100 ? '...' : ''),
      url: resource.url,
    }))
  } else {
    suggestions.value = []
  }
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
  suggestions.value = []
  showSuggestions.value = false
}

const handleFocus = () => {
  // Update search history when input is focused
  searchHistory.value = advancedSearchHistory.value
  showSuggestions.value = true
}

const handleBlur = () => {
  // Use a timeout to allow for click events on suggestions
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showSuggestions.value = false
  } else if (event.key === 'Enter') {
    if (props.modelValue) {
      addToSearchHistory(props.modelValue)
    }
  }
}

const handleSuggestionSelect = (suggestion: any) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addToSearchHistory(suggestion.title)
  showSuggestions.value = false
}

const handleHistorySelect = (history: string) => {
  emit('update:modelValue', history)
  emit('search', history)
  addToSearchHistory(history)
  showSuggestions.value = false
}

const handleClearHistory = () => {
  // Clear both advanced and basic search history
  // Since we're using advanced search, we'll just update our local ref
  searchHistory.value = []
}

const handleNavigate = (direction: 'up' | 'down') => {
  // This is handled by the SearchSuggestions component
  // but we can add additional logic here if needed
}

// Expose focus method to parent components
defineExpose({
  focus: () => searchInputRef.value?.focus(),
})
</script>
