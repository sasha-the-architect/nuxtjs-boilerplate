import { setResponseHeader, setResponseStatus } from 'h3'
import {
  getBaseUrlFromConfig,
  STATIC_PAGES,
  buildSitemapUrlEntry,
  generateSitemapXML,
  generateSitemapErrorXML,
} from '../utils/sitemap'
import { logError } from '~/utils/errorLogger'

export default defineEventHandler(async event => {
  try {
    const baseUrl = getBaseUrlFromConfig()

    const entries = STATIC_PAGES.map(page =>
      buildSitemapUrlEntry(baseUrl, page)
    )

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return generateSitemapXML(entries)
  } catch (error) {
    logError(
      `Error generating /api/sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-sitemap'
    )

    setResponseStatus(event, 500)
    setResponseHeader(event, 'Content-Type', 'application/xml')
    return generateSitemapErrorXML()
  }
})
