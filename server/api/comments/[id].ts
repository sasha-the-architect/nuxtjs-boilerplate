import type { H3Event } from 'h3'
import { requireUser } from '~/server/utils/auth'

interface UpdateCommentRequestBody {
  content: string
}

export default defineEventHandler(async (event: H3Event) => {
  const method = event.method
  const commentId = getRouterParam(event, 'id')

  if (method === 'PUT') {
    return await updateComment(event, commentId)
  } else if (method === 'DELETE') {
    return await deleteComment(event, commentId)
  } else {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  }
})

async function updateComment(event: H3Event, commentId: string) {
  const user = await requireUser(event)
  const body = (await readBody(event)) as UpdateCommentRequestBody

  // Validate input
  if (!commentId || !body.content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comment ID and content are required',
    })
  }

  // Get comments
  const comments = await getStoredComments()
  const commentIndex = comments.findIndex(c => c.id === commentId)

  if (commentIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  // Check if user owns the comment
  if (comments[commentIndex].userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only edit your own comments',
    })
  }

  // Update comment
  comments[commentIndex].content = body.content
  comments[commentIndex].isEdited = true
  comments[commentIndex].editedAt = new Date().toISOString()
  await saveComments(comments)

  return comments[commentIndex]
}

async function deleteComment(event: H3Event, commentId: string) {
  const user = await requireUser(event)

  // Validate input
  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comment ID is required',
    })
  }

  // Get comments
  const comments = await getStoredComments()
  const commentIndex = comments.findIndex(c => c.id === commentId)

  if (commentIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  // Check if user owns the comment
  if (comments[commentIndex].userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only delete your own comments',
    })
  }

  // Instead of completely deleting, mark as removed for moderation trail
  comments[commentIndex].status = 'removed'
  comments[commentIndex].content = '[Comment removed by user]'
  await saveComments(comments)

  return { success: true }
}

// Helper functions
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
