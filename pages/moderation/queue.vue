<template>
  <div class="moderation-queue-page">
    <h1>Moderation Queue</h1>
    <ReviewQueue />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Moderation Queue - Resource Directory',
  meta: [
    { name: 'description', content: 'Review pending resource submissions' },
  ],
})
</script>

<style scoped>
.moderation-queue-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
