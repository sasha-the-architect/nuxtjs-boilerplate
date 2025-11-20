// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production for performance
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image', // Add image optimization module
  ],
  // Performance optimizations
  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: false,
    // Enable faster module resolution
    respectNoExternal: true,
  },
  // Explicitly use Vite for faster builds
  builder: 'vite',
  // Image optimization configuration
  image: {
    // Use the same provider as your deployment
    provider: 'ipx',
    // Set up image optimization options
    quality: 80,
    format: ['webp', 'jpeg', 'png'],
    // Cache configuration
    staticCache: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
    // Add responsive sizes
    sizes: 'xs:100vw sm:100vw md:50vw lg:33vw xl:25vw',
  },
  nitro: {
    // Optimize server-side rendering
    minify: true,
    // Add caching configuration for Nitro
    storage: {
      cache: {
        driver: 'lru-cache',
        max: 1000,
        ttl: 60 * 60 * 1000, // 1 hour
      },
    },
    // Enable compression
    compressPublicAssets: true,
    experimental: {
      wasm: false, // Disable if not using WebAssembly
    },
    // Improve build performance
    ignore: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
  },

  // Route-level caching and prerendering
  routeRules: {
    // Prerender all static routes by default
    '/': {
      prerender: true,
      headers: {
        'cache-control': 'max-age=3600, s-maxage=3600, public', // 1 hour
      },
    },
    '/ai-keys': {
      prerender: true,
      headers: {
        'cache-control': 'max-age=3600, s-maxage=3600, public', // 1 hour
      },
    },
    '/about': {
      prerender: true,
      headers: {
        'cache-control': 'max-age=3600, s-maxage=3600, public', // 1 hour
      },
    },
    // Add caching headers for better performance
    '/api/**': {
      headers: {
        'cache-control': 'max-age=300, public, s-maxage=300', // 5 minutes
      },
    },
    // Cache static assets
    '/_nuxt/**': {
      headers: {
        'cache-control': 'max-age=31536000, immutable',
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
        // Preload critical CSS
        { rel: 'preload', href: '/_nuxt/', as: 'fetch', crossorigin: true },
      ],
      // Preload critical resources
      script: [
        // Add script for performance monitoring if needed
        // Preload important scripts
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
        // Resource hints
        { name: 'format-detection', content: 'telephone=no' },
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
      target: 'esnext',
      sourcemap: false, // Disable sourcemaps for faster builds in CI
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks to improve caching
            'vendor-reactivity': ['vue', '@vue/reactivity'],
            'vendor-router': ['vue-router'],
            // Group common dependencies for better caching
            vendor: ['vue', 'vue-router', 'nuxt'],
            'vendor-ui': ['@nuxt/image'],
            'vendor-search': ['fuse.js'],
            'vendor-utils': ['zod'],
          },
          // Optimize chunk naming for better caching
          chunkFileNames: '_nuxt/[name].[hash].js',
          entryFileNames: '_nuxt/[name].[hash].js',
        },
        // Externalize dependencies that don't need to be bundled
        external: [],
      },
    },
    // Optimize build speed
    esbuild: {
      logLevel: 'silent', // Reduce build noise
    },
    // Optimize module resolution
    resolve: {
      // Enable more aggressive caching
      alias: {
        // Add common aliases to speed up resolution
        'node-fetch-native': 'node-fetch-native/pure.js',
      },
    },
    // Additional build performance optimizations
    optimizeDeps: {
      // Only scan necessary files
      include: ['vue', 'vue-router', '@nuxt/image'],
      // Exclude heavy dependencies that shouldn't be pre-bundled
      exclude: [],
    },
  },
  // Additional build optimization settings
  build: {
    // Enable compression
    compress: true,
    // Optimize for faster builds
    transpile: ['vue'],
    // Enable parallel builds
    parallel: true,
    // Add more detailed build information
    analyze: false, // Enable only when needed for analysis
  },
})
