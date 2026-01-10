// plugins/analytics.client.ts
// Client-side analytics plugin for automatic tracking

import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(nuxtApp => {
  // Track initial page view
  if (process.client) {
    import('~/utils/analytics').then(({ trackPageView }) => {
      // Wait for page to load before tracking
      if (window && document) {
        setTimeout(() => {
          trackPageView(window.location.pathname, document.title)
        }, 100)
      }

      // Track route changes
      nuxtApp.$router?.afterEach(
        (to: { path: string }, from: { path: string }) => {
          // Only track if route actually changed
          if (to.path !== from.path) {
            setTimeout(() => {
              trackPageView(to.path, document.title)
            }, 100)
          }
        }
      )
    })
  }

  return {
    provide: {
      analytics: {
        trackEvent: (type: string, properties?: Record<string, unknown>) => {
          if (process.client) {
            return import('~/utils/analytics').then(({ trackEvent }) =>
              trackEvent({ type, properties })
            )
          }
          return Promise.resolve(false)
        },
        trackPageView: (url: string, title?: string) => {
          if (process.client) {
            return import('~/utils/analytics').then(({ trackPageView }) =>
              trackPageView(url, title)
            )
          }
          return Promise.resolve(false)
        },
        trackResourceClick: (
          resourceId: string,
          title: string,
          category: string
        ) => {
          if (process.client) {
            return import('~/utils/analytics').then(({ trackResourceClick }) =>
              trackResourceClick(resourceId, title, category)
            )
          }
          return Promise.resolve(false)
        },
        trackResourceView: (
          resourceId: string,
          title: string,
          category: string
        ) => {
          if (process.client) {
            return import('~/utils/analytics').then(({ trackResourceView }) =>
              trackResourceView(resourceId, title, category)
            )
          }
          return Promise.resolve(false)
        },
        trackSearch: (query: string, resultsCount: number) => {
          if (process.client) {
            return import('~/utils/analytics').then(({ trackSearch }) =>
              trackSearch(query, resultsCount)
            )
          }
          return Promise.resolve(false)
        },
      },
    },
  }
})
