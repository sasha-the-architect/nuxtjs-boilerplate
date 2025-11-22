// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production for performance
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image'],

  // Image optimization configuration
  image: {
    // Enable native lazy loading for images
    provider: 'static', // Using static provider for local images
    quality: 80, // Default quality for optimized images
    format: ['webp', 'avif', 'jpeg'], // Prioritize modern formats
    densities: [1, 2], // Support for high-DPI displays
    // Optimize all images by default
    optimize: true,
    // Configure the image provider
    static: {
      baseURL: '/images/',
    },
  },

  // Additional performance optimizations
  features: {
    // Optimize for production
    inlineStyles: true,
  },

  // SEO Configuration - using built-in meta handling
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
        // Add canonical URL
        {
          rel: 'canonical',
          href: 'https://free-stuff-on-the-internet.vercel.app/',
        },
      ],
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
        // SEO meta tags
        {
          name: 'description',
          content:
            'Discover amazing free resources available on the internet - from AI tools to hosting services.',
        },
        {
          name: 'keywords',
          content:
            'free resources, AI tools, hosting, databases, CDN, VPS, web development',
        },
        { name: 'author', content: 'Free Stuff on the Internet' },
        // Open Graph tags
        {
          property: 'og:title',
          content: 'Free Stuff on the Internet - Free Resources for Developers',
        },
        {
          property: 'og:description',
          content:
            'Discover amazing free resources available on the internet - from AI tools to hosting services.',
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: 'https://free-stuff-on-the-internet.vercel.app/',
        },
        { property: 'og:image', content: '/og-image.jpg' }, // This will be updated later
        // Twitter card
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'Free Stuff on the Internet - Free Resources for Developers',
        },
        {
          name: 'twitter:description',
          content:
            'Discover amazing free resources available on the internet - from AI tools to hosting services.',
        },
      ],
      // Add resource hints
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  // Sitemap configuration
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
    '/search': {
      prerender: true,
      headers: {
        'cache-control': 'max-age=3600, s-maxage=3600, public', // 1 hour
      },
    },
    '/submit': {
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
  sitemap: {
    hostname: 'https://free-stuff-on-the-internet.vercel.app',
  },
  ogImage: {
    enabled: false, // We'll implement this later if needed
  },
  // Performance optimizations
  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: false,
    // Enable faster module resolution
    respectNoExternal: true,
    // Enable component islands for better performance
    componentIslands: true,
  },
  // Test configuration
  test: {
    // Enable testing features
    setupFiles: ['./test-setup.ts'],
  },
  // Explicitly use Vite for faster builds
  builder: 'vite',

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
      include: ['vue', 'vue-router'],
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
