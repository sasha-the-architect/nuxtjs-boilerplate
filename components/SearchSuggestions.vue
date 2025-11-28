<template>
  <div
    v-if="
      suggestions.length > 0 ||
      searchHistory.length > 0 ||
      (didYouMeanSuggestions && didYouMeanSuggestions.length > 0) ||
      (relatedSearches && relatedSearches.length > 0)
    "
    class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-96 overflow-auto border border-gray-200"
    role="listbox"
    aria-label="Search suggestions"
    @keydown="handleKeyDown"
  >
    <!-- Search History Section -->
    <!-- Did You Mean Section -->
    <div v-if="didYouMeanSuggestions && didYouMeanSuggestions.length > 0">
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Did You Mean?
      </div>
      <ul>
        <li
          v-for="(suggestion, index) in didYouMeanSuggestions"
          :key="'didyoumean-' + index"
          role="option"
          :aria-selected="focusedIndex === index"
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center',
            focusedIndex === index ? 'bg-gray-100' : '',
          ]"
          @click="selectDidYouMean(suggestion)"
          @mouseenter="focusedIndex = index"
        >
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{{ suggestion }}</span>
        </li>
      </ul>
    </div>

    <div v-if="searchHistory.length > 0">
      <div
        v-if="didYouMeanSuggestions && didYouMeanSuggestions.length > 0"
        class="border-t border-gray-200 my-1"
      ></div>
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Recent Searches
      </div>
      <ul>
        <li
          v-for="(history, index) in searchHistory"
          :key="'history-' + index"
          role="option"
          :aria-selected="
            focusedIndex === index + (didYouMeanSuggestions?.length || 0)
          "
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100',
            focusedIndex === index + (didYouMeanSuggestions?.length || 0)
              ? 'bg-gray-100'
              : '',
          ]"
          @click="selectHistory(history)"
          @mouseenter="
            focusedIndex = index + (didYouMeanSuggestions?.length || 0)
          "
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
            <span>{{ history }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Search Suggestions Section -->
    <div v-if="suggestions.length > 0">
      <div
        v-if="
          searchHistory.length > 0 ||
          (didYouMeanSuggestions && didYouMeanSuggestions.length > 0)
        "
        class="border-t border-gray-200 my-1"
      ></div>
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Suggestions
      </div>
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          role="option"
          :aria-selected="
            focusedIndex ===
            searchHistory.length + (didYouMeanSuggestions?.length || 0) + index
          "
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start',
            focusedIndex ===
            searchHistory.length + (didYouMeanSuggestions?.length || 0) + index
              ? 'bg-gray-100'
              : '',
          ]"
          @click="selectSuggestion(suggestion)"
          @mouseenter="
            focusedIndex =
              searchHistory.length +
              (didYouMeanSuggestions?.length || 0) +
              index
          "
        >
          <svg
            class="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 truncate">{{
              suggestion.title
            }}</span>
            <span class="text-xs text-gray-500 truncate">{{
              suggestion.description
            }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Related Searches Section -->
    <div v-if="relatedSearches && relatedSearches.length > 0">
      <div
        v-if="
          suggestions.length > 0 ||
          searchHistory.length > 0 ||
          (didYouMeanSuggestions && didYouMeanSuggestions.length > 0)
        "
        class="border-t border-gray-200 my-1"
      ></div>
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Related Searches
      </div>
      <ul>
        <li
          v-for="(related, index) in relatedSearches"
          :key="'related-' + index"
          role="option"
          :aria-selected="
            focusedIndex ===
            searchHistory.length +
              (didYouMeanSuggestions?.length || 0) +
              suggestions.length +
              index
          "
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center',
            focusedIndex ===
            searchHistory.length +
              (didYouMeanSuggestions?.length || 0) +
              suggestions.length +
              index
              ? 'bg-gray-100'
              : '',
          ]"
          @click="selectRelatedSearch(related)"
          @mouseenter="
            focusedIndex =
              searchHistory.length +
              (didYouMeanSuggestions?.length || 0) +
              suggestions.length +
              index
          "
        >
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
          <span>{{ related }}</span>
        </li>
      </ul>
    </div>

    <!-- Clear History Button -->
    <div v-if="searchHistory.length > 0" class="border-t border-gray-200 mt-1">
      <button
        class="w-full px-4 py-2 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center"
        @click="clearHistory"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          ></path>
        </svg>
        Clear search history
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface SuggestionItem {
  id: string
  title: string
  description: string
  url: string
}

