<template>
  <div v-if="showNotice" class="deprecation-notice" :class="noticeClass">
    <div class="notice-icon">
      <span v-if="status === 'deprecated'">⚠️</span>
      <span v-else-if="status === 'discontinued'">🚫</span>
      <span v-else-if="status === 'pending'">⏳</span>
    </div>
    <div class="notice-content">
      <h4>{{ noticeTitle }}</h4>
      <p>{{ noticeMessage }}</p>
      <div v-if="migrationPath || alternatives" class="notice-actions">
        <a
          v-if="migrationPath"
          :href="migrationPath"
          target="_blank"
          class="migration-link"
        >
          Migration Path
        </a>
        <a
          v-if="alternatives && alternatives.length > 0"
          href="/search"
          class="alternatives-link"
        >
          View Alternatives
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  status?:
    | 'active'
    | 'deprecated'
    | 'discontinued'
    | 'updated'
    | 'pending'
    | string
  migrationPath?: string
  alternatives?: string[]
  deprecationDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  migrationPath: undefined,
  alternatives: () => [],
  deprecationDate: undefined,
})

const showNotice = computed(() => {
  return (
    props.status === 'deprecated' ||
    props.status === 'discontinued' ||
    props.status === 'pending'
  )
})

const noticeClass = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return 'deprecation-warning'
    case 'discontinued':
      return 'discontinuation-error'
    case 'pending':
      return 'pending-info'
    default:
      return ''
  }
})

const noticeTitle = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return 'Deprecated Resource'
    case 'discontinued':
      return 'Discontinued Resource'
    case 'pending':
      return 'Pending Review'
    default:
      return ''
  }
})

const noticeMessage = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return 'This resource is deprecated and no longer recommended. Consider using alternatives.'
    case 'discontinued':
      return 'This resource has been discontinued and is no longer maintained.'
    case 'pending':
      return 'This resource is pending review and not yet available to all users.'
    default:
      return ''
  }
})
</script>

<style scoped>
.deprecation-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border-left-width: 4px;
}

.deprecation-warning {
  background-color: #fffbeb;
  border-left-color: #f59e0b;
}

.discontinuation-error {
  background-color: #fef2f2;
  border-left-color: #ef4444;
}

.pending-info {
  background-color: #dbeafe;
  border-left-color: #3b82f6;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.notice-content p {
  margin: 0 0 0.5rem 0;
  color: #4b5563;
}

.notice-actions {
  display: flex;
  gap: 1rem;
}

.migration-link,
.alternatives-link {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.15s;
}

.migration-link {
  background-color: #f59e0b;
  color: white;
}

.migration-link:hover {
  background-color: #d97706;
}

.alternatives-link {
  background-color: #3b82f6;
  color: white;
}

.alternatives-link:hover {
  background-color: #2563eb;
}
</style>
