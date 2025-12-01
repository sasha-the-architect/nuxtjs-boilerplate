<template>
  <div class="moderation-page">
    <ModerationDashboard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Moderation Dashboard - Resource Directory',
  meta: [
    {
      name: 'description',
      content: 'Content moderation dashboard for resource directory',
    },
  ],
})
</script>

<style scoped>
.moderation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
