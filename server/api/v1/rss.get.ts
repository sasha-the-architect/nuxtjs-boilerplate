import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { handleApiRouteError } from '~/server/utils/api-response'

/**
 * GET /api/v1/rss
 *
 * Generate RSS feed of latest resources
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Sort by date added (newest first) and limit to 50 for RSS
    resources = [...resources]
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      )
      .slice(0, 50)

    // Generate RSS XML
    const rssContent = generateRssFeed(resources)

    // Set's appropriate content type for RSS
    setResponseHeader(
      event,
      'Content-Type',
      'application/rss+xml; charset=utf-8'
    )

    return rssContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})

function generateRssFeed(resources: Resource[]): string {
  const config = useRuntimeConfig()
  const siteUrl =
    config.public.siteUrl ||
    config.public.canonicalUrl ||
    'http://localhost:3000' // Fallback to localhost for development
  const title = 'Free Developer Resources'
  const description = 'A collection of free resources for developers'
  const date = new Date().toUTCString()

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${siteUrl}</link>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en</language>
  `

  for (const resource of resources) {
    rss += `
    <item>
      <title><![CDATA[${resource.title}]]></title>
      <description><![CDATA[${resource.description}]]></description>
      <link>${resource.url}</link>
      <guid>${siteUrl}/resources/${resource.id}</guid>
      <pubDate>${new Date(resource.dateAdded).toUTCString()}</pubDate>
      <category><![CDATA[${resource.category}]]></category>
    </item>
    `
  }

  rss += `
  </channel>
</rss>`

  return rss
}
