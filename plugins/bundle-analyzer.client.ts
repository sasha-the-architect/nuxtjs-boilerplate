// plugins/bundle-analyzer.client.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (process.client && process.env.ANALYZE_BUNDLE === 'true') {
    // Dynamically import the bundle analyzer only when needed
    import('rollup-plugin-visualizer').then(({ default: visualizer }) => {
      // Create a temporary script to trigger the analyzer
      const script = document.createElement('script')
      script.src = '/_nuxt/stats.html'
      script.onload = () => {
        console.log('Bundle analyzer loaded')
      }
      document.head.appendChild(script)
    })
  }
})