interface Props {
  suggestions: SuggestionItem[]
  searchHistory: string[]
  didYouMeanSuggestions?: string[]
  relatedSearches?: string[]
  visible: boolean
}

interface Emits {
  (event: 'select-suggestion', suggestion: SuggestionItem): void
  (event: 'select-history', history: string): void
  (event: 'select-did-you-mean', suggestion: string): void
  (event: 'select-related-search', suggestion: string): void
  (event: 'clear-history'): void
  (event: 'navigate', direction: 'up' | 'down'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const focusedIndex = ref(-1)

// Clear the focused index when suggestions are hidden
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      focusedIndex.value = -1
    }
  }
)

const selectSuggestion = (suggestion: SuggestionItem) => {
  emit('select-suggestion', suggestion)
}

const selectHistory = (history: string) => {
  emit('select-history', history)
}

const selectDidYouMean = (suggestion: string) => {
  emit('select-did-you-mean', suggestion)
}

const selectRelatedSearch = (suggestion: string) => {
  emit('select-related-search', suggestion)
}

const clearHistory = () => {
  emit('clear-history')
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const didYouMeanCount = props.didYouMeanSuggestions?.length || 0
    const historyCount = props.searchHistory.length
    const suggestionsCount = props.suggestions.length
    const relatedCount = props.relatedSearches?.length || 0
    const totalItems =
      didYouMeanCount + historyCount + suggestionsCount + relatedCount

    if (focusedIndex.value < totalItems - 1) {
      focusedIndex.value++
    } else {
      focusedIndex.value = 0
    }
    emit('navigate', 'down')
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (focusedIndex.value > 0) {
      focusedIndex.value--
    } else {
      const didYouMeanCount = props.didYouMeanSuggestions?.length || 0
      const historyCount = props.searchHistory.length
      const suggestionsCount = props.suggestions.length
      const relatedCount = props.relatedSearches?.length || 0
      const totalItems =
        didYouMeanCount + historyCount + suggestionsCount + relatedCount
      focusedIndex.value = totalItems - 1
    }
    emit('navigate', 'up')
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (focusedIndex.value >= 0) {
      const didYouMeanCount = props.didYouMeanSuggestions?.length || 0
      const historyCount = props.searchHistory.length

      if (focusedIndex.value < didYouMeanCount) {
        // It's a did you mean item
        emit(
          'select-did-you-mean',
          props.didYouMeanSuggestions![focusedIndex.value]
        )
      } else if (focusedIndex.value < didYouMeanCount + historyCount) {
        // It's a history item
        const historyIndex = focusedIndex.value - didYouMeanCount
        emit('select-history', props.searchHistory[historyIndex])
      } else {
        const totalWithoutSuggestions = didYouMeanCount + historyCount
        if (
          focusedIndex.value <
          totalWithoutSuggestions + props.suggestions.length
        ) {
          // It's a suggestion
          const suggestionIndex = focusedIndex.value - totalWithoutSuggestions
          if (suggestionIndex < props.suggestions.length) {
            emit('select-suggestion', props.suggestions[suggestionIndex])
          }
        } else {
          // It's a related search
          const relatedIndex =
            focusedIndex.value -
            totalWithoutSuggestions -
            props.suggestions.length
          if (relatedIndex < (props.relatedSearches?.length || 0)) {
            emit('select-related-search', props.relatedSearches![relatedIndex])
          }
        }
      }
    }
  } else if (event.key === 'Escape') {
    focusedIndex.value = -1
  }
}
</script>
