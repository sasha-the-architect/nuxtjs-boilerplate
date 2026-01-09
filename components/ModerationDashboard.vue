<template>
  <div class="moderation-dashboard">
    <header class="dashboard-header">
      <h1>Content Moderation Dashboard</h1>
      <p>Manage resource submissions and content quality</p>
    </header>

    <section aria-label="Dashboard statistics" class="dashboard-stats">
      <article class="stat-card">
        <h2>Pending Reviews</h2>
        <div class="stat-value" aria-label="Number of pending reviews">
          {{ pendingCount }}
        </div>
        <NuxtLink to="/moderation/queue" class="stat-link">View Queue</NuxtLink>
      </article>

      <article class="stat-card">
        <h2>Approved This Week</h2>
        <div
          class="stat-value"
          aria-label="Number of approved resources this week"
        >
          {{ approvedCount }}
        </div>
        <div class="stat-trend up" aria-label="12 percent increase">+12%</div>
      </article>

      <article class="stat-card">
        <h2>Rejected This Week</h2>
        <div
          class="stat-value"
          aria-label="Number of rejected resources this week"
        >
          {{ rejectedCount }}
        </div>
        <div class="stat-trend down" aria-label="5 percent decrease">-5%</div>
      </article>

      <article class="stat-card">
        <h2>Flagged Resources</h2>
        <div class="stat-value" aria-label="Number of flagged resources">
          {{ flaggedCount }}
        </div>
        <NuxtLink to="/moderation/flags" class="stat-link">View Flags</NuxtLink>
      </article>
    </section>

    <div class="dashboard-content">
      <section
        class="recent-activity"
        aria-labelledby="recent-activity-heading"
      >
        <h2 id="recent-activity-heading">Recent Activity</h2>
        <ul class="activity-list" role="list">
          <li
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div
              class="activity-icon"
              :class="`activity-${activity.type}`"
              aria-hidden="true"
            >
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <time class="activity-time" :datetime="activity.timestamp">{{
                formatDate(activity.timestamp)
              }}</time>
            </div>
          </li>
        </ul>
      </section>

      <section class="quick-actions" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading">Quick Actions</h2>
        <nav class="action-buttons" aria-label="Quick actions navigation">
          <NuxtLink
            to="/moderation/queue"
            class="action-btn"
            aria-label="Go to review queue"
          >
            <span class="action-icon" aria-hidden="true">📋</span>
            <span>Review Queue</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/flags"
            class="action-btn"
            aria-label="View flagged content"
          >
            <span class="action-icon" aria-hidden="true">🚩</span>
            <span>Flagged Content</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/submissions"
            class="action-btn"
            aria-label="View submissions"
          >
            <span class="action-icon" aria-hidden="true">📝</span>
            <span>Submissions</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/settings"
            class="action-btn"
            aria-label="Go to settings"
          >
            <span class="action-icon" aria-hidden="true">⚙️</span>
            <span>Settings</span>
          </NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { logError } from '~/utils/errorLogger'
interface ActivityItem {
  id: string
  type: 'approve' | 'reject' | 'flag' | 'submit'
  message: string
  timestamp: string
}

const pendingCount = ref(0)
const approvedCount = ref(0)
const rejectedCount = ref(0)
const flaggedCount = ref(0)
const recentActivity = ref<ActivityItem[]>([])

// Load dashboard statistics
const loadStatistics = async () => {
  try {
    // Fetch pending submissions
    const queueResponse = await $fetch('/api/moderation/queue', {
      params: { status: 'pending' },
    })

    if (queueResponse.success) {
      pendingCount.value = queueResponse.total || 0
    }

    // Mock data for other stats (in a real app, these would come from API)
    approvedCount.value = 24
    rejectedCount.value = 8
    flaggedCount.value = 5

    // Mock recent activity (in a real app, this would come from API)
    recentActivity.value = [
      {
        id: '1',
        type: 'approve',
        message: 'Approved "React Best Practices Guide" submission',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        type: 'reject',
        message: 'Rejected "Fake Resource" submission - spam',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '3',
        type: 'flag',
        message: 'Resource "Old Tool" flagged for being deprecated',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: '4',
        type: 'submit',
        message: 'New submission "Vue 3 Components Library" received',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
    ]
  } catch (err) {
    logError(
      'Error loading dashboard data:',
      err as Error,
      'ModerationDashboard'
    )
    // Set default values in case of error
    pendingCount.value = 0
    approvedCount.value = 0
    rejectedCount.value = 0
    flaggedCount.value = 0
  }
}

// Helper function to get activity icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'approve':
      return '✅'
    case 'reject':
      return '❌'
    case 'flag':
      return '🚩'
    case 'submit':
      return '📝'
    default:
      return 'ℹ️'
  }
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Initialize data
onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.moderation-dashboard {
  padding: 1rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.dashboard-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.stat-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.stat-link:hover {
  text-decoration: underline;
}

.stat-trend {
  font-size: 0.9rem;
  font-weight: bold;
}

.stat-trend.up {
  color: var(--color-success);
}

.stat-trend.down {
  color: var(--color-error);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-activity h2,
.quick-actions h2 {
  margin-top: 0;
  color: var(--color-text);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-approve {
  background: rgba(40, 167, 69, 0.1);
  color: var(--color-success);
}

.activity-reject {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-error);
}

.activity-flag {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.activity-submit {
  background: rgba(0, 123, 255, 0.1);
  color: var(--color-primary);
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
