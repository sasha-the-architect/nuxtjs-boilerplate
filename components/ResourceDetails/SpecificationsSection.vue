<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <template v-for="(value, key) in specifications" :key="key">
        <div>
          <dt class="text-sm font-medium text-gray-500 capitalize">
            {{ formatLabel(key) }}
          </dt>
          <dd class="mt-1 text-gray-900">{{ value }}</dd>
        </div>
      </template>
    </dl>
  </div>
</template>

<script setup lang="ts">
interface Props {
  specifications: Record<string, string>
}

defineProps<Props>()

const formatLabel = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').trim()
}
</script>
