<template>
  <div class="webhook-manager">
    <div class="webhook-header">
      <h2>Webhook Management</h2>
      <button class="btn btn-primary" @click="showCreateForm = true">
        Create Webhook
      </button>
    </div>

    <!-- Create Webhook Form -->
    <div v-if="showCreateForm" class="webhook-form">
      <h3>Create New Webhook</h3>
      <form @submit.prevent="createWebhook">
        <div class="form-group">
          <label for="url">Webhook URL</label>
          <input
            id="url"
            v-model="newWebhook.url"
            type="url"
            required
            placeholder="https://example.com/webhook"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label>Events</label>
          <div class="event-checkboxes">
            <label
              v-for="event in availableEvents"
              :key="event"
              class="checkbox-label"
            >
              <input
                v-model="newWebhook.events"
                type="checkbox"
                :value="event"
              />
              {{ event }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>
            <input v-model="newWebhook.active" type="checkbox" />
            Active
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Create Webhook</button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="showCreateForm = false"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Webhooks List -->
    <div class="webhooks-list">
      <h3>Webhooks</h3>
      <div v-if="webhooks.length === 0" class="empty-state">
        No webhooks configured
      </div>
      <div v-else class="webhook-items">
        <div v-for="webhook in webhooks" :key="webhook.id" class="webhook-item">
          <div class="webhook-info">
            <div class="webhook-url">{{ webhook.url }}</div>
            <div class="webhook-events">
              <span
                v-for="event in webhook.events"
                :key="event"
                class="event-tag"
              >
                {{ event }}
              </span>
            </div>
            <div class="webhook-status">
              <span :class="`status ${webhook.active ? 'active' : 'inactive'}`">
                {{ webhook.active ? 'Active' : 'Inactive' }}
              </span>
              <span
                v-if="webhook.lastDeliveryStatus"
                :class="`status ${webhook.lastDeliveryStatus}`"
              >
                Last: {{ webhook.lastDeliveryStatus }}
              </span>
            </div>
          </div>
          <div class="webhook-actions">
            <button class="btn btn-sm" @click="toggleWebhook(webhook)">
              {{ webhook.active ? 'Deactivate' : 'Activate' }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="deleteWebhook(webhook.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '~/utils/logger'
import type { Webhook } from '~/types/webhook'

const showCreateForm = ref(false)
const webhooks = ref<Webhook[]>([])
const loading = ref(true)

const newWebhook = reactive({
  url: '',
  events: [] as string[],
  active: true,
})

const availableEvents = [
  'resource.created',
  'resource.updated',
  'resource.deleted',
  'resource.approved',
  'user.registered',
  'submission.received',
]

// Fetch webhooks
const fetchWebhooks = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/v1/webhooks')
    webhooks.value = response.data
  } catch (error) {
    logger.error('Error fetching webhooks:', error)
  } finally {
    loading.value = false
  }
}

// Create new webhook
const createWebhook = async () => {
  try {
    await $fetch('/api/v1/webhooks', {
      method: 'POST',
      body: newWebhook,
    })

    // Reset form
    newWebhook.url = ''
    newWebhook.events = []
    newWebhook.active = true
    showCreateForm.value = false

    // Refresh list
    await fetchWebhooks()
  } catch (error) {
    logger.error('Error creating webhook:', error)
  }
}

// Toggle webhook active status
const toggleWebhook = async (webhook: Webhook) => {
  try {
    await $fetch(`/api/v1/webhooks/${webhook.id}`, {
      method: 'PUT',
      body: { active: !webhook.active },
    })

    // Refresh list
    await fetchWebhooks()
  } catch (error) {
    logger.error('Error toggling webhook:', error)
  }
}

// Delete webhook
const deleteWebhook = async (id: string) => {
  if (confirm('Are you sure you want to delete this webhook?')) {
    try {
      await $fetch(`/api/v1/webhooks/${id}`, {
        method: 'DELETE',
      })

      // Refresh list
      await fetchWebhooks()
    } catch (error) {
      logger.error('Error deleting webhook:', error)
    }
  }
}

// Load webhooks on component mount
onMounted(() => {
  fetchWebhooks()
})
</script>

<style scoped>
.webhook-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.webhook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.webhook-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.event-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.webhooks-list h3 {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.webhook-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.webhook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.webhook-info {
  flex: 1;
}

.webhook-url {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.webhook-events {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.event-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.webhook-status {
  display: flex;
  gap: 1rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status.success {
  background: #dcfce7;
  color: #166534;
}

.status.failed {
  background: #fee2e2;
  color: #dc2626;
}

.webhook-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #374151;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
