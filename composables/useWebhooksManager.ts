/**
 * Composable for webhooks management
 * Handles webhook CRUD operations, validation, and state management
 *
 * Architecture:
 * - Business logic layer: Manages webhook operations and state
 * - Data access layer: Communicates with API endpoints via ApiClient
 * - Separation of concerns: Components handle presentation only
 *
 * Dependency Injection:
 * - ApiClient can be injected for testing
 * - Falls back to useNuxtApp() for production use
 */
import { ref, reactive } from 'vue'
import { useNuxtApp } from '#app'
import logger from '~/utils/logger'
import type { ApiClient } from '~/utils/api-client'
import type { Webhook } from '~/types/webhook'

export interface WebhookFormData {
  url: string
  events: string[]
  active: boolean
}

export interface UseWebhooksManagerOptions {
  apiClient?: ApiClient
}

export const useWebhooksManager = (options: UseWebhooksManagerOptions = {}) => {
  const { apiClient: providedClient } = options

  const getClient = () => {
    if (providedClient) {
      return providedClient
    }
    const { $apiClient } = useNuxtApp()
    return $apiClient
  }

  const webhooks = ref<Webhook[]>([])
  const loading = ref(true)
  const errorMessage = ref('')
  const announcement = ref('')

  const newWebhook = reactive<WebhookFormData>({
    url: '',
    events: [],
    active: true,
  })

  const availableEvents = [
    'resource.created',
    'resource.updated',
    'resource.deleted',
    'resource.approved',
    'user.registered',
    'submission.received',
  ] as const

  const fetchWebhooks = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      const client = getClient()
      const response = await client.get<{ data: Webhook[] }>('/api/v1/webhooks')

      if (response.success && response.data) {
        webhooks.value = response.data as unknown as Webhook[]
      } else {
        errorMessage.value = 'Failed to fetch webhooks. Please try again.'
      }
    } catch (error) {
      logger.error('Error fetching webhooks:', error)
      errorMessage.value = 'Failed to fetch webhooks. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const createWebhook = async (webhookData: WebhookFormData) => {
    errorMessage.value = ''

    if (!webhookData.url) {
      errorMessage.value = 'Webhook URL is required.'
      return false
    }

    if (!webhookData.events || webhookData.events.length === 0) {
      errorMessage.value = 'At least one event must be selected.'
      return false
    }

    try {
      const client = getClient()
      const response = await client.post('/api/v1/webhooks', webhookData)

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          'Failed to create webhook. Please try again.'
        return false
      }

      announcement.value = 'Webhook created successfully'

      setTimeout(() => {
        announcement.value = ''
      }, 3000)

      await fetchWebhooks()
      return true
    } catch (error) {
      logger.error('Error creating webhook:', error)
      errorMessage.value = 'Failed to create webhook. Please try again.'
      return false
    }
  }

  const toggleWebhook = async (webhook: Webhook) => {
    try {
      const newStatus = !webhook.active
      const client = getClient()
      const response = await client.put(`/api/v1/webhooks/${webhook.id}`, {
        active: newStatus,
      })

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          'Failed to update webhook status. Please try again.'
        return
      }

      announcement.value = newStatus
        ? 'Webhook activated'
        : 'Webhook deactivated'

      setTimeout(() => {
        announcement.value = ''
      }, 3000)

      await fetchWebhooks()
    } catch (error) {
      logger.error('Error toggling webhook:', error)
      errorMessage.value = 'Failed to update webhook status. Please try again.'
    }
  }

  const deleteWebhook = async (webhook: Webhook) => {
    if (!confirm(`Are you sure you want to delete webhook: ${webhook.url}?`)) {
      return
    }

    try {
      const client = getClient()
      const response = await client.delete(`/api/v1/webhooks/${webhook.id}`)

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          'Failed to delete webhook. Please try again.'
        return
      }

      announcement.value = 'Webhook deleted successfully'

      setTimeout(() => {
        announcement.value = ''
      }, 3000)

      await fetchWebhooks()
    } catch (error) {
      logger.error('Error deleting webhook:', error)
      errorMessage.value = 'Failed to delete webhook. Please try again.'
    }
  }

  const resetForm = () => {
    newWebhook.url = ''
    newWebhook.events = []
    newWebhook.active = true
  }

  return {
    webhooks,
    loading,
    errorMessage,
    announcement,
    newWebhook,
    availableEvents,
    fetchWebhooks,
    createWebhook,
    toggleWebhook,
    deleteWebhook,
    resetForm,
  }
}
