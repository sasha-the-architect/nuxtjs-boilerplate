import { defineEventHandler, sendRedirect } from 'h3'
import { clearSession } from '../../utils/session'

export default defineEventHandler(async event => {
  // Clear the user session
  await clearSession(event)

  // Redirect to home page or referer
  const referer = event.node.req.headers.referer || '/'
  await sendRedirect(event, referer)
})
