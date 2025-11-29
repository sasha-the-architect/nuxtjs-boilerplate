import type { H3Event } from 'h3'
import { requireUser } from '~/server/utils/auth'

interface FlagRequestBody {
  targetType: string
  targetId: string
  reason: string
  details?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const body = (await readBody(event)) as FlagRequestBody

  // Validate input
  if (!body.targetType || !body.targetId || !body.reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target type, target ID, and reason are required',
    })
  }

  // Create new flag
  const newFlag = {
    id: generateId(),
    targetType: body.targetType,
    targetId: body.targetId,
    flaggedBy: user.id,
    reason: body.reason,
    details: body.details || '',
    timestamp: new Date().toISOString(),
    status: 'pending', // pending, reviewed, resolved
  }

  // Save flag to storage (in a real app, this would be a database)
  const flags = await getStoredFlags()
  flags.push(newFlag)
  await saveFlags(flags)

  return newFlag
})

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

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
