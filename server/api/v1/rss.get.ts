import { setResponseHeader } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

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

    // Set the appropriate content type for RSS
    setResponseHeader(
      event,
      'Content-Type',
      'application/rss+xml; charset=utf-8'
    )

    return rssContent
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error generating RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-rss'
    )

    return {
      success: false,
      message: 'An error occurred while generating RSS feed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})

function generateRssFeed(resources: Resource[]): string {
  const siteUrl = 'https://nuxtjs-boilerplate.com' // This should be configurable
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
