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
        id="advanced-search-input"
        ref="searchInputRef"
        type="search"
        :value="modelValue"
        class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        placeholder="Search resources by name, description, tags... (use AND, OR, NOT, quotes for advanced search)"
        aria-label="Advanced search resources"
        aria-describedby="search-results-info"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div
        v-if="showAdvancedOptions"
        class="absolute inset-y-0 right-0 flex items-center pr-10"
      >
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Show advanced search options"
          @click="toggleAdvancedOptions"
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            ></path>
          </svg>
        </button>
      </div>
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

    <!-- Advanced Search Options Panel -->
    <div
      v-if="showAdvancedOptions"
      class="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Search Operators
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              @click="insertOperator('AND')"
            >
              AND
            </button>
            <button
              type="button"
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              @click="insertOperator('OR')"
            >
              OR
            </button>
            <button
              type="button"
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              @click="insertOperator('NOT')"
            >
              NOT
            </button>
            <button
              type="button"
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              @click="insertQuotes"
            >
              "phrase"
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Saved Searches
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="savedSearch in getSavedSearches"
              :key="savedSearch.id"
              type="button"
              class="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
              @click="applySavedSearch(savedSearch)"
            >
              {{ savedSearch.name }}
            </button>
          </div>
        </div>
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
import { useSavedSearches } from '~/composables/useSavedSearches'

interface Props {
  modelValue: string
  debounceTime?: number
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use the resources composable
const {
  getSuggestions,
  getSearchHistory,
  addSearchToHistory,
  clearSearchHistory,
} = useResources()

// Use the saved searches composable
const {
  savedSearches,
  addSavedSearch,
  removeSavedSearch,
  clearSavedSearches,
  getSavedSearches,
} = useSavedSearches()

// Refs
const searchInputRef = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const showAdvancedOptions = ref(false)
const suggestions = ref<any[]>([])
const searchHistory = ref<string[]>([])
const debouncedQuery = ref('')
const inputTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
// Load search history on component mount
onMounted(() => {
  searchHistory.value = getSearchHistory()
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
  }, props.debounceTime || 300)
}

// Update suggestions based on input
const updateSuggestions = (query: string) => {
  if (query && query.length > 1) {
    // Get search suggestions
    suggestions.value = getSuggestions(query, 5).map((resource: any) => ({
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

const toggleAdvancedOptions = () => {
  showAdvancedOptions.value = !showAdvancedOptions.value
}

const handleFocus = () => {
  // Update search history when input is focused
  searchHistory.value = getSearchHistory()
  showSuggestions.value = true
}

const handleBlur = () => {
  // Use a timeout to allow for click events on suggestions or advanced options
  setTimeout(() => {
    if (!showAdvancedOptions.value) {
      showSuggestions.value = false
    }
  }, 200)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showSuggestions.value = false
    showAdvancedOptions.value = false
  } else if (event.key === 'Enter') {
    if (props.modelValue) {
      addSearchToHistory(props.modelValue)
    }
  } else if (event.ctrlKey && event.key === 'Enter') {
    // Save current search as a new saved search
    saveCurrentSearch()
  }
}

const insertOperator = (operator: string) => {
  const input = searchInputRef.value
  if (input) {
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const currentValue = props.modelValue
    const newValue =
      currentValue.substring(0, start) +
      ` ${operator} ` +
      currentValue.substring(end)

    emit('update:modelValue', newValue)
    input.focus()
    // Set cursor position after the inserted operator
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + operator.length + 2
    }, 0)
  }
}

const insertQuotes = () => {
  const input = searchInputRef.value
  if (input) {
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const selectedText = props.modelValue.substring(start, end)
    const currentValue = props.modelValue
    let newValue = currentValue

    if (start !== end) {
      // Replace selected text with quoted version
      newValue =
        currentValue.substring(0, start) +
        `"${selectedText}"` +
        currentValue.substring(end)
    } else {
      // Insert empty quotes and position cursor inside
      newValue =
        currentValue.substring(0, start) + '""' + currentValue.substring(end)
    }

    emit('update:modelValue', newValue)
    input.focus()
    // Position cursor inside the quotes
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + 1
    }, 0)
  }
}

const saveCurrentSearch = () => {
  if (props.modelValue.trim()) {
    const name = props.modelValue.substring(0, 30) + (props.modelValue.length > 30 ? '...' : '')
    addSavedSearch(name, props.modelValue)
  }
}

    // Add to beginning of array
    savedSearches.value.unshift(newSearch)

    // Keep only the 10 most recent searches
    if (savedSearches.value.length > 10) {
      savedSearches.value = savedSearches.value.slice(0, 10)
    }

    saveSearches(savedSearches.value)
  }
}

const applySavedSearch = (savedSearch: any) => {
  emit('update:modelValue', savedSearch.query)
  emit('search', savedSearch.query)
  showSuggestions.value = false
  showAdvancedOptions.value = false
}

const handleSuggestionSelect = (suggestion: any) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addSearchToHistory(suggestion.title)
  showSuggestions.value = false
}

const handleHistorySelect = (history: string) => {
  emit('update:modelValue', history)
  emit('search', history)
  showSuggestions.value = false
}

const handleClearHistory = () => {
  clearSearchHistory()
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
