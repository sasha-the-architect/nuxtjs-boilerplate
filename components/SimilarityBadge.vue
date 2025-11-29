<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3 w-3 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
        clip-rule="evenodd"
      />
    </svg>
    {{ similarityText }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  score: number
}

const props = defineProps<Props>()

const similarityText = computed(() => {
  if (props.score >= 0.8) return 'High'
  if (props.score >= 0.6) return 'Medium'
  if (props.score >= 0.4) return 'Low'
  return 'Minimal'
})

const badgeClass = computed(() => {
  if (props.score >= 0.8) return 'bg-green-100 text-green-800'
  if (props.score >= 0.6) return 'bg-yellow-100 text-yellow-800'
  if (props.score >= 0.4) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
})
</script>
