/**
 * Composable for webhooks management
 * Handles webhook CRUD operations, validation, and state management
 *
 * Architecture:
 * - Business logic layer: Manages webhook operations and state
 * - Data access layer: Communicates with API endpoints
 * - Separation of concerns: Components handle presentation only
 */
import { ref, reactive } from 'vue'
import logger from '~/utils/logger'
import type { Webhook } from '~/types/webhook'

export interface WebhookFormData {
  url: string
  events: string[]
  active: boolean
}

export const useWebhooksManager = () => {
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
      const response = await $fetch('/api/v1/webhooks')
      webhooks.value = response.data
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
      await $fetch('/api/v1/webhooks', {
        method: 'POST',
        body: webhookData,
      })

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
      await $fetch(`/api/v1/webhooks/${webhook.id}`, {
        method: 'PUT',
        body: { active: newStatus },
      })

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
      await $fetch(`/api/v1/webhooks/${webhook.id}`, {
        method: 'DELETE',
      })

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
