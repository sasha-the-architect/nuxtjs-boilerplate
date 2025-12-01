<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">API Keys</h1>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Manage Your API Keys
          </h2>
          <p class="text-gray-600 mb-6">
            Generate and manage API keys to access the Free Stuff on the
            Internet API. Each key can have different permissions and expiration
            dates.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              v-model="newKeyName"
              type="text"
              placeholder="Enter a name for your API key"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              :disabled="!newKeyName.trim()"
              class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="createApiKey"
            >
              Generate API Key
            </button>
          </div>
        </div>

        <div v-if="apiKeys.length > 0" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Your API Keys
          </h2>
          <div class="space-y-4">
            <div
              v-for="key in apiKeys"
              :key="key.id"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-800">{{ key.name }}</h3>
                  <p class="text-sm text-gray-600">ID: {{ key.id }}</p>
                  <p class="text-sm text-gray-600">
                    Created: {{ formatDate(key.createdAt) }}
                  </p>
                  <p v-if="key.expiresAt" class="text-sm text-gray-600">
                    Expires: {{ formatDate(key.expiresAt) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    @click="revokeApiKey(key.id)"
                  >
                    Revoke
                  </button>
                </div>
              </div>
              <div
                v-if="key.showFullKey"
                class="mt-3 p-3 bg-gray-100 rounded-md"
              >
                <p class="font-mono text-sm break-all">
                  API Key: {{ key.key }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Make sure to copy this key now. You won't be able to see it
                  again.
                </p>
              </div>
              <div class="mt-2">
                <button
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                  @click="toggleKeyVisibility(key)"
                >
                  {{ key.showFullKey ? 'Hide Key' : 'Show Key' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-600">You don't have any API keys yet.</p>
          <p class="text-gray-500 text-sm mt-2">
            Generate your first API key to start using the API.
          </p>
        </div>

        <div class="mt-12">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            API Documentation
          </h2>
          <p class="text-gray-600 mb-4">
            For detailed information about available endpoints, request/response
            formats, and authentication requirements, visit our interactive API
            documentation.
          </p>
          <a
            href="/api-docs"
            target="_blank"
            class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View API Documentation
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiKey } from '~/types/webhook'

const newKeyName = ref('')
const apiKeys = ref<ApiKey[]>([])

// For now, using mock data since the API endpoints may not be available in all environments
onMounted(() => {
  // Initialize with mock data for demonstration
  apiKeys.value = [
    {
      id: 'key_12345',
      name: 'Development Key',
      key: 'ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      permissions: ['read'],
      createdAt: new Date().toISOString(),
      active: true,
    },
  ]
})

const createApiKey = () => {
  if (!newKeyName.value.trim()) return

  // Create mock API key for demonstration
  const newKey: ApiKey = {
    id: `key_${Date.now()}`,
    name: newKeyName.value.trim(),
    key: `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    permissions: ['read'],
    createdAt: new Date().toISOString(),
    active: true,
  }

  apiKeys.value.unshift({ ...newKey, key: newKey.key.substring(0, 8) + '...' }) // Show partial key
  newKeyName.value = ''

  alert(
    `Mock API key created!\n\nKey: ${newKey.key}\n\nIn a real implementation, this would call the API.`
  )
}

const revokeApiKey = (keyId: string) => {
  if (
    !confirm(
      'Are you sure you want to revoke this API key? This action cannot be undone.'
    )
  ) {
    return
  }

  // In a real implementation, this would call the API to revoke the key
  apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
  alert('In a real implementation, this would revoke the API key via the API.')
}

const toggleKeyVisibility = (key: any) => {
  // In a real implementation, we would show the actual key when toggled
  key.showFullKey = !key.showFullKey
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
