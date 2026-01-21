import { setResponseHeader } from 'h3'
import {
  getBaseUrlFromConfig,
  STATIC_PAGES,
  buildSitemapUrlEntry,
  generateSitemapXML,
} from '../utils/sitemap'
import { handleApiRouteError } from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const baseUrl = getBaseUrlFromConfig()

    const entries = STATIC_PAGES.map(page =>
      buildSitemapUrlEntry(baseUrl, page)
    )

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return generateSitemapXML(entries)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
