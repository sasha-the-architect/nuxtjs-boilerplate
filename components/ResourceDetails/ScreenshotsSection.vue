<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      Screenshots
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(screenshot, index) in screenshots"
        :key="index"
        class="overflow-hidden rounded-lg border border-gray-200"
      >
        <img
          :src="screenshot"
          :alt="`${title} screenshot ${index + 1}`"
          class="w-full h-48 object-cover"
          @error="$emit('imageError', $event)"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  screenshots: string[]
  title: string
}

defineProps<Props>()

defineEmits<{
  imageError: [event: Event]
}>()
</script>
