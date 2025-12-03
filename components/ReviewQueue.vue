<template>
  <div class="review-queue">
    <div class="queue-header">
      <h2>Moderation Queue</h2>
      <div class="queue-filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          v-model="categoryFilter"
          type="text"
          placeholder="Filter by category..."
          class="filter-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Loading submissions...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="queue-list">
      <div
        v-for="submission in filteredSubmissions"
        :key="submission.id"
        class="submission-card"
      >
        <div class="submission-header">
          <h3>{{ submission.resourceData?.title }}</h3>
          <span :class="['status-badge', `status-${submission.status}`]">
            {{ submission.status }}
          </span>
        </div>

        <div class="submission-details">
          <p class="description">{{ submission.resourceData?.description }}</p>
          <div class="meta-info">
            <span class="category"
              >Category: {{ submission.resourceData?.category }}</span
            >
            <span class="submitted-by"
              >Submitted by: {{ submission.submittedBy }}</span
            >
            <span class="submitted-at"
              >Submitted: {{ formatDate(submission.submittedAt) }}</span
            >
          </div>

          <div class="tags">
            <span
              v-for="tag in submission.resourceData?.tags || []"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="submission-actions">
          <NuxtLink
            :to="`/moderation/review/${submission.id}`"
            class="btn btn-primary"
          >
            Review
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      v-if="!loading && filteredSubmissions.length === 0"
      class="empty-state"
    >
      No submissions found matching your criteria.
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '~/utils/logger'
import type { Submission } from '~/types/submission'

interface Props {
  initialSubmissions?: Submission[]
}

const props = withDefaults(defineProps<Props>(), {
  initialSubmissions: () => [],
})

const statusFilter = ref('')
const categoryFilter = ref('')
const loading = ref(true)
const error = ref('')
const submissions = ref<Submission[]>(props.initialSubmissions)

// Fetch submissions from API
const fetchSubmissions = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/moderation/queue', {
      params: {
        status: statusFilter.value,
        category: categoryFilter.value,
      },
    })

    if (response.success) {
      submissions.value = response.queue || []
    } else {
      error.value = response.message || 'Failed to load submissions'
    }
  } catch (err) {
    error.value = 'An error occurred while fetching submissions'
    logger.error('Error fetching submissions:', err)
  } finally {
    loading.value = false
  }
}

// Computed filtered submissions based on filters
const filteredSubmissions = computed(() => {
  let result = [...submissions.value]

  if (statusFilter.value) {
    result = result.filter(sub => sub.status === statusFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(sub =>
      sub.resourceData?.category
        ?.toLowerCase()
        .includes(categoryFilter.value.toLowerCase())
    )
  }

  return result
})

// Watch filters and fetch updated data
watch([statusFilter, categoryFilter], () => {
  fetchSubmissions()
})

// Initialize data
onMounted(() => {
  fetchSubmissions()
})

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.review-queue {
  padding: 1rem;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.queue-header h2 {
  margin: 0;
  color: var(--color-text);
}

.queue-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.submission-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--color-card-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.submission-header h3 {
  margin: 0;
  color: var(--color-text);
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.submission-details {
  margin-bottom: 1rem;
}

.description {
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.meta-info span {
  display: flex;
  align-items: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: var(--color-tag-background);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
}
</style>
