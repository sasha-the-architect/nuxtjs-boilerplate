<template>
  <div class="webhooks-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Webhook & API Integration</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card">
          <ClientOnly>
            <LazyWebhookManager />
          </ClientOnly>
        </div>

        <div class="card">
          <ClientOnly>
            <LazyApiKeys />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'], // This would require authentication in a real implementation
})

useHead({
  title: 'Webhook & API Integration | Nuxt.js Boilerplate',
  meta: [
    {
      name: 'description',
      content:
        'Manage webhooks and API keys for integration with external services',
    },
  ],
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}
</style>
