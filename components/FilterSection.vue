<template>
  <fieldset class="mb-6">
    <legend class="text-sm font-medium text-gray-900 mb-3">
      {{ label }}
    </legend>
    <div
      role="group"
      :aria-label="ariaLabel"
      class="space-y-2"
      :class="scrollableClass"
    >
      <label
        v-for="option in options"
        :key="option"
        class="flex items-center cursor-pointer"
        :class="{ 'justify-between': showCount }"
        @keydown.enter="toggleOption(option)"
        @keydown.space.prevent="toggleOption(option)"
      >
        <div class="flex items-center">
          <input
            :id="`${id}-${option}`"
            type="checkbox"
            :value="option"
            :checked="selectedOptions.includes(option)"
            :aria-label="ariaLabelOption(option)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            @change="toggleOption(option)"
          >
          <label
            :for="`${id}-${option}`"
            class="ml-2 text-sm text-gray-800 cursor-pointer"
          >
            {{ option }}
          </label>
        </div>
        <span
          v-if="showCount && getCountForOption"
          class="ml-2 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-0.5"
          aria-label="result count"
        >
          {{ getCountForOption(option) }}
        </span>
      </label>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  ariaLabel: string
  options: string[]
  selectedOptions: string[]
  id: string
  showCount?: boolean
  scrollable?: boolean
  getCountForOption?: (option: string) => number
}

interface Emits {
  (event: 'toggle', option: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showCount: true,
  scrollable: true,
  getCountForOption: undefined,
})

const emit = defineEmits<Emits>()

const scrollableClass = computed(() =>
  props.scrollable ? 'max-h-40 overflow-y-auto' : ''
)

const toggleOption = (option: string) => {
  emit('toggle', option)
}

const ariaLabelOption = (option: string): string => {
  const count = props.getCountForOption?.(option) ?? 0
  return props.showCount
    ? `Filter by ${option} (${count} results)`
    : `Filter by ${option}`
}
</script>
