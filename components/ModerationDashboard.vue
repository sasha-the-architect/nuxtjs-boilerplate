<template>
  <div class="moderation-dashboard">
    <div class="dashboard-header">
      <h1>Content Moderation Dashboard</h1>
      <p>Manage resource submissions and content quality</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Pending Reviews</h3>
        <div class="stat-value">{{ pendingCount }}</div>
        <NuxtLink to="/moderation/queue" class="stat-link">View Queue</NuxtLink>
      </div>

      <div class="stat-card">
        <h3>Approved This Week</h3>
        <div class="stat-value">{{ approvedCount }}</div>
        <div class="stat-trend up">+12%</div>
      </div>

      <div class="stat-card">
        <h3>Rejected This Week</h3>
        <div class="stat-value">{{ rejectedCount }}</div>
        <div class="stat-trend down">-5%</div>
      </div>

      <div class="stat-card">
        <h3>Flagged Resources</h3>
        <div class="stat-value">{{ flaggedCount }}</div>
        <NuxtLink to="/moderation/flags" class="stat-link">View Flags</NuxtLink>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-${activity.type}`">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <span class="activity-time">{{
                formatDate(activity.timestamp)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <NuxtLink to="/moderation/queue" class="action-btn">
            <span class="action-icon">📋</span>
            <span>Review Queue</span>
          </NuxtLink>

          <NuxtLink to="/moderation/flags" class="action-btn">
            <span class="action-icon">🚩</span>
            <span>Flagged Content</span>
          </NuxtLink>

          <NuxtLink to="/moderation/submissions" class="action-btn">
            <span class="action-icon">📝</span>
            <span>Submissions</span>
          </NuxtLink>

          <NuxtLink to="/moderation/settings" class="action-btn">
            <span class="action-icon">⚙️</span>
            <span>Settings</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import logger from '~/utils/logger'
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
    logger.error('Error loading dashboard data:', err)
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
