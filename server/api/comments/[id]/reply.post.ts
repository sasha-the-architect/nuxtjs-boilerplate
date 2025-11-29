import type { H3Event } from 'h3'
import { requireUser, getStoredUsers, saveUsers } from '~/server/utils/auth'

interface ReplyRequestBody {
  content: string
}

export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const commentId = getRouterParam(event, 'id')
  const body = (await readBody(event)) as ReplyRequestBody

  // Validate input
  if (!commentId || !body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comment ID and content are required',
    })
  }

  // Get the parent comment
  const comments = await getStoredComments()
  const parentCommentIndex = comments.findIndex(c => c.id === commentId)

  if (parentCommentIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  // Create new reply
  const newReply = {
    id: generateId(),
    content: body.content,
    userId: user.id,
    userName: user.name,
    parentId: commentId,
    timestamp: new Date().toISOString(),
    votes: 0,
    isEdited: false,
    status: 'active', // active, flagged, removed
  }

  // Add reply to parent comment
  comments[parentCommentIndex].replies =
    comments[parentCommentIndex].replies || []
  comments[parentCommentIndex].replies.push(newReply)
  await saveComments(comments)

  // Update user contributions
  const users = await getStoredUsers()
  const userIndex = users.findIndex(u => u.id === user.id)
  if (userIndex !== -1) {
    users[userIndex].profile.contributions.comments += 1
    users[userIndex].updatedAt = new Date().toISOString()
    await saveUsers(users)
  }

  return newReply
})

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
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
