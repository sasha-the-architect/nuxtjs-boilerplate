<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
    <p class="text-gray-700 leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description: string
}

defineProps<Props>()
</script>
