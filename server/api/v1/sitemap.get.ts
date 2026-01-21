import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import {
  getBaseUrlFromConfig,
  STATIC_PAGES_WITH_FAVORITES,
  buildSitemapUrlEntry,
  buildResourceUrlEntry,
  generateSitemapXML,
} from '../../utils/sitemap'
import { handleApiRouteError } from '~/server/utils/api-response'

const API_ENDPOINTS = [
  { url: '/api/v1/resources', priority: '0.9', changefreq: 'daily' },
  { url: '/api/v1/categories', priority: '0.7', changefreq: 'weekly' },
  { url: '/api/v1/search', priority: '0.8', changefreq: 'daily' },
  { url: '/api/v1/export/json', priority: '0.6', changefreq: 'monthly' },
  { url: '/api/v1/export/csv', priority: '0.6', changefreq: 'monthly' },
  { url: '/api/v1/rss', priority: '0.8', changefreq: 'daily' },
] as const

export default defineEventHandler(async event => {
  try {
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const baseUrl = getBaseUrlFromConfig()

    const entries: string[] = []

    STATIC_PAGES_WITH_FAVORITES.forEach(page => {
      entries.push(buildSitemapUrlEntry(baseUrl, page))
    })

    API_ENDPOINTS.forEach(endpoint => {
      entries.push(buildSitemapUrlEntry(baseUrl, endpoint))
    })

    resources.forEach(resource => {
      entries.push(buildResourceUrlEntry(baseUrl, resource))
    })

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return generateSitemapXML(entries)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
