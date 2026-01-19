import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getBaseUrl,
  getBaseUrlFromConfig,
  STATIC_PAGES,
  STATIC_PAGES_WITH_FAVORITES,
  buildSitemapUrlEntry,
  buildResourceUrlEntry,
  generateSitemapXML,
  generateSitemapErrorXML,
  type SitemapEntry,
} from '~/server/utils/sitemap'
import type { Resource } from '~/types/resource'

describe('getBaseUrl', () => {
  describe('Happy Path - Returns hardcoded localhost URL', () => {
    it('should return localhost:3000 as hardcoded base URL', () => {
      const baseUrl = getBaseUrl()
      expect(baseUrl).toBe('http://localhost:3000')
    })

    it('should return consistent URL across multiple calls', () => {
      const baseUrl1 = getBaseUrl()
      const baseUrl2 = getBaseUrl()
      expect(baseUrl1).toBe(baseUrl2)
      expect(baseUrl1).toBe('http://localhost:3000')
    })
  })
})

describe('getBaseUrlFromConfig', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('Happy Path - Uses runtime config with fallback', () => {
    it('should use siteUrl from config if available', () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: {
          siteUrl: 'https://example.com',
          canonicalUrl: 'https://canon.com',
        },
      }))

      const baseUrl = getBaseUrlFromConfig()
      expect(baseUrl).toBe('https://example.com')
    })

    it('should use canonicalUrl from config if siteUrl not available', () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: {
          canonicalUrl: 'https://canon.com',
        },
      }))

      const baseUrl = getBaseUrlFromConfig()
      expect(baseUrl).toBe('https://canon.com')
    })

    it('should fallback to localhost if neither siteUrl nor canonicalUrl available', () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: {},
      }))

      const baseUrl = getBaseUrlFromConfig()
      expect(baseUrl).toBe('http://localhost:3000')
    })

    it('should fallback to localhost if config.public is empty object', () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: {},
      }))

      const baseUrl = getBaseUrlFromConfig()
      expect(baseUrl).toBe('http://localhost:3000')
    })

    it('should handle empty string siteUrl by falling back to localhost', () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        public: {
          siteUrl: '',
        },
      }))

      const baseUrl = getBaseUrlFromConfig()
      expect(baseUrl).toBe('http://localhost:3000')
    })
  })
})

describe('STATIC_PAGES', () => {
  describe('Happy Path - Static page definitions', () => {
    it('should be an array of sitemap entries', () => {
      expect(Array.isArray(STATIC_PAGES)).toBe(true)
      expect(STATIC_PAGES.length).toBeGreaterThan(0)
    })

    it('should contain expected static pages', () => {
      const urls = STATIC_PAGES.map(page => page.url)
      expect(urls).toContain('/')
      expect(urls).toContain('/ai-keys')
      expect(urls).toContain('/about')
      expect(urls).toContain('/search')
      expect(urls).toContain('/submit')
    })

    it('should have valid SitemapEntry structure', () => {
      STATIC_PAGES.forEach((page: SitemapEntry) => {
        expect(page).toHaveProperty('url')
        expect(page).toHaveProperty('priority')
        expect(page).toHaveProperty('changefreq')
        expect(typeof page.url).toBe('string')
        expect(typeof page.priority).toBe('string')
        expect(typeof page.changefreq).toBe('string')
      })
    })

    it('should have valid priority values', () => {
      STATIC_PAGES.forEach((page: SitemapEntry) => {
        const priority = parseFloat(page.priority)
        expect(priority).toBeGreaterThanOrEqual(0)
        expect(priority).toBeLessThanOrEqual(1)
      })
    })

    it('should assign highest priority to home page', () => {
      const homePage = STATIC_PAGES.find(p => p.url === '/')
      expect(homePage?.priority).toBe('1.0')
    })

    it('should assign daily changefreq to high-traffic pages', () => {
      const homePage = STATIC_PAGES.find(p => p.url === '/')
      const searchPage = STATIC_PAGES.find(p => p.url === '/search')
      expect(homePage?.changefreq).toBe('daily')
      expect(searchPage?.changefreq).toBe('daily')
    })

    it('should assign monthly changefreq to low-traffic pages', () => {
      const aboutPage = STATIC_PAGES.find(p => p.url === '/about')
      const submitPage = STATIC_PAGES.find(p => p.url === '/submit')
      expect(aboutPage?.changefreq).toBe('monthly')
      expect(submitPage?.changefreq).toBe('monthly')
    })
  })

  describe('Edge Cases', () => {
    it('should not contain duplicate URLs', () => {
      const urls = STATIC_PAGES.map(page => page.url)
      const uniqueUrls = new Set(urls)
      expect(urls.length).toBe(uniqueUrls.size)
    })

    it('should have URLs starting with /', () => {
      STATIC_PAGES.forEach((page: SitemapEntry) => {
        expect(page.url.startsWith('/')).toBe(true)
      })
    })
  })
})

