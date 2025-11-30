<template>
  <div class="submission-review">
    <div v-if="loading" class="loading">Loading submission...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="submission" class="review-content">
      <div class="review-header">
        <h1>{{ submission.resourceData?.title }}</h1>
        <span :class="['status-badge', `status-${submission.status}`]">
          {{ submission.status }}
        </span>
      </div>

      <div class="review-details">
        <div class="detail-section">
          <h3>Resource Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Description:</label>
              <p>{{ submission.resourceData?.description }}</p>
            </div>

            <div class="info-item">
              <label>URL:</label>
              <a
                :href="submission.resourceData?.url"
                target="_blank"
                class="url-link"
              >
                {{ submission.resourceData?.url }}
              </a>
            </div>

            <div class="info-item">
              <label>Category:</label>
              <span>{{ submission.resourceData?.category }}</span>
            </div>

            <div class="info-item">
              <label>Pricing Model:</label>
              <span>{{ submission.resourceData?.pricingModel || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <label>Difficulty:</label>
              <span>{{ submission.resourceData?.difficulty || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <label>Technologies:</label>
              <div class="tag-list">
                <span
                  v-for="tech in submission.resourceData?.technology || []"
                  :key="tech"
                  class="tag"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="info-item">
              <label>Tags:</label>
              <div class="tag-list">
                <span
                  v-for="tag in submission.resourceData?.tags || []"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="info-item">
              <label>Benefits:</label>
              <ul>
                <li
                  v-for="benefit in submission.resourceData?.benefits || []"
                  :key="benefit"
                >
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Submission Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Submitted By:</label>
              <span>{{ submission.submittedBy || 'Anonymous' }}</span>
            </div>

            <div class="info-item">
              <label>Submitted At:</label>
              <span>{{ formatDate(submission.submittedAt) }}</span>
            </div>

            <div v-if="submission.reviewedAt" class="info-item">
              <label>Reviewed By:</label>
              <span>{{ submission.reviewedBy || 'N/A' }}</span>
            </div>

            <div v-if="submission.reviewedAt" class="info-item">
              <label>Reviewed At:</label>
              <span>{{ formatDate(submission.reviewedAt) }}</span>
            </div>

            <div v-if="submission.rejectionReason" class="info-item">
              <label>Rejection Reason:</label>
              <span class="rejection-reason">{{
                submission.rejectionReason
              }}</span>
            </div>

            <div v-if="submission.notes" class="info-item">
              <label>Notes:</label>
              <span>{{ submission.notes }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submission.status === 'pending'" class="review-actions">
        <div class="action-group">
          <h4>Approve Submission</h4>
          <button class="btn btn-approve" @click="approveSubmission">
            Approve
          </button>
        </div>

        <div class="action-group">
          <h4>Reject Submission</h4>
          <textarea
            v-model="rejectionReason"
            placeholder="Enter reason for rejection..."
            class="rejection-textarea"
          ></textarea>
          <button class="btn btn-reject" @click="rejectSubmission">
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Submission } from '~/types/submission'

interface Props {
  submissionId: string
}

const props = defineProps<Props>()
const loading = ref(true)
const error = ref('')
const submission = ref<Submission | null>(null)
const rejectionReason = ref('')

// Fetch submission data
const fetchSubmission = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch(`/api/submissions/${props.submissionId}`)

    if (response.success) {
      submission.value = response.submission
    } else {
      error.value = response.message || 'Failed to load submission'
    }
  } catch (err) {
    error.value = 'An error occurred while fetching submission'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Approve submission
const approveSubmission = async () => {
  if (!submission.value) return

  try {
    const response = await $fetch('/api/moderation/approve', {
      method: 'POST',
      body: {
        submissionId: props.submissionId,
        reviewedBy: 'moderator_123', // In a real app, this would be the current user
        notes: 'Approved via moderation interface',
      },
    })

    if (response.success) {
      // Update the submission status
      submission.value.status = 'approved'
      submission.value.reviewedBy = 'moderator_123'
      submission.value.reviewedAt = new Date().toISOString()

      alert('Submission approved successfully!')
    } else {
      alert(response.message || 'Failed to approve submission')
    }
  } catch (err) {
    console.error('Error approving submission:', err)
    alert('An error occurred while approving the submission')
  }
}

// Reject submission
const rejectSubmission = async () => {
  if (!submission.value) return

  if (!rejectionReason.value.trim()) {
    alert('Please provide a reason for rejection')
    return
  }

  try {
    const response = await $fetch('/api/moderation/reject', {
      method: 'POST',
      body: {
        submissionId: props.submissionId,
        reviewedBy: 'moderator_123', // In a real app, this would be the current user
        rejectionReason: rejectionReason.value,
        notes: 'Rejected via moderation interface',
      },
    })

    if (response.success) {
      // Update the submission status
      submission.value.status = 'rejected'
      submission.value.reviewedBy = 'moderator_123'
      submission.value.reviewedAt = new Date().toISOString()
      submission.value.rejectionReason = rejectionReason.value

      alert('Submission rejected successfully!')
    } else {
      alert(response.message || 'Failed to reject submission')
    }
  } catch (err) {
    console.error('Error rejecting submission:', err)
    alert('An error occurred while rejecting the submission')
  }
}

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Initialize data
onMounted(() => {
  fetchSubmission()
})
</script>

<style scoped>
.submission-review {
  padding: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.review-header h1 {
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

.review-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: bold;
  color: var(--color-text);
  font-size: 0.9rem;
}

.info-item p,
.info-item span,
.info-item ul {
  margin: 0;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.info-item ul {
  padding-left: 1.5rem;
}

.url-link {
  color: var(--color-primary);
  text-decoration: none;
}

.url-link:hover {
  text-decoration: underline;
}

.tag-list {
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

.rejection-reason {
  color: var(--color-error);
  font-weight: 500;
}

.review-actions {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.action-group {
  flex: 1;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.rejection-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
  background: var(--color-background);
  color: var(--color-text);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.btn-approve {
  background: var(--color-success);
  color: white;
}

.btn-reject {
  background: var(--color-error);
  color: white;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
}
</style>
