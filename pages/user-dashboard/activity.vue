<template>
  <div class="activity-page">
    <h2>Activity</h2>

    <div class="activity-filters">
      <select v-model="filterType" class="filter-select">
        <option value="">All Activity</option>
        <option value="comment">Comments</option>
        <option value="vote">Votes</option>
        <option value="resource">Resource Submissions</option>
      </select>

      <select v-model="filterTime" class="filter-select">
        <option value="all">All Time</option>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
      </select>
    </div>

    <div class="activity-list">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-item"
      >
        <div class="activity-icon">
          <span v-if="activity.type === 'comment'">💬</span>
          <span v-else-if="activity.type === 'vote'">👍</span>
          <span v-else-if="activity.type === 'resource'">🔗</span>
          <span v-else>📝</span>
        </div>

        <div class="activity-content">
          <p>{{ activity.description }}</p>
          <small class="activity-time">{{
            formatDate(activity.timestamp)
          }}</small>
        </div>
      </div>

      <div v-if="filteredActivities.length === 0" class="no-activity">
        No activities found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
}

const filterType = ref('')
const filterTime = ref('all')

// Mock activity data - in a real app, this would come from an API
const activities = ref<Activity[]>([
  {
    id: '1',
    type: 'comment',
    description: 'Added a comment to "Nuxt.js Resources"',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    type: 'resource',
    description: 'Submitted a new resource: "Vue.js Best Practices"',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    type: 'vote',
    description: 'Upvoted "React Component Libraries"',
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: '4',
    type: 'comment',
    description: 'Replied to a comment on "CSS Frameworks Comparison"',
    timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
])

const filteredActivities = computed(() => {
  let result = activities.value

  // Filter by type
  if (filterType.value) {
    result = result.filter(activity => activity.type === filterType.value)
  }

  // Filter by time
  if (filterTime.value !== 'all') {
    const now = new Date()
    let cutoffDate = new Date()

    switch (filterTime.value) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    result = result.filter(
      activity => new Date(activity.timestamp) >= cutoffDate
    )
  }

  return result
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
}
</script>

<style scoped>
.activity-page {
  max-width: 800px;
  margin: 0 auto;
}

.activity-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.activity-list {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
}

.activity-time {
  color: #666;
  font-size: 0.875rem;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
