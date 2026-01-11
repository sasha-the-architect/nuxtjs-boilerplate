<template>
  <div class="status-manager">
    <h3>Manage Resource Status</h3>

    <div class="status-controls">
      <div class="status-selector">
        <label for="status-select">Change Status:</label>
        <select
          id="status-select"
          v-model="selectedStatus"
          class="status-dropdown"
        >
          <option value="active">
            Active
          </option>
          <option value="deprecated">
            Deprecated
          </option>
          <option value="discontinued">
            Discontinued
          </option>
          <option value="updated">
            Updated
          </option>
          <option value="pending">
            Pending
          </option>
        </select>
      </div>

      <div class="reason-input">
        <label for="reason-input">Reason:</label>
        <input
          id="reason-input"
          v-model="reason"
          type="text"
          placeholder="Enter reason for status change"
          class="reason-field"
        >
      </div>

      <div class="notes-input">
        <label for="notes-input">Notes (optional):</label>
        <textarea
          id="notes-input"
          v-model="notes"
          placeholder="Additional notes about this change"
          class="notes-field"
        />
      </div>

      <button
        class="update-button"
        :disabled="isUpdating || !selectedStatus"
        @click="handleUpdate"
      >
        {{ isUpdating ? 'Updating...' : 'Update Status' }}
      </button>
    </div>

    <div
      v-if="lastUpdate"
      class="update-result"
    >
      <div
        v-if="lastUpdate.success"
        class="success-message"
      >
        Status updated successfully!
      </div>
      <div
        v-else
        class="error-message"
      >
        Error updating status: {{ lastUpdate.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStatusManager } from '~/composables/useResourceStatusManager'

interface Props {
  resourceId: string
  currentStatus?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentStatus: 'active',
})

const { selectedStatus, reason, notes, isUpdating, lastUpdate, updateStatus } =
  useResourceStatusManager(props.currentStatus)

const emit = defineEmits<{
  statusUpdated: [
    resource: {
      id: string
      status: string
      reason?: string
      notes?: string
    },
  ]
}>()

const handleUpdate = async () => {
  const resource = await updateStatus(props.resourceId)
  if (resource) {
    emit('statusUpdated', resource)
  }
}
</script>

<style scoped>
.status-manager {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #fafafa;
}

.status-manager h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.status-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-selector,
.reason-input,
.notes-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-selector label,
.reason-input label,
.notes-input label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.status-dropdown {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
}

.reason-field {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.notes-field {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  min-height: 60px;
  resize: vertical;
}

.update-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.update-button:hover:not(:disabled) {
  background-color: #059669;
}

.update-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.update-result {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.success-message {
  color: #16a34a;
  background-color: #dcfce7;
  border: 1px solid #bbf7d0;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
}
</style>
