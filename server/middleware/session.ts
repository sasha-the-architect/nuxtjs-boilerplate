import { defineEventHandler } from 'h3'
import { getSession } from '../utils/session'

// Middleware to load session for every request
export default defineEventHandler(async event => {
  // Load session and attach to event context
  const session = await getSession(event)
  event.context.session = session
})
