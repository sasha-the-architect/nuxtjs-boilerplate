/**
 * Composable for community features
 * Implements basic community functionality including user profiles, comments, voting, and moderation
 */

export const useCommunityFeatures = (
  initialUsers = [],
  initialComments = [],
  initialVotes = []
) => {
  // User data
  const users = initialUsers
  // Comments data
  const comments = initialComments
  // Votes data
  const votes = initialVotes
  // Flags data
  const flags = []

  // Current user (for demo purposes)
  let currentUser = null

  // Set current user
  const setCurrentUser = user => {
    currentUser = user
  }

  // User profile management
  const createProfile = userData => {
    const profile = {
      id: generateId(),
      ...userData,
      joinDate: new Date().toISOString(),
      reputation: 0,
      contributions: {
        comments: 0,
        resources: 0,
        votes: 0,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
      },
    }
    users.push(profile)
    return profile
  }

  const updateProfile = (userId, updates) => {
    // Use a for loop instead of findIndex to avoid compatibility issues
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        users[i] = { ...users[i], ...updates }
        return users[i]
      }
    }
    return null
  }

  // Comment system
  const addComment = commentData => {
    if (!currentUser) {
      throw new Error('User must be logged in to comment')
    }

    const comment = {
      id: generateId(),
      ...commentData,
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username,
      timestamp: new Date().toISOString(),
      votes: 0,
      replies: [],
      isEdited: false,
      status: 'active', // active, flagged, removed
    }
    comments.push(comment)

    // Update user contributions
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === currentUser.id) {
        users[i].contributions.comments += 1
        break
      }
    }

    return comment
  }

  const addReply = (commentId, replyData) => {
    if (!currentUser) {
      throw new Error('User must be logged in to reply')
    }

    // Find parent comment using for loop
    let parentComment = null
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === commentId) {
        parentComment = comments[i]
        break
      }
    }

    if (!parentComment) return null

    const reply = {
      id: generateId(),
      ...replyData,
      userId: currentUser.id,
      userName: currentUser.name || currentUser.username,
      timestamp: new Date().toISOString(),
      votes: 0,
      isEdited: false,
      status: 'active',
    }

    parentComment.replies.push(reply)
    return reply
  }

  const editComment = (commentId, newContent) => {
    // Find comment using for loop
    for (let i = 0; i < comments.length; i++) {
      if (
        comments[i].id === commentId &&
        comments[i].userId === currentUser?.id
      ) {
        comments[i].content = newContent
        comments[i].isEdited = true
        comments[i].editedAt = new Date().toISOString()
        return comments[i]
      }
    }
    return null
  }

  const deleteComment = commentId => {
    for (let i = 0; i < comments.length; i++) {
      if (
        comments[i].id === commentId &&
        comments[i].userId === currentUser?.id
      ) {
        // Instead of completely deleting, mark as removed for moderation trail
        comments[i].status = 'removed'
        comments[i].content = '[Comment removed by user]'
        return true
      }
    }
    return false
  }

  // Voting system
  const vote = (targetType, targetId, voteType) => {
    if (!currentUser) {
      throw new Error('User must be logged in to vote')
    }

    // Check if user has already voted on this item using for loop
    let existingVoteIndex = -1
    for (let i = 0; i < votes.length; i++) {
      if (
        votes[i].targetType === targetType &&
        votes[i].targetId === targetId &&
        votes[i].userId === currentUser.id
      ) {
        existingVoteIndex = i
        break
      }
    }

    if (existingVoteIndex !== -1) {
      // Update existing vote
      const existingVote = votes[existingVoteIndex]
      if (existingVote.voteType === voteType) {
        // Remove vote if same type is cast again (toggle off)
        votes.splice(existingVoteIndex, 1)

        // Update target item vote count
        updateTargetVoteCount(targetType, targetId, existingVote.voteType, -1)

        // Update user contributions
        updateUserContributions(currentUser.id, -1)

        return { success: true, removed: true }
      } else {
        // Change vote type
        const oldVoteType = existingVote.voteType
        votes[existingVoteIndex].voteType = voteType
        votes[existingVoteIndex].timestamp = new Date().toISOString()

        // Update target item vote count (remove old, add new)
        updateTargetVoteCount(targetType, targetId, oldVoteType, -1)
        updateTargetVoteCount(targetType, targetId, voteType, 1)

        return { success: true, changed: true }
      }
    } else {
      // Add new vote
      const newVote = {
        id: generateId(),
        targetType,
        targetId,
        userId: currentUser.id,
        voteType, // 'up' or 'down'
        timestamp: new Date().toISOString(),
      }
      votes.push(newVote)

      // Update target item vote count
      updateTargetVoteCount(targetType, targetId, voteType, 1)

      // Update user contributions
      updateUserContributions(currentUser.id, 1)

      return { success: true, added: true }
    }
  }

  // Helper function to update vote counts on target items
  const updateTargetVoteCount = (targetType, targetId, voteType, change) => {
    // This is a simplified implementation - in reality, this would update the actual resource or comment
    if (targetType === 'comment') {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === targetId) {
          comments[i].votes += change * (voteType === 'up' ? 1 : -1)
          break
        }
      }
    }
    // Could extend for other target types like resources
  }

  // Helper function to update user contributions
  const updateUserContributions = (userId, change) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        users[i].contributions.votes += change
        break
      }
    }
  }

  // Moderation system
  const flagContent = (targetType, targetId, reason, details = '') => {
    if (!currentUser) {
      throw new Error('User must be logged in to flag content')
    }

    const flag = {
      id: generateId(),
      targetType,
      targetId,
      flaggedBy: currentUser.id,
      reason,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, reviewed, resolved
    }

    flags.push(flag)

    return flag
  }

  const moderateContent = (flagId, action, moderatorNote = '') => {
    if (!currentUser || !currentUser.isModerator) {
      throw new Error('User must be a moderator to moderate content')
    }

    let flag = null
    let flagIndex = -1
    for (let i = 0; i < flags.length; i++) {
      if (flags[i].id === flagId) {
        flag = flags[i]
        flagIndex = i
        break
      }
    }

    if (!flag) return false

    flag.status = 'reviewed'
    flag.moderator = currentUser.id
    flag.moderatorNote = moderatorNote
    flag.actionTaken = action // 'approved', 'removed', 'warning', etc.

    // Take action on the flagged content
    if (flag.targetType === 'comment' && action === 'removed') {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === flag.targetId) {
          comments[i].status = 'removed'
          comments[i].content = '[Content removed by moderator]'
          break
        }
      }
    }

    return true
  }

  // Helper function to generate IDs
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // Get user profile
  const getUserProfile = userId => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        return users[i]
      }
    }
    return null
  }

  // Get comments for a specific resource
  const getCommentsForResource = resourceId => {
    const result = []
    for (let i = 0; i < comments.length; i++) {
      if (
        comments[i].resourceId === resourceId &&
        comments[i].status !== 'removed'
      ) {
        result.push(comments[i])
      }
    }
    return result
  }

  // Get user's activity history
  const getUserActivity = userId => {
    const userComments = []
    const userVotes = []

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].userId === userId) {
        userComments.push(comments[i])
      }
    }

    for (let i = 0; i < votes.length; i++) {
      if (votes[i].userId === userId) {
        userVotes.push(votes[i])
      }
    }

    return {
      comments: userComments,
      votes: userVotes,
      totalActivity: userComments.length + userVotes.length,
    }
  }

  // Get top contributors based on reputation or activity
  const getTopContributors = limitValue => {
    if (limitValue === undefined) limitValue = 10
    // Create a copy of users array and sort by reputation
    const sortedUsers = []
    for (let i = 0; i < users.length; i++) {
      sortedUsers.push(users[i])
    }

    sortedUsers.sort((a, b) => b.reputation - a.reputation)

    // Limit the results
    const result = []
    for (let i = 0; i < Math.min(limitValue, sortedUsers.length); i++) {
      result.push(sortedUsers[i])
    }

    return result
  }

  // Return the composable functions
  const result = {
    // User management
    setCurrentUser,
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

    // Data access
    users,
    comments,
    votes,
    flags,
  }

  return result
}
