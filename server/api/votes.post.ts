import type { H3Event } from 'h3'
import { requireUser, getStoredUsers, saveUsers } from '~/server/utils/auth'

interface VoteRequestBody {
  targetType: string
  targetId: string
  voteType: 'up' | 'down'
}

export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const body = (await readBody(event)) as VoteRequestBody

  // Validate input
  if (!body.targetType || !body.targetId || !body.voteType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target type, target ID, and vote type are required',
    })
  }

  if (body.voteType !== 'up' && body.voteType !== 'down') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vote type must be "up" or "down"',
    })
  }

  // Check if user has already voted on this item
  const votes = await getStoredVotes()
  const existingVoteIndex = votes.findIndex(
    vote =>
      vote.targetType === body.targetType &&
      vote.targetId === body.targetId &&
      vote.userId === user.id
  )

  if (existingVoteIndex !== -1) {
    // Update existing vote
    const existingVote = votes[existingVoteIndex]
    if (existingVote.voteType === body.voteType) {
      // Remove vote if same type is cast again (toggle off)
      votes.splice(existingVoteIndex, 1)
      await saveVotes(votes)

      // Update target item vote count
      await updateTargetVoteCount(
        body.targetType,
        body.targetId,
        existingVote.voteType,
        -1
      )

      // Update user contributions
      await updateUserContributions(user.id, -1)

      return { success: true, removed: true, vote: null }
    } else {
      // Change vote type
      const oldVoteType = existingVote.voteType
      votes[existingVoteIndex].voteType = body.voteType
      votes[existingVoteIndex].timestamp = new Date().toISOString()
      await saveVotes(votes)

      // Update target item vote count (remove old, add new)
      await updateTargetVoteCount(
        body.targetType,
        body.targetId,
        oldVoteType,
        -1
      )
      await updateTargetVoteCount(
        body.targetType,
        body.targetId,
        body.voteType,
        1
      )

      return { success: true, changed: true, vote: votes[existingVoteIndex] }
    }
  } else {
    // Add new vote
    const newVote = {
      id: generateId(),
      targetType: body.targetType,
      targetId: body.targetId,
      userId: user.id,
      voteType: body.voteType,
      timestamp: new Date().toISOString(),
    }
    votes.push(newVote)
    await saveVotes(votes)

    // Update target item vote count
    await updateTargetVoteCount(
      body.targetType,
      body.targetId,
      body.voteType,
      1
    )

    // Update user contributions
    await updateUserContributions(user.id, 1)

    return { success: true, added: true, vote: newVote }
  }
})

// Helper function to update vote counts on target items
async function updateTargetVoteCount(
  targetType: string,
  targetId: string,
  voteType: string,
  change: number
) {
  // This is a simplified implementation - in reality, this would update the actual resource or comment
  if (targetType === 'comment') {
    const comments = await getStoredComments()
    const commentIndex = comments.findIndex(c => c.id === targetId)
    if (commentIndex !== -1) {
      comments[commentIndex].votes += change * (voteType === 'up' ? 1 : -1)
      await saveComments(comments)
    }
  }
  // Could extend for other target types like resources
}

// Helper function to update user contributions
async function updateUserContributions(userId: string, change: number) {
  const users = await getStoredUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].profile.contributions.votes += change
    users[userIndex].updatedAt = new Date().toISOString()
    await saveUsers(users)
  }
}

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

async function getStoredVotes() {
  try {
    const votesFile = await useStorage().getItem('votes.json')
    if (votesFile) {
      return JSON.parse(votesFile as string)
    }
    return []
  } catch {
    return []
  }
}

async function saveVotes(votes: any[]) {
  await useStorage().setItem('votes.json', JSON.stringify(votes))
}

async function getStoredComments() {
  try {
    const commentsFile = await useStorage().getItem('comments.json')
    if (commentsFile) {
      return JSON.parse(commentsFile as string)
    }
    return []
  } catch {
    return []
  }
}

async function saveComments(comments: any[]) {
  await useStorage().setItem('comments.json', JSON.stringify(comments))
}
