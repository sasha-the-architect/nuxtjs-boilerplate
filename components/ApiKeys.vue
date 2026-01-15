<template>
  <div class="api-keys-manager">
    <div class="api-keys-header">
      <h2>API Keys</h2>
      <button
        class="btn btn-primary"
        @click="showCreateForm = true"
      >
        Create API Key
      </button>
    </div>

    <!-- Create API Key Form -->
    <div
      v-if="showCreateForm"
      class="api-key-form"
    >
      <h3>Create New API Key</h3>
      <form @submit.prevent="createApiKey">
        <div class="form-group">
          <label for="name">Key Name</label>
          <input
            id="name"
            v-model="newApiKey.name"
            type="text"
            required
            placeholder="My Application Key"
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="permissions">Permissions</label>
          <select
            id="permissions"
            v-model="newApiKey.permissions"
            multiple
            class="form-control"
          >
            <option value="read">
              Read
            </option>
            <option value="write">
              Write
            </option>
            <option value="delete">
              Delete
            </option>
            <option value="webhooks">
              Webhooks
            </option>
            <option value="admin">
              Admin
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
          >
            Create API Key
          </button>
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

    <!-- API Keys List -->
    <div class="api-keys-list">
      <h3>API Keys</h3>
      <div
        v-if="apiKeys.length === 0"
        class="empty-state"
      >
        No API keys created
      </div>
      <div
        v-else
        class="api-key-items"
      >
        <div
          v-for="key in apiKeys"
          :key="key.id"
          class="api-key-item"
        >
          <div class="api-key-info">
            <div class="api-key-name">
              {{ key.name }}
            </div>
            <div class="api-key-id">
              ID: {{ key.id }}
            </div>
            <div class="api-key-permissions">
              <span
                v-for="permission in key.permissions"
                :key="permission"
                class="permission-tag"
              >
                {{ permission }}
              </span>
            </div>
            <div class="api-key-meta">
              <div>
                Created: {{ new Date(key.createdAt).toLocaleDateString() }}
              </div>
              <div v-if="key.lastUsedAt">
                Last Used: {{ new Date(key.lastUsedAt).toLocaleDateString() }}
              </div>
            </div>
          </div>
          <div class="api-key-actions">
            <button
              class="btn btn-sm btn-danger"
              @click="revokeApiKey(key.id)"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- API Key Created Modal -->
    <div
      v-if="showKeyCreatedModal"
      class="modal-overlay"
      @click="closeModal"
    >
      <div
        ref="modalContent"
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
        @click.stop
      >
        <h3 id="modal-title">
          New API Key Created
        </h3>
        <p><strong>Key:</strong> {{ createdApiKey?.key }}</p>
        <p
          class="warning"
          role="alert"
        >
          Make sure to copy this key now. You won't be able to see it again.
        </p>
        <div class="form-actions">
          <button
            class="btn btn-primary"
            :aria-label="
              copySuccess
                ? 'API key copied to clipboard'
                : 'Copy API key to clipboard'
            "
            @click="copyApiKey"
          >
            {{ copySuccess ? 'Copied!' : 'Copy Key' }}
          </button>
          <button
            class="btn btn-secondary"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiKey } from '~/types/webhook'
import type { NewApiKey } from '~/composables/useApiKeysManager'
import { useApiKeysManager } from '~/composables/useApiKeysManager'
import logger from '~/utils/logger'

const {
  apiKeys,
  fetchApiKeys,
  createApiKey: createApiKeys,
  revokeApiKey: revokeApiKeys,
} = useApiKeysManager()

const showCreateForm = ref(false)
const showKeyCreatedModal = ref(false)
const createdApiKey = ref<ApiKey | null>(null)
const modalContent = ref<HTMLElement | null>(null)
const copySuccess = ref(false)

// Store previously focused element
let previousActiveElement: HTMLElement | null = null

// Focus trap for modal
const focusableElementsString =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const getFocusableElements = (element: HTMLElement) => {
  return element.querySelectorAll<HTMLElement>(focusableElementsString)
}

const trapFocus = (event: KeyboardEvent) => {
  if (!modalContent.value) return

  const focusableContent = getFocusableElements(modalContent.value)
  if (focusableContent.length === 0) return

  const firstElement = focusableContent[0]
  const lastElement = focusableContent[focusableContent.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Modal open/close handlers
const openModal = () => {
  previousActiveElement = document.activeElement as HTMLElement
  showKeyCreatedModal.value = true

  nextTick(() => {
    if (modalContent.value) {
      modalContent.value.focus()
      modalContent.value.addEventListener('keydown', trapFocus)
    }
  })
}

const closeModal = () => {
  showKeyCreatedModal.value = false

  if (modalContent.value) {
    modalContent.value.removeEventListener('keydown', trapFocus)
  }

  nextTick(() => {
    previousActiveElement?.focus()
  })
}

const newApiKey = reactive<NewApiKey>({
  name: '',
  permissions: ['read'],
})

// Create new API key
const createApiKey = async () => {
  const key = await createApiKeys(newApiKey)

  if (key) {
    // Show the created key in a modal
    createdApiKey.value = key
    openModal()

    // Reset form
    newApiKey.name = ''
    newApiKey.permissions = ['read']
    showCreateForm.value = false
  }
}

// Revoke API key
const revokeApiKey = async (id: string) => {
  if (confirm('Are you sure you want to revoke this API key?')) {
    const success = await revokeApiKeys(id)
    if (!success) {
      logger.error('Failed to revoke API key')
    }
  }
}

// Copy API key to clipboard
const copyApiKey = async () => {
  if (createdApiKey.value?.key) {
    try {
      await navigator.clipboard.writeText(createdApiKey.value.key)
      copySuccess.value = true

      // Reset button text after 2 seconds
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (error) {
      logger.error('Error copying API key to clipboard', error)
    }
  }
}

// Load API keys on component mount
onMounted(() => {
  fetchApiKeys()
})
</script>

<style scoped>
.api-keys-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.api-keys-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.api-key-form {
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

.form-control[multiple] {
  height: auto;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.api-keys-list h3 {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.api-key-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.api-key-info {
  flex: 1;
}

.api-key-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.api-key-id {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.api-key-permissions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.permission-tag {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.api-key-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.api-key-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
}

.warning {
  background: #fef3c7;
  color: #92400e;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
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
