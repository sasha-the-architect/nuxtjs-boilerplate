<template>
  <div class="relative w-full max-w-2xl">
    <!-- Search input with operator help tooltip -->
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

      <!-- Search input field -->
      <input
        id="advanced-search-input"
        ref="searchInputRef"
        type="search"
        :value="modelValue"
        :class="[
          'block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent',
          isValid
            ? ''
            : 'border-red-500 focus:ring-red-500 focus:border-red-500',
        ]"
        placeholder="Search resources with operators (e.g., 'AI AND tools' or 'AI OR machine')"
        aria-label="Advanced search resources"
        aria-describedby="advanced-search-results-info"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Validation indicator -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-10">
        <div v-if="!isValid && modelValue.length > 0" class="text-red-500">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div
          v-else-if="isValid && modelValue.length > 0"
          class="text-green-500"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <!-- Clear button -->
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

    <!-- Operator help tooltip -->
    <div
      v-if="showHelpTooltip"
      class="absolute z-50 mt-2 w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg"
      style="top: 100%; left: 0"
      role="tooltip"
    >
      <div class="flex justify-between items-start">
        <h3 class="font-bold text-gray-800">Advanced Search Operators</h3>
        <button
          @click="showHelpTooltip = false"
          class="text-gray-500 hover:text-gray-700"
          aria-label="Close help"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="mt-2 text-sm text-gray-600">
        <p>
          <span class="font-semibold">AND:</span> Finds resources containing
          both terms (e.g., "AI AND tools")
        </p>
        <p class="mt-1">
          <span class="font-semibold">OR:</span> Finds resources containing
          either term (e.g., "AI OR machine")
        </p>
        <p class="mt-1">
          <span class="font-semibold">NOT:</span> Excludes resources containing
          the term (e.g., "AI NOT beginners")
        </p>
        <p class="mt-1">
          <span class="font-semibold">Quotes:</span> Search exact phrases (e.g.,
          "machine learning")
        </p>
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
      id="advanced-search-results-info"
      role="status"
      aria-live="polite"
      class="sr-only"
    >
      Search results will be updated automatically
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SearchSuggestions from '~/components/SearchSuggestions.vue'
import { useResources } from '~/composables/useResources'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'

// Define EventListener type for TypeScript
type EventListener = (evt: Event) => void

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
const searchHistory = ref<any[]>([])
const showHelpTooltip = ref(false)

// Use the resources composable
const { resources } = useResourceData()
const {
  getAdvancedSuggestions,
  addToSearchHistory,
  searchHistory: advancedSearchHistory,
  parseQuery,
} = useAdvancedResourceSearch(resources)

// Use the enhanced search history composable
const {
  searchHistory: enhancedSearchHistory,
  getRecentSearches,
  addSearchToHistory: addEnhancedSearchToHistory,
  clearSearchHistory: clearEnhancedSearchHistory,
  removeSearchFromHistory: removeEnhancedSearchFromHistory,
} = useSearchHistory()

// Use the basic resources composable for fallback
const {
  getSuggestions: getBasicSuggestions,
  getSearchHistory: getBasicSearchHistory,
  addSearchToHistory: addBasicSearchToHistory,
  clearSearchHistory: clearBasicSearchHistory,
} = useResources()

// Validate search query syntax
const isValid = computed(() => {
  if (!props.modelValue) return true

  try {
    // Try to parse the query to validate syntax
    const parsed = parseQuery(props.modelValue)
    // Basic validation - ensure operators are properly formatted
    const query = props.modelValue.toLowerCase()
    const operators = ['and', 'or', 'not']

    // Check for operators that don't have terms before or after
    for (const op of operators) {
      const regex = new RegExp(`^${op}\\s|\\s${op}\\s|\\s${op}$`, 'i')
      if (regex.test(query)) {
        // If operator is at start or end without terms, it's invalid
        if (
          query.trim().toLowerCase().startsWith(op) ||
          query.trim().toLowerCase().endsWith(op)
        ) {
          if (query.trim().split(/\s+/).length < 2) {
            return false
          }
        }
      }
    }

    // Check for balanced quotes
    const quoteCount = (props.modelValue.match(/"/g) || []).length
    if (quoteCount % 2 !== 0) {
      return false
    }

    return true
  } catch (e) {
    return false
  }
})

// Load search history on component mount
onMounted(() => {
  searchHistory.value =
    enhancedSearchHistory?.value ||
    advancedSearchHistory.value.map(query => ({
      query,
      timestamp: new Date(),
      count: 1,
    }))
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
  searchHistory.value =
    enhancedSearchHistory?.value ||
    advancedSearchHistory.value.map(query => ({
      query,
      timestamp: new Date(),
      count: 1,
    }))
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
    showHelpTooltip.value = false
  } else if (event.key === 'Enter') {
    if (props.modelValue) {
      addEnhancedSearchToHistory(props.modelValue)
    }
  } else if (event.key === '?' && event.shiftKey) {
    // Show help tooltip when user presses Shift + ?
    event.preventDefault()
    showHelpTooltip.value = true
  } else if (event.key === 'F1') {
    // Show help tooltip when user presses F1
    event.preventDefault()
    showHelpTooltip.value = true
  }
}

const handleSuggestionSelect = (suggestion: any) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addEnhancedSearchToHistory(suggestion.title)
  showSuggestions.value = false
}

const handleHistorySelect = (history: string) => {
  emit('update:modelValue', history)
  emit('search', history)
  addEnhancedSearchToHistory(history)
  showSuggestions.value = false
}

const handleClearHistory = () => {
  // Clear enhanced search history
  clearEnhancedSearchHistory()
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

// Listen for saved search events to show notifications
if (typeof window !== 'undefined') {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    // Create a custom event to trigger toast notifications
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { message, type },
      })
    )
  }

  const savedSearchAddedHandler = (event: CustomEvent) => {
    const { name, query } = event.detail
    showToast(`Saved search "${name}" successfully!`, 'success')
  }

  const savedSearchUpdatedHandler = (event: CustomEvent) => {
    const { name, query } = event.detail
    showToast(`Updated saved search "${name}"!`, 'success')
  }

  const savedSearchRemovedHandler = (event: CustomEvent) => {
    const { name, query } = event.detail
    showToast(`Removed saved search "${name}".`, 'info')
  }

  // Add event listeners
  window.addEventListener('saved-search-added', savedSearchAddedHandler)
  window.addEventListener('saved-search-updated', savedSearchUpdatedHandler)
  window.addEventListener('saved-search-removed', savedSearchRemovedHandler)

  // Clean up event listeners on component unmount
  onUnmounted(() => {
    window.removeEventListener('saved-search-added', savedSearchAddedHandler)
    window.removeEventListener(
      'saved-search-updated',
      savedSearchUpdatedHandler
    )
    window.removeEventListener(
      'saved-search-removed',
      savedSearchRemovedHandler
    )
  })
}

// Watch for changes in enhanced search history
watch(enhancedSearchHistory, newHistory => {
  searchHistory.value = newHistory || []
})
</script>
