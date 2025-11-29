import type { H3Event } from 'h3'
import { requireRole } from '~/server/utils/auth'

interface ModerateRequestBody {
  action: string
  moderatorNote?: string
}

export default defineEventHandler(async (event: H3Event) => {
  // Require moderator or admin role to moderate content
  const user = await requireRole(event, 'moderator')
  const flagId = getRouterParam(event, 'id')
  const body = (await readBody(event)) as ModerateRequestBody

  // Validate input
  if (!flagId || !body.action) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Flag ID and action are required',
    })
  }

  // Get flags
  const flags = await getStoredFlags()
  const flagIndex = flags.findIndex(f => f.id === flagId)

  if (flagIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Flag not found',
    })
  }

  // Update flag status
  flags[flagIndex].status = 'reviewed'
  flags[flagIndex].moderator = user.id
  flags[flagIndex].moderatorNote = body.moderatorNote || ''
  flags[flagIndex].actionTaken = body.action
  flags[flagIndex].reviewedAt = new Date().toISOString()

  await saveFlags(flags)

  // Take action on the flagged content
  if (flags[flagIndex].targetType === 'comment' && body.action === 'removed') {
    const comments = await getStoredComments()
    const commentIndex = comments.findIndex(
      c => c.id === flags[flagIndex].targetId
    )
    if (commentIndex !== -1) {
      comments[commentIndex].status = 'removed'
      comments[commentIndex].content = '[Content removed by moderator]'
      await saveComments(comments)
    }
  }

  return { success: true }
})

// Helper functions
async function getStoredFlags() {
  try {
    const flagsFile = await useStorage().getItem('flags.json')
    if (flagsFile) {
      return JSON.parse(flagsFile as string)
    }
    return []
  } catch {
    return []
  }
}

async function saveFlags(flags: any[]) {
  await useStorage().setItem('flags.json', JSON.stringify(flags))
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