describe('STATIC_PAGES_WITH_FAVORITES', () => {
  describe('Happy Path - Includes favorites page', () => {
    it('should extend STATIC_PAGES with favorites', () => {
      expect(STATIC_PAGES_WITH_FAVORITES.length).toBe(STATIC_PAGES.length + 1)
      STATIC_PAGES.forEach(page => {
        expect(STATIC_PAGES_WITH_FAVORITES).toContainEqual(page)
      })
    })

    it('should contain favorites page', () => {
      const favoritesPage = STATIC_PAGES_WITH_FAVORITES.find(
        p => p.url === '/favorites'
      )
      expect(favoritesPage).toBeDefined()
      expect(favoritesPage?.url).toBe('/favorites')
      expect(favoritesPage?.priority).toBe('0.8')
      expect(favoritesPage?.changefreq).toBe('weekly')
    })

    it('should maintain structure for all entries', () => {
      STATIC_PAGES_WITH_FAVORITES.forEach((page: SitemapEntry) => {
        expect(page).toHaveProperty('url')
        expect(page).toHaveProperty('priority')
        expect(page).toHaveProperty('changefreq')
      })
    })
  })
})

describe('buildSitemapUrlEntry', () => {
  describe('Happy Path - Builds valid XML entries', () => {
    it('should build valid XML entry with all fields', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/test',
        priority: '0.5',
        changefreq: 'weekly',
        lastmod: '2024-01-01',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)

      expect(result).toContain('<url>')
      expect(result).toContain(`  <loc>${baseUrl}${entry.url}</loc>`)
      expect(result).toContain(`<priority>${entry.priority}</priority>`)
      expect(result).toContain(`<changefreq>${entry.changefreq}</changefreq>`)
      expect(result).toContain(`<lastmod>${entry.lastmod}</lastmod>`)
      expect(result).toContain('</url>')
    })

    it('should build XML entry without lastmod field', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/test',
        priority: '0.5',
        changefreq: 'weekly',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)

      expect(result).toContain('<url>')
      expect(result).toContain(`  <loc>${baseUrl}${entry.url}</loc>`)
      expect(result).toContain(`<priority>${entry.priority}</priority>`)
      expect(result).toContain(`<changefreq>${entry.changefreq}</changefreq>`)
      expect(result).toContain('<lastmod>')
      expect(result).toContain('</url>')
    })

    it('should auto-generate lastmod as ISO date when not provided', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/test',
        priority: '0.5',
        changefreq: 'weekly',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)
      const lastmodMatch = result.match(/<lastmod>([^<]+)<\/lastmod>/)

      expect(lastmodMatch).toBeTruthy()
      if (lastmodMatch) {
        expect(lastmodMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        const date = new Date(lastmodMatch[1])
        expect(date.getTime()).not.toBeNaN()
      }
    })

    it('should concatenate baseUrl and entry url correctly', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/about',
        priority: '0.8',
        changefreq: 'monthly',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)

      expect(result).toContain('<loc>https://example.com/about</loc>')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in URL', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/page-with-dashes_and_underscores',
        priority: '0.5',
        changefreq: 'weekly',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)
      expect(result).toContain(
        '<loc>https://example.com/page-with-dashes_and_underscores</loc>'
      )
    })

    it('should handle query parameters in URL', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/search?q=test',
        priority: '0.5',
        changefreq: 'weekly',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)
      expect(result).toContain('<loc>https://example.com/search?q=test</loc>')
    })

    it('should handle priority as string', () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/test',
        priority: '1.0',
        changefreq: 'daily',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)
      expect(result).toContain('<priority>1.0</priority>')
    })

    it("should handle empty string lastmod by generating today's date", () => {
      const baseUrl = 'https://example.com'
      const entry: SitemapEntry = {
        url: '/test',
        priority: '0.5',
        changefreq: 'weekly',
        lastmod: '',
      }

      const result = buildSitemapUrlEntry(baseUrl, entry)
      const lastmodMatch = result.match(/<lastmod>([^<]+)<\/lastmod>/)

      expect(lastmodMatch).toBeTruthy()
      if (lastmodMatch) {
        expect(lastmodMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        const date = new Date(lastmodMatch[1])
        expect(date.getTime()).not.toBeNaN()
      }
    })
  })
})

