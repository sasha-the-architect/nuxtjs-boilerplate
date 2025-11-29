/**
 * Composable for community features
 * Implements community functionality with proper authentication and API integration
 */

export const useCommunityFeatures = () => {
  // Get current user from auth token
  const authToken = useCookie('auth_token').value
  const currentUser = ref(null)

  // Load current user profile if authenticated
  if (authToken) {
    loadCurrentUser()
  }

  async function loadCurrentUser() {
    try {
      const user = await $fetch('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      currentUser.value = user
    } catch (error) {
      console.error('Error loading current user:', error)
      // Clear invalid token
      useCookie('auth_token').value = null
    }
  }

  // User profile management
  const createProfile = async userData => {
    if (!authToken) {
      throw new Error('User must be logged in to create profile')
    }

    try {
      const profile = await $fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: userData,
      })
      return profile
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  const updateProfile = async updates => {
    if (!authToken) {
      throw new Error('User must be logged in to update profile')
    }

    try {
      const profile = await $fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: updates,
      })

      // Update local current user reference
      currentUser.value = profile

      return profile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Comment system
  const addComment = async commentData => {
    if (!authToken) {
      throw new Error('User must be logged in to comment')
    }

    try {
      const comment = await $fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          ...commentData,
          userId: currentUser.value?.id,
        },
      })
      return comment
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  const addReply = async (commentId, replyData) => {
    if (!authToken) {
      throw new Error('User must be logged in to reply')
    }

    try {
      const reply = await $fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          ...replyData,
          userId: currentUser.value?.id,
        },
      })
      return reply
    } catch (error) {
      console.error('Error adding reply:', error)
      throw error
    }
  }

  const editComment = async (commentId, newContent) => {
    if (!authToken) {
      throw new Error('User must be logged in to edit comment')
    }

    try {
      const comment = await $fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: { content: newContent },
      })
      return comment
    } catch (error) {
      console.error('Error editing comment:', error)
      throw error
    }
  }

  const deleteComment = async commentId => {
    if (!authToken) {
      throw new Error('User must be logged in to delete comment')
    }

    try {
      const result = await $fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return result
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  // Voting system
  const vote = async (targetType, targetId, voteType) => {
    if (!authToken) {
      throw new Error('User must be logged in to vote')
    }

    try {
      const voteResult = await $fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          targetType,
          targetId,
          voteType,
          userId: currentUser.value?.id,
        },
      })
      return voteResult
    } catch (error) {
      console.error('Error voting:', error)
      throw error
    }
  }

  // Moderation system
  const flagContent = async (targetType, targetId, reason, details = '') => {
    if (!authToken) {
      throw new Error('User must be logged in to flag content')
    }

    try {
      const flag = await $fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          targetType,
          targetId,
          reason,
          details,
          flaggedBy: currentUser.value?.id,
        },
      })
      return flag
    } catch (error) {
      console.error('Error flagging content:', error)
      throw error
    }
  }

  const moderateContent = async (flagId, action, moderatorNote = '') => {
    if (
      !authToken ||
      (currentUser.value?.role !== 'moderator' &&
        currentUser.value?.role !== 'admin')
    ) {
      throw new Error('User must be a moderator to moderate content')
    }

    try {
      const result = await $fetch(`/api/flags/${flagId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          action,
          moderatorNote,
          moderatorId: currentUser.value?.id,
        },
      })
      return result
    } catch (error) {
      console.error('Error moderating content:', error)
      throw error
    }
  }

  // Get user profile
  const getUserProfile = async userId => {
    try {
      const profile = await $fetch(`/api/users/${userId}`)
      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // Get comments for a specific resource
  const getCommentsForResource = async resourceId => {
    try {
      const comments = await $fetch(`/api/comments?resourceId=${resourceId}`)
      return comments
    } catch (error) {
      console.error('Error getting comments:', error)
      return []
    }
  }

  // Get user's activity history
  const getUserActivity = async userId => {
    try {
      const activity = await $fetch(`/api/users/${userId}/activity`)
      return activity
    } catch (error) {
      console.error('Error getting user activity:', error)
      return { comments: [], votes: [], totalActivity: 0 }
    }
  }

  // Get top contributors based on reputation or activity
  const getTopContributors = async (limitValue = 10) => {
    try {
      const contributors = await $fetch(`/api/users/top?limit=${limitValue}`)
      return contributors
    } catch (error) {
      console.error('Error getting top contributors:', error)
      return []
    }
  }

  // Return the composable functions
  const result = {
    // User management
    currentUser: readonly(currentUser),
    createProfile,
    updateProfile,
    getUserProfile,

    // Comment system
    addComment,
    addReply,
    editComment,
    deleteComment,
    getCommentsForResource,

    // Voting system
    vote,

    // Moderation
    flagContent,
    moderateContent,

    // Activity and stats
    getUserActivity,
    getTopContributors,
  }

  return result
}
