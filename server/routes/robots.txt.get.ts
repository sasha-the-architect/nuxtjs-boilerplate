export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const baseUrl =
    config.public.siteUrl ||
    config.public.canonicalUrl ||
    process.env.NUXT_PUBLIC_URL ||
    process.env.CANONICAL_URL ||
    'http://localhost:3000'

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`

  setResponseHeader(event, 'Content-Type', 'text/plain')
  return robotsTxt
})
