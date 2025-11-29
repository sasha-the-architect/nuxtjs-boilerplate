import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const resourceId = query.resourceId as string

  // Get all comments
  const comments = await getStoredComments()

  // Filter by resource ID if provided
  let filteredComments = comments
  if (resourceId) {
    filteredComments = comments.filter(
      comment =>
        comment.resourceId === resourceId && comment.status !== 'removed'
    )
  } else {
    // If no resourceId provided, return all active comments
    filteredComments = comments.filter(comment => comment.status !== 'removed')
  }

  return filteredComments
})

// Helper function
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