describe('buildResourceUrlEntry', () => {
  describe('Happy Path - Builds resource-specific XML entries', () => {
    it('should build valid XML entry for resource', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource-123',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        benefits: ['Benefit 1', 'Benefit 2'],
        tags: ['test', 'unit'],
        pricingModel: 'free',
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)

      expect(result).toContain('<url>')
      expect(result).toContain(`<loc>${baseUrl}/resources/${resource.id}</loc>`)
      expect(result).toContain('<priority>0.7</priority>')
      expect(result).toContain('<changefreq>weekly</changefreq>')
      expect(result).toContain('</url>')
    })

    it('should parse dateAdded for lastmod field', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource-123',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        tags: ['test'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15T10:30:00Z',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)
      const lastmodMatch = result.match(/<lastmod>([^<]+)<\/lastmod>/)

      expect(lastmodMatch).toBeTruthy()
      if (lastmodMatch) {
        expect(lastmodMatch[1]).toBe('2024-01-15')
      }
    })

    it('should have fixed priority of 0.7 for all resources', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource-123',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        tags: ['test'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)
      expect(result).toContain('<priority>0.7</priority>')
    })

    it('should have fixed changefreq of weekly for all resources', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource-123',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        tags: ['test'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)
      expect(result).toContain('<changefreq>weekly</changefreq>')
    })
  })

  describe('Edge Cases', () => {
    it('should handle resource with special characters in ID', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource_with-special.chars',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        tags: ['test'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)
      expect(result).toContain(
        '<loc>https://example.com/resources/resource_with-special.chars</loc>'
      )
    })

    it('should handle ISO date format with time component', () => {
      const baseUrl = 'https://example.com'
      const resource: Resource = {
        id: 'resource-123',
        title: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        tags: ['test'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://resource.com',
        dateAdded: '2024-01-15T14:30:45.123Z',
        popularity: 10,
      }

      const result = buildResourceUrlEntry(baseUrl, resource)
      const lastmodMatch = result.match(/<lastmod>([^<]+)<\/lastmod>/)

      expect(lastmodMatch).toBeTruthy()
      if (lastmodMatch) {
        expect(lastmodMatch[1]).toBe('2024-01-15')
      }
    })
  })
})

