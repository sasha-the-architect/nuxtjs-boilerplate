import { visualizer } from 'rollup-plugin-visualizer'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production for performance
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@vite-pwa/nuxt'],

  // Runtime configuration for environment variables
  runtimeConfig: {
    public: {
      canonicalUrl:
        process.env.CANONICAL_URL ||
        'https://free-stuff-on-the-internet.vercel.app/',
    },
  },

  // PWA Configuration - merged from both branches
  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Free Stuff on the Internet',
      short_name: 'Free Resources',
      description:
        'Discover amazing free resources available on the internet - from AI tools to hosting services.',
      theme_color: '#4f46e5',
      lang: 'en',
      display: 'standalone',
      orientation: 'any',
      background_color: '#ffffff',
      id: '/',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: 'pwa/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa/maskable-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'pwa/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // Cache strategies for different assets
      globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'],
      runtimeCaching: [
        {
          // Cache API calls with a network-first strategy
          urlPattern: '^/api/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
          },
        },
        {
          // Cache resources data
          urlPattern: '.*resources\\.json',
          handler: 'CacheFirst',
          options: {
            cacheName: 'resources-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
          },
        },
        {
          // Cache static assets
          urlPattern: '^https://fonts\\.(?:googleapis|gstatic)\\.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
        {
          // Cache Nuxt build assets
          urlPattern:
            '^/_nuxt/.*\\.(js|css|png|svg|jpg|jpeg|gif|webp|woff|woff2)',
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: 'https://.*\\.githubusercontent\\.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'github-cdn-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: 'https://fonts.googleapis.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: 'https://fonts.gstatic.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'font-files-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: '^https://.*\\.(png|jpe?g|gif|svg|webp)$',
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: ['^/$'],
      type: 'module',
    },
  },

  // Security and CSP configuration
  experimental: {
    // Enable nonce-based CSP support
    inlineSSRStyles: false,
    payloadExtraction: true,
    // Enable faster module resolution
    respectNoExternal: true,
    // Enable component islands for better performance
    componentIslands: true,
  },

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

  // Define reusable security headers to reduce duplication
  // Note: These headers will be applied via the security headers plugin
  nitro: {
    // CSP headers via middleware
    plugins: ['~/server/plugins/security-headers.ts'],
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
        // Prefetch resources that might be needed later
        { rel: 'prefetch', href: '/api/resources.json' },
        { rel: 'prefetch', href: '/api/submissions' },
        // Add preloading for critical resources
        { rel: 'preload', href: '/favicon.ico', as: 'image' },
        { rel: 'preload', href: '/_nuxt/', as: 'fetch', crossorigin: true },
        // DNS prefetch for external resources
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        // Add canonical URL - will be set dynamically in app.vue
      ],
      script: [
        // Add script for performance monitoring if needed
        // Preload important scripts
      ],
      // Add performance-related meta tags
      meta: [
        // This approach is more secure and allows for nonces
        { name: 'referrer', content: 'no-referrer' },
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
        // og:url will be set dynamically in app.vue
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

  routeRules: {
    // Security headers are now handled via the security-headers plugin
    // This reduces duplication and centralizes security configuration
    '/**': {
      // Global route rules handled by security plugin
    },
    // Main routes with prerender
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
    hostname:
      process.env.CANONICAL_URL ||
      'https://free-stuff-on-the-internet.vercel.app',
  },
  ogImage: {
    enabled: false, // We'll implement this later if needed
  },
  // Performance optimizations are included in the experimental section above
  // Test configuration
  test: {
    // Enable testing features
    setupFiles: ['./test-setup.ts'],
  },
  // Explicitly use Vite for faster builds
  builder: 'vite',

  // Nitro configuration moved to top level
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
            'vendor-vue': ['vue', '@vue/reactivity', 'vue-router'],
            'vendor-search': ['fuse.js'],
            'vendor-security': ['dompurify', 'xss'],
            'vendor-web-vitals': ['web-vitals'],
          },
          // Optimize chunk naming for better caching
          chunkFileNames: '_nuxt/[name].[hash].js',
          entryFileNames: '_nuxt/[name].[hash].js',
        },
        // Externalize dependencies that don't need to be bundled
        external: ['@nuxt/kit'],
      },
    },
    plugins:
      process.env.ANALYZE_BUNDLE === 'true'
        ? [
            visualizer({
              filename: './dist/stats.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : [], // Only add the plugin when ANALYZE_BUNDLE is true
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
    transpile: ['vue', 'entities', 'estree-walker'],
    // Enable parallel builds
    parallel: true,
    // Add more detailed build information
    analyze: false, // Enable only when needed for analysis
  },
})
