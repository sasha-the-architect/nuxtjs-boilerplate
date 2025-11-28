import { setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/sitemap
 *
 * Generate comprehensive sitemap including API endpoints and resource pages
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Get the base URL
    const config = useRuntimeConfig()
    const baseUrl =
      config.public.siteUrl ||
      config.public.canonicalUrl ||
      'https://nuxtjs-boilerplate.com' // Using a placeholder since this isn't defined in the project

    // Define the static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/ai-keys', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/search', priority: '0.9', changefreq: 'daily' },
      { url: '/submit', priority: '0.7', changefreq: 'monthly' },
      { url: '/favorites', priority: '0.8', changefreq: 'weekly' },
    ]

    // Define API endpoints
    const apiEndpoints = [
      { url: '/api/v1/resources', priority: '0.9', changefreq: 'daily' },
      { url: '/api/v1/categories', priority: '0.7', changefreq: 'weekly' },
      { url: '/api/v1/search', priority: '0.8', changefreq: 'daily' },
      { url: '/api/v1/export/json', priority: '0.6', changefreq: 'monthly' },
      { url: '/api/v1/export/csv', priority: '0.6', changefreq: 'monthly' },
      { url: '/api/v1/rss', priority: '0.8', changefreq: 'daily' },
    ]

    // Build the sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Add static pages to the sitemap
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
    })

    // Add API endpoints
    apiEndpoints.forEach(endpoint => {
      sitemap += `
  <url>
    <loc>${baseUrl}${endpoint.url}</loc>
    <priority>${endpoint.priority}</priority>
    <changefreq>${endpoint.changefreq}</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
    })

    // Add resource pages
    resources.forEach(resource => {
      sitemap += `
  <url>
    <loc>${baseUrl}/resources/${resource.id}</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date(resource.dateAdded).toISOString().split('T')[0]}</lastmod>
  </url>`
    })

    sitemap += `
</urlset>`

    // Set the content type to XML
    setResponseHeader(event, 'Content-Type', 'application/xml')

    return sitemap
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error generating sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-sitemap'
    )

    return `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
</error>`
  }
})
