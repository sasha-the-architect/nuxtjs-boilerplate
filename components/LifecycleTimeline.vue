<template>
  <div class="lifecycle-timeline">
    <h3 class="timeline-title">Resource Lifecycle</h3>

    <div v-if="statusHistory && statusHistory.length > 0" class="timeline">
      <div
        v-for="(change, index) in statusHistory"
        :key="change.id"
        class="timeline-item"
      >
        <div class="timeline-marker">
          <div
            :class="['marker', getMarkerClass(change.toStatus)]"
            :title="change.toStatus"
          >
            {{ getStatusInitial(change.toStatus) }}
          </div>
          <div
            v-if="index !== statusHistory.length - 1"
            class="timeline-connector"
          ></div>
        </div>
        <div class="timeline-content">
          <div class="change-info">
            <span class="status-change"
              >{{ change.fromStatus }} → {{ change.toStatus }}</span
            >
            <span class="change-date">{{ formatDate(change.changedAt) }}</span>
          </div>
          <div class="change-details">
            <div v-if="change.reason" class="reason">
              Reason: {{ change.reason }}
            </div>
            <div v-if="change.notes" class="notes">
              Notes: {{ change.notes }}
            </div>
            <div class="changed-by">Changed by: {{ change.changedBy }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-history">
      No status history available for this resource.
    </div>

    <div
      v-if="updateHistory && updateHistory.length > 0"
      class="update-history"
    >
      <h4>Update History</h4>
      <div v-for="update in updateHistory" :key="update.id" class="update-item">
        <div class="update-header">
          <span class="version">v{{ update.version }}</span>
          <span class="update-date">{{ formatDate(update.updatedAt) }}</span>
        </div>
        <div v-if="update.changelog" class="changelog">
          {{ update.changelog }}
        </div>
        <ul
          v-if="update.changes && update.changes.length > 0"
          class="changes-list"
        >
          <li v-for="(change, idx) in update.changes" :key="idx">
            {{ change }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatusChange, ResourceUpdate } from '~/types/resource'

interface Props {
  statusHistory?: StatusChange[]
  updateHistory?: ResourceUpdate[]
}

const props = withDefaults(defineProps<Props>(), {
  statusHistory: () => [],
  updateHistory: () => [],
})

const getMarkerClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'marker-active'
    case 'deprecated':
      return 'marker-deprecated'
    case 'discontinued':
      return 'marker-discontinued'
    case 'updated':
      return 'marker-updated'
    case 'pending':
      return 'marker-pending'
    default:
      return 'marker-unknown'
  }
}

const getStatusInitial = (status: string) => {
  switch (status) {
    case 'active':
      return 'A'
    case 'deprecated':
      return 'D'
    case 'discontinued':
      return 'X'
    case 'updated':
      return 'U'
    case 'pending':
      return 'P'
    default:
      return '?'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.lifecycle-timeline {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #fafafa;
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
}

.marker-active {
  background-color: #22c55e;
}

.marker-deprecated {
  background-color: #f59e0b;
}

.marker-discontinued {
  background-color: #ef4444;
}

.marker-updated {
  background-color: #3b82f6;
}

.marker-pending {
  background-color: #6b7280;
}

.marker-unknown {
  background-color: #9ca3af;
}

.timeline-connector {
  width: 2px;
  height: 100%;
  background-color: #d1d5db;
  margin-top: 0.5rem;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1rem;
}

.change-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.status-change {
  font-weight: 600;
  color: #1f2937;
}

.change-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.change-details {
  font-size: 0.875rem;
  color: #4b5563;
}

.reason,
.notes,
.changed-by {
  margin: 0.25rem 0;
}

.reason {
  font-weight: 500;
  color: #374151;
}

.no-history {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.update-history {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.update-history h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.update-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.version {
  font-weight: 600;
  color: #1f2937;
}

.update-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.changelog {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.changes-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  color: #4b5563;
}

.changes-list li {
  margin-bottom: 0.25rem;
}
</style>
