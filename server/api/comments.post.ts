import type { H3Event } from 'h3'
import { requireUser, getStoredUsers, saveUsers } from '~/server/utils/auth'

interface CommentRequestBody {
  resourceId: string
  content: string
  parentId?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const body = (await readBody(event)) as CommentRequestBody

  // Validate input
  if (!body.resourceId || !body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Resource ID and content are required',
    })
  }

  // In a real application, you would verify the resource exists
  // For this example, we'll proceed without that check

  // Create new comment
  const newComment = {
    id: generateId(),
    resourceId: body.resourceId,
    content: body.content,
    userId: user.id,
    userName: user.name,
    parentId: body.parentId || null,
    timestamp: new Date().toISOString(),
    votes: 0,
    replies: [],
    isEdited: false,
    status: 'active', // active, flagged, removed
  }

  // Save comment to storage (in a real app, this would be a database)
  const comments = await getStoredComments()
  comments.push(newComment)
  await saveComments(comments)

  // Update user contributions
  const users = await getStoredUsers()
  const userIndex = users.findIndex(u => u.id === user.id)
  if (userIndex !== -1) {
    users[userIndex].profile.contributions.comments += 1
    users[userIndex].updatedAt = new Date().toISOString()
    await saveUsers(users)
  }

  return newComment
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
