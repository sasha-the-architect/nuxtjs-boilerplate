import { computed, readonly, ref } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import type { ApiKey } from '~/types/webhook'

interface ApiKeyDisplay extends ApiKey {
  showFullKey?: boolean
}

export const useApiKeysPage = () => {
  const newKeyName = ref('')
  const apiKeys = ref<ApiKeyDisplay[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchApiKeys = async () => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<{ data: ApiKey[] }>(
        '/api/v1/auth/api-keys'
      )

      if (response.success && response.data?.data) {
        apiKeys.value = response.data.data.map(key => ({
          ...key,
          showFullKey: false,
        }))
      } else {
        apiKeys.value = []
      }
    } catch (err) {
      error.value = 'Failed to load API keys. Please try again.'
      logError('Error fetching API keys', err as Error, 'useApiKeysPage', {
        operation: 'fetchApiKeys',
      })

      apiKeys.value = []
    } finally {
      loading.value = false
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.value.trim()) {
      return false
    }

    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.post<
        { data: ApiKey } & { key?: string }
      >('/api/v1/auth/api-keys', {
        name: newKeyName.value.trim(),
        permissions: ['read'],
      })

      if (response.success) {
        const newKey: ApiKeyDisplay = {
          ...(response.data?.data || response.data),
          showFullKey: true,
        }

        apiKeys.value.unshift(newKey)
        newKeyName.value = ''

        return true
      } else {
        error.value =
          response.error?.message ||
          'Failed to create API key. Please try again.'
        return false
      }
    } catch (err) {
      error.value = 'Failed to create API key. Please try again.'
      logError('Error creating API key', err as Error, 'useApiKeysPage', {
        operation: 'createApiKey',
      })
      return false
    } finally {
      loading.value = false
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.delete(`/api/v1/auth/api-keys/${keyId}`)

      if (response.success) {
        apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
        return true
      } else {
        error.value =
          response.error?.message ||
          'Failed to revoke API key. Please try again.'
        return false
      }
    } catch (err) {
      error.value = 'Failed to revoke API key. Please try again.'
      logError('Error revoking API key', err as Error, 'useApiKeysPage', {
        operation: 'revokeApiKey',
        keyId,
      })
      return false
    } finally {
      loading.value = false
    }
  }

  const toggleKeyVisibility = (key: ApiKeyDisplay) => {
    key.showFullKey = !key.showFullKey
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (err) {
      logError('Error formatting date', err as Error, 'useApiKeysPage', {
        dateString,
      })
      return 'Invalid date'
    }
  }

  const keyCount = computed(() => apiKeys.value.length)

  return {
    apiKeys: readonly(apiKeys),
    newKeyName,
    loading: readonly(loading),
    error: readonly(error),
    keyCount,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    toggleKeyVisibility,
    formatDate,
  }
}
