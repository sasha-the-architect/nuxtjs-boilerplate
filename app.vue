<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// This app.vue file ensures proper layout integration across the application
// It replaces the default Nuxt welcome page and integrates with the custom default layout
// All pages will now properly render within the default layout structure

// Set default meta tags for the entire application
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
})

// Add structured data for the website using JSON-LD
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Free Stuff on the Internet',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  url: 'https://free-stuff-on-the-internet.vercel.app/',
  potentialAction: {
    '@type': 'SearchAction',
    target:
      'https://free-stuff-on-the-internet.vercel.app/search?q={search_term_string}',
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
      crossorigin: true,
    },
    // Add resource hints for performance
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(websiteSchema),
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

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousedown', handleMouseDown)
  })
})
</script>
