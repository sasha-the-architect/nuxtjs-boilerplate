import type { Submission } from '~/types/submission'

// Simple in-memory store for submission notifications
// In a real application, this would be stored in a database
interface Notification {
  id: string
  submissionId: string
  status: string
  message: string
  timestamp: string
  read: boolean
}
const submissionNotifications: Record<string, Notification[]> = {}

/**
 * Composable for managing submission status notifications
 */
export function useSubmissionNotifications() {
  /**
   * Get notifications for a specific user
   */
  const getUserNotifications = (userId: string) => {
    return submissionNotifications[userId] || []
  }

  /**
   * Add a notification for a user about a submission status change
   */
  const addNotification = (
    userId: string,
    submissionId: string,
    status: string,
    message: string
  ) => {
    if (!submissionNotifications[userId]) {
      submissionNotifications[userId] = []
    }

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submissionId,
      status,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    }

    submissionNotifications[userId].unshift(notification)

    // Keep only the last 50 notifications per user
    if (submissionNotifications[userId].length > 50) {
      submissionNotifications[userId] = submissionNotifications[userId].slice(
        0,
        50
      )
    }

    return notification
  }

  /**
   * Mark a notification as read
   */
  const markAsRead = (userId: string, notificationId: string) => {
    const notifications = submissionNotifications[userId] || []
    const notification = notifications.find(n => n.id === notificationId)

    if (notification) {
      notification.read = true
    }
  }

  /**
   * Get unread notification count for a user
   */
  const getUnreadCount = (userId: string) => {
    const notifications = submissionNotifications[userId] || []
    return notifications.filter(n => !n.read).length
  }

  /**
   * Notify user about submission status change
   */
  const notifySubmissionStatus = (userId: string, submission: Submission) => {
    const statusMessages: Record<string, string> = {
      approved: `Your submission "${submission.resourceData?.title}" has been approved!`,
      rejected: `Your submission "${submission.resourceData?.title}" has been rejected.`,
      pending: `Your submission "${submission.resourceData?.title}" is under review.`,
    }

    const message =
      statusMessages[submission.status] ||
      `Your submission status has been updated to ${submission.status}.`

    return addNotification(userId, submission.id, submission.status, message)
  }

  return {
    getUserNotifications,
    addNotification,
    markAsRead,
    getUnreadCount,
    notifySubmissionStatus,
  }
}
