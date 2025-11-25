<template>
  <div class="tag-selector">
    <div class="tag-input-container">
      <input
        v-model="searchInput"
        type="text"
        placeholder="Search or add tags..."
        class="tag-input"
        @input="handleSearchInput"
        @keydown.enter="handleAddTag"
        @keydown.backspace="handleBackspace"
        @focus="showSuggestions = true"
        @blur="handleBlur"
      />
      <div v-if="selectedTags.length > 0" class="tag-chips">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="tag-chip"
          :tabindex="0"
          @keydown.delete="removeTag(tag)"
        >
          {{ tag }}
          <button
            type="button"
            class="remove-tag-btn"
            :aria-label="`Remove tag ${tag}`"
            @click="removeTag(tag)"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Tag suggestions dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="suggestions-dropdown"
    >
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion"
        :ref="el => setSuggestionRef(el, index)"
        :class="[
          'suggestion-item',
          { 'suggestion-item--active': activeIndex === index },
        ]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="activeIndex = index"
      >
        {{ suggestion }}
        <span
          v-if="getTagDescription(suggestion)"
          class="suggestion-description"
        >
          {{ getTagDescription(suggestion) }}
        </span>
      </div>
    </div>

    <!-- Hierarchical tag tree view -->
    <div v-if="showTagTree" class="tag-tree">
      <div v-for="tag in hierarchicalTags" :key="tag.id" class="tag-tree-item">
        <div
          class="tag-tree-node"
          :class="{
            'tag-tree-node--selected': selectedTags.includes(tag.name),
          }"
        >
          <button
            v-if="tag.children && tag.children.length > 0"
            class="toggle-children-btn"
            @click="toggleTagNode(tag.id)"
          >
            {{ expandedNodes.includes(tag.id) ? '▼' : '►' }}
          </button>
          <span class="tag-name" @click="toggleTagSelection(tag.name)">
            {{ tag.name }}
          </span>
          <span v-if="tag.description" class="tag-description">
            {{ tag.description }}
          </span>
        </div>

        <!-- Render children if expanded -->
        <div
          v-if="
            tag.children &&
            tag.children.length > 0 &&
            expandedNodes.includes(tag.id)
          "
          class="tag-children"
        >
          <div
            v-for="child in tag.children"
            :key="child.id"
            class="tag-tree-item tag-tree-item--child"
          >
            <div
              class="tag-tree-node"
              :class="{
                'tag-tree-node--selected': selectedTags.includes(child.name),
              }"
            >
              <span class="tag-name" @click="toggleTagSelection(child.name)">
                {{ child.name }}
              </span>
              <span v-if="child.description" class="tag-description">
                {{ child.description }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { HierarchicalTag } from '~/types/resource'

interface Props {
  modelValue: string[]
  allTags: string[]
  hierarchicalTags?: HierarchicalTag[]
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  hierarchicalTags: () => [],
})

const emit = defineEmits<Emits>()

// Reactive state
const searchInput = ref('')
const showSuggestions = ref(false)
const showTagTree = ref(false)
const selectedTags = ref<string[]>(props.modelValue || [])
const activeIndex = ref(-1)
const expandedNodes = ref<string[]>([])
const suggestionRefs = ref<HTMLElement[]>([])

// Computed properties
const filteredSuggestions = computed(() => {
  if (!searchInput.value.trim()) {
    return props.allTags
  }

  const searchTerm = searchInput.value.toLowerCase()
  return props.allTags.filter(
    tag =>
      tag.toLowerCase().includes(searchTerm) &&
      !selectedTags.value.includes(tag)
  )
})

// Methods
const handleSearchInput = () => {
  activeIndex.value = -1
}

const handleAddTag = () => {
  if (
    searchInput.value.trim() &&
    !selectedTags.value.includes(searchInput.value.trim())
  ) {
    addTag(searchInput.value.trim())
    searchInput.value = ''
  }
}

const addTag = (tag: string) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value = [...selectedTags.value, tag]
    emit('update:modelValue', selectedTags.value)
  }
}

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
  emit('update:modelValue', selectedTags.value)
}

const handleBackspace = (event: KeyboardEvent) => {
  if (
    !searchInput.value &&
    selectedTags.value.length > 0 &&
    event.key === 'Backspace'
  ) {
    removeTag(selectedTags.value[selectedTags.value.length - 1])
  }
}

const handleBlur = () => {
  // Small delay to allow click events to register
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectSuggestion = (suggestion: string) => {
  addTag(suggestion)
  searchInput.value = ''
  showSuggestions.value = false
}

const setSuggestionRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    suggestionRefs.value[index] = el
  }
}

const getTagDescription = (tagName: string): string | null => {
  // Find tag in hierarchical tags if available
  if (props.hierarchicalTags && props.hierarchicalTags.length > 0) {
    const tag = props.hierarchicalTags.find(t => t.name === tagName)
    return tag ? tag.description || null : null
  }
  return null
}

const toggleTagSelection = (tagName: string) => {
  if (selectedTags.value.includes(tagName)) {
    removeTag(tagName)
  } else {
    addTag(tagName)
  }
}

const toggleTagNode = (tagId: string) => {
  if (expandedNodes.value.includes(tagId)) {
    expandedNodes.value = expandedNodes.value.filter(id => id !== tagId)
  } else {
    expandedNodes.value = [...expandedNodes.value, tagId]
  }
}

// Keyboard navigation
const onKeyDown = (event: KeyboardEvent) => {
  if (!showSuggestions.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = Math.min(
        activeIndex.value + 1,
        filteredSuggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, -1)
      break
    case 'Enter':
      if (
        activeIndex.value >= 0 &&
        filteredSuggestions.value[activeIndex.value]
      ) {
        selectSuggestion(filteredSuggestions.value[activeIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      break
  }
}

// Watch for changes in modelValue to keep selectedTags in sync
watch(
  () => props.modelValue,
  newVal => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedTags.value)) {
      selectedTags.value = newVal || []
    }
  }
)

// Add keyboard event listener
onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.tag-selector {
  position: relative;
  width: 100%;
}

.tag-input-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background-color: white;
  min-height: 42px;
}

.tag-input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  padding: 0.25rem;
  font-size: 0.875rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.remove-tag-btn {
  margin-left: 0.25rem;
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-weight: bold;
  padding: 0 0.125rem;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item--active {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.suggestion-description {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.tag-tree {
  margin-top: 1rem;
}

.tag-tree-item {
  margin-bottom: 0.25rem;
}

.tag-tree-item--child {
  margin-left: 1.5rem;
}

.tag-tree-node {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
}

.tag-tree-node--selected {
  background-color: #e0e7ff;
  border-radius: 0.25rem;
  padding: 0.25rem;
}

.toggle-children-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.25rem;
  font-size: 0.75rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-name {
  cursor: pointer;
  font-weight: 500;
  margin-right: 0.5rem;
}

.tag-description {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
