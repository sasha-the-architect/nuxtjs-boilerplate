// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production for performance
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  // Performance optimizations
  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: false,
  },
  nitro: {
    // Optimize server-side rendering
    minify: true,
  },

  // Route-level caching and prerendering
  routeRules: {
    // Prerender all static routes by default
    '/': { prerender: true },
    '/ai-keys': { prerender: true },
    '/about': { prerender: true },
    // Add caching headers for better performance
    '/api/**': {
      headers: {
        'cache-control': 'max-age=300, public, s-maxage=300', // 5 minutes
      },
    },
  },
  // Optimize loading
  app: {
    head: {
      link: [
        // Preconnect to external domains
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        // Add preloading for critical resources
        { rel: 'preload', href: '/favicon.ico', as: 'image' },
      ],
      // Preload critical resources
      script: [
        // Add script for performance monitoring if needed
      ],
      // Add performance-related meta tags
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        // Add Core Web Vitals meta tags
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
      ],
      // Add resource hints
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  // Optimize bundle size
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks to improve caching
            'vendor-reactivity': ['vue', '@vue/reactivity'],
            'vendor-router': ['vue-router'],
          },
        },
      },
    },
  },
})
