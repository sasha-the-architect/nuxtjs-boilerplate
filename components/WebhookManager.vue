<template>
  <div class="webhook-manager">
    <div class="webhook-header">
      <h2>Webhook Management</h2>
      <button
        class="btn btn-primary"
        aria-label="Create new webhook"
        @click="showCreateForm = true"
      >
        Create Webhook
      </button>
    </div>

    <div
      id="webhook-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>

    <!-- Create Webhook Form -->
    <div
      v-if="showCreateForm"
      class="webhook-form"
    >
      <h3>Create New Webhook</h3>

      <div
        v-if="errorMessage"
        class="error-message"
        role="alert"
        aria-live="assertive"
      >
        {{ errorMessage }}
      </div>

      <form
        novalidate
        @submit.prevent="handleCreateWebhook"
      >
        <div class="form-group">
          <label for="webhook-url">Webhook URL <span aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <input
            id="webhook-url"
            v-model="newWebhook.url"
            type="url"
            required
            aria-required="true"
            aria-describedby="webhook-url-description"
            placeholder="https://example.com/webhook"
            class="form-control"
          >
          <p
            id="webhook-url-description"
            class="mt-1 text-sm text-gray-500"
          >
            Enter the endpoint URL where webhook events will be sent
          </p>
        </div>

        <div class="form-group">
          <fieldset>
            <legend class="font-medium mb-2">
              Events
            </legend>
            <div
              role="group"
              aria-label="Select webhook events"
              class="event-checkboxes"
            >
              <label
                v-for="event in availableEvents"
                :key="event"
                class="checkbox-label"
              >
                <input
                  v-model="newWebhook.events"
                  type="checkbox"
                  :value="event"
                  :aria-label="`Subscribe to ${event} event`"
                >
                {{ event }}
              </label>
            </div>
          </fieldset>
        </div>

        <div class="form-group">
          <label class="flex items-center gap-2">
            <input
              v-model="newWebhook.active"
              type="checkbox"
              aria-label="Enable webhook"
            >
            Active
          </label>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            aria-label="Create new webhook"
          >
            Create Webhook
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            aria-label="Cancel webhook creation"
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
      <div
        v-if="webhooks.length === 0"
        class="empty-state"
        role="status"
        aria-live="polite"
      >
        No webhooks configured
      </div>
      <div
        v-else
        class="webhook-items"
      >
        <div
          v-for="webhook in webhooks"
          :key="webhook.id"
          class="webhook-item"
          role="listitem"
        >
          <div class="webhook-info">
            <div class="webhook-url">
              {{ webhook.url }}
            </div>
            <div
              class="webhook-events"
              aria-label="Subscribed events"
            >
              <span
                v-for="event in webhook.events"
                :key="event"
                class="event-tag"
              >
                {{ event }}
              </span>
            </div>
            <div class="webhook-status">
              <span
                :class="`status ${webhook.active ? 'active' : 'inactive'}`"
                :aria-label="`Webhook is ${webhook.active ? 'active' : 'inactive'}`"
              >
                {{ webhook.active ? 'Active' : 'Inactive' }}
              </span>
              <span
                v-if="webhook.lastDeliveryStatus"
                :class="`status ${webhook.lastDeliveryStatus}`"
                :aria-label="`Last delivery status: ${webhook.lastDeliveryStatus}`"
              >
                Last: {{ webhook.lastDeliveryStatus }}
              </span>
            </div>
          </div>
          <div
            class="webhook-actions"
            role="group"
            aria-label="Webhook actions"
          >
            <button
              class="btn btn-sm"
              :aria-label="`${webhook.active ? 'Deactivate' : 'Activate'} webhook at ${webhook.url}`"
              @click="toggleWebhook(webhook)"
            >
              {{ webhook.active ? 'Deactivate' : 'Activate' }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              aria-label="Delete webhook"
              @click="handleDeleteWebhook(webhook)"
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
import type { Webhook } from '~/types/webhook'
import { useWebhooksManager } from '~/composables/useWebhooksManager'

const showCreateForm = ref(false)

const {
  webhooks,
  errorMessage,
  announcement,
  newWebhook,
  availableEvents,
  fetchWebhooks,
  createWebhook,
  toggleWebhook,
  deleteWebhook,
  resetForm,
} = useWebhooksManager()

const handleCreateWebhook = async () => {
  const success = await createWebhook(newWebhook)
  if (success) {
    resetForm()
    showCreateForm.value = false
  }
}

const handleDeleteWebhook = async (webhook: Webhook) => {
  await deleteWebhook(webhook)
}

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

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}
</style>
