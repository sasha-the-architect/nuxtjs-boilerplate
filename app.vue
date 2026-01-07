<template>
  <ErrorBoundary>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ErrorBoundary>
</template>

<script setup lang="ts">
// This app.vue file ensures proper layout integration across the application
// It replaces the default Nuxt welcome page and integrates with the custom default layout
// All pages will now properly render within the default layout structure

// Set default meta tags for the entire application
const runtimeConfig = useRuntimeConfig()

// Import ErrorBoundary component for global error handling
import ErrorBoundary from '~/components/ErrorBoundary.vue'

useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: `${runtimeConfig.public.canonicalUrl}/og-image.jpg`,
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageType: 'image/jpeg',
  ogUrl: runtimeConfig.public.canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@yourTwitterHandle', // Replace with actual Twitter handle if available
  twitterCreator: '@yourTwitterHandle', // Replace with actual Twitter handle if available
})

// Add structured data for the website using JSON-LD
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Free Stuff on the Internet',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  url: runtimeConfig.public.canonicalUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${runtimeConfig.public.canonicalUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

// Add JSON-LD structured data to the head
useHead({
  link: [
    // Preload critical resources
    {
      rel: 'preload',
      as: 'font',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      crossorigin: 'anonymous',
    },
    // Add resource hints for performance
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    // Add canonical URL
    {
      rel: 'canonical',
      href: runtimeConfig.public.canonicalUrl,
    },
  ],
  meta: [
    // Add og:url using runtime config
    {
      property: 'og:url',
      content: runtimeConfig.public.canonicalUrl,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(websiteSchema),
    },
  ],
  // Add accessibility-related meta tags and attributes
  bodyAttrs: {
    class: 'font-sans antialiased',
  },
})

// Add global accessibility utilities
onMounted(() => {
  // Add visual focus indicators when using keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      document.body.classList.add('keyboard-nav')
      document.body.classList.remove('mouse-nav')
    }
  }

  const handleMouseDown = () => {
    document.body.classList.remove('keyboard-nav')
    document.body.classList.add('mouse-nav')
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousedown', handleMouseDown)

  // PWA installation prompt
  // let deferredPrompt: Event | null = null

  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    // deferredPrompt = e
    // Show the install button or notification
  })

  // Handle online/offline status
  window.addEventListener('online', () => {})

  window.addEventListener('offline', () => {
    // Optionally redirect to offline page or show notification
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('beforeinstallprompt', e => {
      // We can't remove the specific deferredPrompt function since it's in a closure
    })
  })
})
</script>
