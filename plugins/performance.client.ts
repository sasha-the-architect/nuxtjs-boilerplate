// plugins/performance.client.ts
// Client-side performance monitoring plugin
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Check if we're in the browser and Web Vitals is available
    if ('PerformanceObserver' in window && 'measure' in performance) {
      // Enhanced performance monitoring with additional metrics
      const perfEntries: PerformanceEntryList = []

      // Send performance metrics to analytics or logging service
      const sendToAnalytics = (metric: {
        name: string
        value: number
        id: string
        delta: number
      }) => {
        // Log metrics for debugging in development
        /* eslint-disable no-console */
        if (process.env.NODE_ENV === 'development') {
          console.log(`${metric.name}: ${metric.value}`)
        }
        /* eslint-enable no-console */

        // Store metrics in localStorage for potential later aggregation
        if (typeof window !== 'undefined') {
          const key = `web-vitals-${metric.name}`
          const existing = localStorage.getItem(key)
          const data = existing ? JSON.parse(existing) : []

          // Keep only last 100 entries to prevent storage from growing too large
          if (data.length > 100) {
            data.shift()
          }

          data.push({
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            timestamp: Date.now(),
          })

          localStorage.setItem(key, JSON.stringify(data))
        }

        // In a real implementation, you would send these metrics to your analytics service
        // Example: navigator.sendBeacon('/api/performance', JSON.stringify(metric));
      }

      // Measure Core Web Vitals
      onCLS(sendToAnalytics) // Cumulative Layout Shift (CLS)
      onINP(sendToAnalytics) // Interaction to Next Paint (INP) - replaces FID
      onFCP(sendToAnalytics) // First Contentful Paint (FCP)
      onLCP(sendToAnalytics) // Largest Contentful Paint (LCP)
      onTTFB(sendToAnalytics) // Time to First Byte (TTFB)

      // Additional performance monitoring for resource loading
      if ('addEventListener' in window) {
        window.addEventListener('load', () => {
          // Measure additional performance metrics after the page has loaded
          setTimeout(() => {
            // Log resource loading information
            if ('getEntriesByType' in performance) {
              const resources = performance.getEntriesByType('resource')
              const resourceLoadTime = resources.reduce((total, resource) => {
                return total + (resource.responseEnd - resource.startTime)
              }, 0)

              if (process.env.NODE_ENV === 'development') {
                console.log(`Total resource load time: ${resourceLoadTime}ms`)
              }
            }

            // Log DOM content loaded time
            const domContentLoadedTime =
              performance.timing.domContentLoadedEventEnd -
              performance.timing.navigationStart
            if (process.env.NODE_ENV === 'development') {
              console.log(`DOM Content Loaded Time: ${domContentLoadedTime}ms`)
            }
          }, 1000)
        })
      }
    }
  }
})
