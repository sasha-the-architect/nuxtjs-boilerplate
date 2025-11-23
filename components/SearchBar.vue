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
        :class="{ 'rounded-b-none': showSuggestions }"
        placeholder="Search resources by name, description, tags..."
        aria-label="Search resources"
        aria-describedby="search-results-info"
        aria-expanded="true"
        aria-haspopup="listbox"
        :aria-activedescendant="
          activeSuggestionIndex >= 0
            ? `suggestion-${activeSuggestionIndex}`
            : undefined
        "
        @input="handleInput"
        @keydown="handleKeydown"
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

    <!-- Search suggestions dropdown -->
    <div
      v-if="
        showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)
      "
      class="absolute z-10 w-full mt-0.5 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
      role="listbox"
      aria-label="Search suggestions"
    >
      <!-- Search History Section -->
      <div
        v-if="searchHistory.length > 0 && !modelValue"
        class="py-2 border-b border-gray-200"
      >
        <div
          class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          Recent Searches
        </div>
        <ul>
          <li
            v-for="(historyItem, index) in searchHistory"
            :key="'history-' + index"
            :id="`suggestion-${index}`"
            role="option"
            :class="[
              'px-4 py-2 cursor-pointer hover:bg-gray-100',
              activeSuggestionIndex === index ? 'bg-gray-100' : '',
            ]"
            @click="selectHistoryItem(historyItem)"
            @mouseenter="activeSuggestionIndex = index"
          >
            <div class="flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{{ historyItem }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Search Suggestions Section -->
      <div v-if="suggestions.length > 0" class="py-2">
        <div
          class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          Suggestions
        </div>
        <ul>
          <li
            v-for="(suggestion, index) in suggestions"
            :key="index"
            :id="`suggestion-${searchHistory.length + index}`"
            role="option"
            :class="[
              'px-4 py-2 cursor-pointer hover:bg-gray-100',
              activeSuggestionIndex === searchHistory.length + index
                ? 'bg-gray-100'
                : '',
            ]"
            @click="selectSuggestion(suggestion)"
            @mouseenter="activeSuggestionIndex = searchHistory.length + index"
          >
            <div v-html="highlightMatch(suggestion.title, modelValue)"></div>
            <div
              class="text-sm text-gray-500 mt-1"
              v-html="highlightMatch(suggestion.description, modelValue)"
            ></div>
          </li>
        </ul>
      </div>

      <!-- Clear History Option -->
      <div
        v-if="searchHistory.length > 0 && !modelValue"
        class="px-4 py-2 border-t border-gray-200"
      >
        <button
          class="text-sm text-gray-600 hover:text-gray-900 w-full text-left"
          @click="clearSearchHistory"
        >
          Clear search history
        </button>
      </div>
    </div>

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
import { ref, computed, nextTick, onMounted } from 'vue'

interface Resource {
  id: string
  title: string
  description: string
  benefits: string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: string[]
  technology: string[]
  dateAdded: string
  popularity: number
  icon?: string
}

interface Props {
  modelValue: string
  suggestions?: Resource[]
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
  (event: 'select-suggestion', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
})

const emit = defineEmits<Emits>()

// Refs
const searchInputRef = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const activeSuggestionIndex = ref(-1)
const searchHistory = ref<string[]>([])

// Load search history from localStorage on component mount
onMounted(() => {
  const savedHistory = localStorage.getItem('searchHistory')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch {
      searchHistory.value = []
    }
  }
})

// Filter suggestions based on current input
const filteredSuggestions = computed(() => {
  if (!props.modelValue.trim()) return []

  return props.suggestions
    .slice(0, 5) // Limit to 5 suggestions
    .filter(
      suggestion =>
        suggestion.title
          .toLowerCase()
          .includes(props.modelValue.toLowerCase()) ||
        suggestion.description
          .toLowerCase()
          .includes(props.modelValue.toLowerCase()) ||
        suggestion.tags.some(tag =>
          tag.toLowerCase().includes(props.modelValue.toLowerCase())
        )
    )
})