describe('generateSitemapXML', () => {
  describe('Happy Path - Generates complete sitemap XML', () => {
    it('should generate valid XML with entries', () => {
      const entries = [
        '  <url>\n    <loc>https://example.com/page1</loc>\n    <priority>0.5</priority>\n    <changefreq>weekly</changefreq>\n  </url>',
        '  <url>\n    <loc>https://example.com/page2</loc>\n    <priority>0.8</priority>\n    <changefreq>daily</changefreq>\n  </url>',
      ]

      const result = generateSitemapXML(entries)

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
      expect(result).toContain(entries[0])
      expect(result).toContain(entries[1])
      expect(result).toContain('</urlset>')
    })

    it('should join entries with newlines', () => {
      const entries = [
        '  <url>\n    <loc>https://example.com/page1</loc>\n  </url>',
        '  <url>\n    <loc>https://example.com/page2</loc>\n  </url>',
      ]

      const result = generateSitemapXML(entries)

      expect(result).toContain(entries[0] + '\n' + entries[1])
    })

    it('should handle single entry', () => {
      const entries = [
        '  <url>\n    <loc>https://example.com/page1</loc>\n    <priority>0.5</priority>\n  </url>',
      ]

      const result = generateSitemapXML(entries)

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
      expect(result).toContain(entries[0])
      expect(result).toContain('</urlset>')
    })

    it('should have correct XML declaration', () => {
      const entries: string[] = []

      const result = generateSitemapXML(entries)

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    it('should have correct urlset namespace', () => {
      const entries: string[] = []

      const result = generateSitemapXML(entries)

      expect(result).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty entries array', () => {
      const entries: string[] = []

      const result = generateSitemapXML(entries)

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
      expect(result).toContain('</urlset>')
      expect(result).not.toContain('<url>')
    })

    it('should handle entries with URL query parameters', () => {
      const entries = [
        '  <url>\n    <loc>https://example.com/page?param=test&other=value</loc>\n  </url>',
      ]

      const result = generateSitemapXML(entries)

      expect(result).toContain('param=test&other=value')
      expect(result).toContain(
        'https://example.com/page?param=test&other=value'
      )
    })
  })
})

describe('generateSitemapErrorXML', () => {
  describe('Happy Path - Generates error XML response', () => {
    it('should generate valid error XML', () => {
      const result = generateSitemapErrorXML()

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result).toContain('<error>')
      expect(result).toContain('<message>Failed to generate sitemap</message>')
      expect(result).toContain('</error>')
    })

    it('should have correct XML declaration', () => {
      const result = generateSitemapErrorXML()

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    it('should have descriptive error message', () => {
      const result = generateSitemapErrorXML()

      expect(result).toContain('<message>Failed to generate sitemap</message>')
    })
  })

  describe('Edge Cases', () => {
    it('should return consistent XML on multiple calls', () => {
      const result1 = generateSitemapErrorXML()
      const result2 = generateSitemapErrorXML()

      expect(result1).toBe(result2)
    })

    it('should not contain any urlset elements', () => {
      const result = generateSitemapErrorXML()

      expect(result).not.toContain('<urlset')
      expect(result).not.toContain('<url>')
    })
  })
})

describe('Integration Tests', () => {
  describe('Complete sitemap generation workflow', () => {
    it('should generate complete sitemap for static pages', () => {
      const baseUrl = 'https://example.com'
      const entries = STATIC_PAGES.map(page =>
        buildSitemapUrlEntry(baseUrl, page)
      )
      const sitemap = generateSitemapXML(entries)

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemap).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
      expect(sitemap).toContain('<loc>https://example.com/</loc>')
      expect(sitemap).toContain('<loc>https://example.com/search</loc>')
      expect(sitemap).toContain('</urlset>')
    })

    it('should generate complete sitemap for resources', () => {
      const baseUrl = 'https://example.com'
      const resources: Resource[] = [
        {
          id: 'res-1',
          title: 'Resource 1',
          description: 'Description',
          category: 'Test',
          tags: ['tag1'],
          benefits: ['Test benefit'],
          pricingModel: 'free',
          difficulty: 'beginner',
          technology: ['TypeScript'],
          url: 'https://res1.com',
          dateAdded: '2024-01-01',
          popularity: 10,
        },
        {
          id: 'res-2',
          title: 'Resource 2',
          description: 'Description',
          category: 'Test',
          tags: ['tag2'],
          pricingModel: 'paid',
          benefits: ['Test benefit'],
          difficulty: 'advanced',
          technology: ['JavaScript'],
          url: 'https://res2.com',
          dateAdded: '2024-01-02',
          popularity: 20,
        },
      ]

      const entries = resources.map(resource =>
        buildResourceUrlEntry(baseUrl, resource)
      )
      const sitemap = generateSitemapXML(entries)

      expect(sitemap).toContain(
        '<loc>https://example.com/resources/res-1</loc>'
      )
      expect(sitemap).toContain(
        '<loc>https://example.com/resources/res-2</loc>'
      )
      expect(sitemap).toContain('<lastmod>2024-01-01</lastmod>')
      expect(sitemap).toContain('<lastmod>2024-01-02</lastmod>')
    })

    it('should generate complete sitemap for mixed content', () => {
      const baseUrl = 'https://example.com'
      const staticEntries = STATIC_PAGES.map(page =>
        buildSitemapUrlEntry(baseUrl, page)
      )
      const resource: Resource = {
        id: 'res-1',
        title: 'Resource',
        description: 'Description',
        category: 'Test',
        tags: ['tag'],
        pricingModel: 'free',
        benefits: ['Test benefit'],
        difficulty: 'beginner',
        technology: ['TypeScript'],
        url: 'https://res.com',
        dateAdded: '2024-01-15',
        popularity: 10,
      }
      const resourceEntry = buildResourceUrlEntry(baseUrl, resource)
      const allEntries = [...staticEntries, resourceEntry]
      const sitemap = generateSitemapXML(allEntries)

      expect(sitemap).toContain('<loc>https://example.com/</loc>')
      expect(sitemap).toContain(
        '<loc>https://example.com/resources/res-1</loc>'
      )
      expect(sitemap).toContain('</urlset>')
    })
  })

  describe('Error handling workflow', () => {
    it('should generate error XML when sitemap generation fails', () => {
      const errorXml = generateSitemapErrorXML()

      expect(errorXml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(errorXml).toContain('<error>')
      expect(errorXml).toContain(
        '<message>Failed to generate sitemap</message>'
      )
      expect(errorXml).toContain('</error>')
    })
  })

  describe('Performance considerations', () => {
    it('should handle large number of entries efficiently', () => {
      const baseUrl = 'https://example.com'
      const entries: string[] = []

      for (let i = 0; i < 1000; i++) {
        entries.push(
          buildSitemapUrlEntry(baseUrl, {
            url: `/page-${i}`,
            priority: '0.5',
            changefreq: 'weekly',
          })
        )
      }

      const sitemap = generateSitemapXML(entries)

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(sitemap).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      )
      expect(sitemap.split('<url>').length - 1).toBe(1000)
    })
  })

  describe('Data consistency', () => {
    it('should maintain consistent priority and changefreq formats', () => {
      const baseUrl = 'https://example.com'
      const entries = STATIC_PAGES.map(page =>
        buildSitemapUrlEntry(baseUrl, page)
      )

      entries.forEach(entry => {
        const priorityMatch = entry.match(/<priority>([^<]+)<\/priority>/)
        const changefreqMatch = entry.match(/<changefreq>([^<]+)<\/changefreq>/)

        expect(priorityMatch).toBeTruthy()
        expect(changefreqMatch).toBeTruthy()

        if (priorityMatch && changefreqMatch) {
          expect(parseFloat(priorityMatch[1])).not.toBeNaN()
          expect(['daily', 'weekly', 'monthly', 'yearly']).toContain(
            changefreqMatch[1]
          )
        }
      })
    })

    it('should ensure all generated URLs are valid', () => {
      const baseUrl = 'https://example.com'
      const entries = STATIC_PAGES.map(page =>
        buildSitemapUrlEntry(baseUrl, page)
      )

      entries.forEach(entry => {
        const locMatch = entry.match(/<loc>([^<]+)<\/loc>/)

        expect(locMatch).toBeTruthy()
        if (locMatch) {
          expect(locMatch[1]).toMatch(/^https?:\/\/.+/)
        }
      })
    })
  })
})
