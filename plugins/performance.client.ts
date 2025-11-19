// plugins/performance.client.ts
// Client-side performance monitoring plugin
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Check if we're in the browser and Web Vitals is available
    if ('PerformanceObserver' in window && 'measure' in performance) {
      // Send performance metrics to analytics or logging service
      const sendToAnalytics = (metric: any) => {
        // You can send these metrics to your analytics service
        console.log(`${metric.name}: ${metric.value}`)

        // Example of sending to a custom analytics endpoint
        // navigator.sendBeacon('/api/performance', JSON.stringify(metric));
      }

      // Measure Core Web Vitals
      onCLS(sendToAnalytics) // Cumulative Layout Shift
      // Note: onFID is not available in web-vitals 3.0+, using onINP instead
      // onFID(sendToAnalytics) // First Input Delay
      onFCP(sendToAnalytics) // First Contentful Paint
      onLCP(sendToAnalytics) // Largest Contentful Paint
      onTTFB(sendToAnalytics) // Time to First Byte
    }
  }
})
