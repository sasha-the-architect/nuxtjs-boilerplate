<template>
  <div class="tag-tree-node">
    <div
      class="tag-item flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer"
      :class="{
        'bg-blue-50': isSelected,
        'pl-[calc(1rem_*_level_+_1rem)]': level > 0,
      }"
      @click="toggleTag"
    >
      <!-- Expand/Collapse icon for tags with children -->
      <span
        v-if="tag.hasChildren"
        class="mr-2 cursor-pointer text-gray-500 hover:text-gray-700"
        @click.stop="toggleExpanded"
      >
        <svg
          v-if="expanded"
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
      </span>

      <!-- Empty space for tags without children to maintain alignment -->
      <span v-else class="mr-2 w-4"></span>

      <!-- Checkbox -->
      <input
        :id="`tag-${tag.id}`"
        v-model="isSelected"
        type="checkbox"
        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        @change="toggleTag"
      />

      <!-- Tag label -->
      <label
        :for="`tag-${tag.id}`"
        class="ml-2 text-sm font-medium text-gray-700 flex-1"
        :class="{ 'font-semibold': tag.level === 0 }"
      >
        {{ tag.name }}
        <span
          v-if="tag.path && tag.path.length > 1"
          class="text-xs text-gray-500 ml-1"
        >
          ({{ tag.path.slice(0, -1).join(' > ') }})
        </span>
      </label>
    </div>

    <!-- Children tags when expanded -->
    <ul v-if="expanded && tag.children && tag.children.length > 0" class="ml-4">
      <li
        v-for="child in tag.children"
        :key="child.id"
        class="border-l border-gray-200"
      >
        <TagTreeNode
          :tag="enhanceTagWithHierarchy(child, level + 1)"
          :selected-tags="selectedTags"
          :level="level + 1"
          @toggle-tag="$emit('toggleTag', $event)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { TagWithHierarchy } from '~/types/hierarchicalTags'
import { useHierarchicalTags } from '~/composables/useHierarchicalTags'

interface Props {
  tag: TagWithHierarchy
  selectedTags: TagWithHierarchy[]
  level: number
}

interface Emits {
  (e: 'toggleTag', tagId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const expanded = ref(false)

// Check if tag is selected
const isSelected = computed({
  get() {
    return props.selectedTags.some(t => t.id === props.tag.id)
  },
  set(value: boolean) {
    if (value !== isSelected.value) {
      emit('toggleTag', props.tag.id)
    }
  },
})

const toggleTag = () => {
  emit('toggleTag', props.tag.id)
}

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// Enhance a basic tag with hierarchy information
const enhanceTagWithHierarchy = (tag: any, level: number): TagWithHierarchy => {
  // In a real implementation, we'd look up the full hierarchy info
  // For now, we'll create basic hierarchy info
  return {
    ...tag,
    path: tag.path || [tag.name],
    level,
    hasChildren: !!(tag.children && tag.children.length > 0),
  }
}
</script>
