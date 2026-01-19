import type { Resource } from '~/types/resource'

export interface SitemapEntry {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
}

export function getBaseUrl(): string {
  return 'http://localhost:3000'
}

export function getBaseUrlFromConfig(): string {
  const config = useRuntimeConfig()
  return (
    config.public.siteUrl ||
    config.public.canonicalUrl ||
    'http://localhost:3000'
  )
}

export const STATIC_PAGES: SitemapEntry[] = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/ai-keys', priority: '0.9', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/search', priority: '0.9', changefreq: 'daily' },
  { url: '/submit', priority: '0.7', changefreq: 'monthly' },
]

export const STATIC_PAGES_WITH_FAVORITES: SitemapEntry[] = [
  ...STATIC_PAGES,
  { url: '/favorites', priority: '0.8', changefreq: 'weekly' },
]

export function buildSitemapUrlEntry(
  baseUrl: string,
  entry: SitemapEntry
): string {
  const lastmod = entry.lastmod
    ? `<lastmod>${entry.lastmod}</lastmod>`
    : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`

  return `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <priority>${entry.priority}</priority>
    <changefreq>${entry.changefreq}</changefreq>
    ${lastmod}
  </url>`
}

export function buildResourceUrlEntry(
  baseUrl: string,
  resource: Resource
): string {
  return `  <url>
    <loc>${baseUrl}/resources/${resource.id}</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date(resource.dateAdded).toISOString().split('T')[0]}</lastmod>
  </url>`
}

export function generateSitemapXML(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`
}

export function generateSitemapErrorXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Failed to generate sitemap</message>
</error>`
}
