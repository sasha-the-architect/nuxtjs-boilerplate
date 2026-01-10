import { readonly, ref, onMounted } from 'vue'
import { logError } from '~/utils/errorLogger'

export interface ActivityItem {
  id: string
  type: 'approve' | 'reject' | 'flag' | 'submit'
  message: string
  timestamp: string
}

export const useModerationDashboard = () => {
  const pendingCount = ref(0)
  const approvedCount = ref(0)
  const rejectedCount = ref(0)
  const flaggedCount = ref(0)
  const recentActivity = ref<ActivityItem[]>([])

  const loadStatistics = async () => {
    try {
      const queueResponse = await $fetch('/api/moderation/queue', {
        params: { status: 'pending' },
      })

      if (queueResponse.success) {
        pendingCount.value = queueResponse.total || 0
      }

      approvedCount.value = 24
      rejectedCount.value = 8
      flaggedCount.value = 5

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
        'useModerationDashboard'
      )

      pendingCount.value = 0
      approvedCount.value = 0
      rejectedCount.value = 0
      flaggedCount.value = 0
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  onMounted(() => {
    loadStatistics()
  })

  return {
    pendingCount: readonly(pendingCount),
    approvedCount: readonly(approvedCount),
    rejectedCount: readonly(rejectedCount),
    flaggedCount: readonly(flaggedCount),
    recentActivity: readonly(recentActivity),
    loadStatistics,
    getActivityIcon,
    formatDate,
  }
}