// If we have input, show filtered suggestions; otherwise show search history
const suggestions = computed(() => {
  return props.modelValue.trim() ? filteredSuggestions.value : []
})

// Handle input with debouncing
let inputTimeout: NodeJS.Timeout

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)

  // Clear previous timeout
  if (inputTimeout) {
    clearTimeout(inputTimeout)
  }

  // Set new timeout for debounced search
  inputTimeout = setTimeout(() => {
    emit('search', target.value)
  }, 300)
}

const handleFocus = () => {
  showSuggestions.value = true
  activeSuggestionIndex.value = -1
}

const handleBlur = () => {
  // Delay hiding suggestions to allow click events to register
  setTimeout(() => {
    showSuggestions.value = false
    activeSuggestionIndex.value = -1
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle arrow keys for navigation
  if (event.key === 'ArrowDown') {
    event.preventDefault()

    const totalSuggestions = props.modelValue
      ? suggestions.value.length
      : searchHistory.value.length
    if (activeSuggestionIndex.value < totalSuggestions - 1) {
      activeSuggestionIndex.value++
    } else {
      activeSuggestionIndex.value = 0 // Wrap around
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (activeSuggestionIndex.value > 0) {
      activeSuggestionIndex.value--
    } else {
      const totalSuggestions = props.modelValue
        ? suggestions.value.length
        : searchHistory.value.length
      activeSuggestionIndex.value = totalSuggestions - 1 // Wrap around
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()

    if (activeSuggestionIndex.value >= 0) {
      if (props.modelValue) {
        // Select from suggestions
        if (activeSuggestionIndex.value < suggestions.value.length) {
          selectSuggestion(suggestions.value[activeSuggestionIndex.value])
        }
      } else {
        // Select from history
        if (activeSuggestionIndex.value < searchHistory.value.length) {
          selectHistoryItem(searchHistory.value[activeSuggestionIndex.value])
        }
      }
    } else {
      // Submit current search if no suggestion selected
      emit('search', props.modelValue)
    }
  } else if (event.key === 'Escape') {
    showSuggestions.value = false
    activeSuggestionIndex.value = -1
    if (searchInputRef.value) {
      searchInputRef.value.blur()
    }
  }
}

const selectSuggestion = (suggestion: Resource) => {
  const searchText = suggestion.title
  emit('update:modelValue', searchText)
  emit('search', searchText)
  emit('select-suggestion', searchText)
  addToSearchHistory(searchText)
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
}

const selectHistoryItem = (historyItem: string) => {
  emit('update:modelValue', historyItem)
  emit('search', historyItem)
  emit('select-suggestion', historyItem)
  // Move to top of history
  moveHistoryItemToFront(historyItem)
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
}

const addToSearchHistory = (query: string) => {
  if (!query.trim()) return

  // Remove if already exists to avoid duplicates
  const index = searchHistory.value.indexOf(query)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }

  // Add to beginning of array
  searchHistory.value.unshift(query)

  // Limit to 10 items
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }

  // Save to localStorage
  try {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  } catch {
    // If localStorage fails, continue without saving
  }
}

const moveHistoryItemToFront = (query: string) => {
  const index = searchHistory.value.indexOf(query)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
    searchHistory.value.unshift(query)

    try {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
    } catch {
      // If localStorage fails, continue without saving
    }
  }
}

const clearSearchHistory = () => {
  searchHistory.value = []
  try {
    localStorage.removeItem('searchHistory')
  } catch {
    // If localStorage fails, continue without clearing
  }
  showSuggestions.value = false
}

// Function to highlight matching text
const highlightMatch = (text: string, query: string) => {
  if (!query) return text

  // Escape special regex characters in query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  return text.replace(
    regex,
    '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
  )
}
</script>
