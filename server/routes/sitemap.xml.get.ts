import { setResponseStatus } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Set the content type to XML
    setResponseHeader(event, 'Content-Type', 'application/xml')

    // Get the base URL
    const config = useRuntimeConfig()
    const baseUrl =
      config.public.siteUrl ||
      config.public.canonicalUrl ||
      'http://localhost:3000'

    // Define the static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/ai-keys', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/search', priority: '0.9', changefreq: 'daily' },
      { url: '/submit', priority: '0.7', changefreq: 'monthly' },
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

    sitemap += `
</urlset>`

    return sitemap
  } catch (error) {
    if (process.dev) {
      console.error('Error generating sitemap.xml:', error)
    }

    setResponseStatus(event, 500)
    setResponseHeader(event, 'Content-Type', 'application/xml')
    return `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
</error>`
  }
})
