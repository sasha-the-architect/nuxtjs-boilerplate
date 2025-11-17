<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Free Stuff on the Internet
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          Discover amazing free resources available on the internet - from AI
          tools to hosting services.
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">Free AI API Keys</h3>
          <p class="mt-2 text-gray-500">
            Access powerful AI models with free API keys for development and
            testing.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="text-sm text-gray-700">
              • OpenAI API (limited free tier)
            </li>
            <li class="text-sm text-gray-700">• Hugging Face Inference API</li>
            <li class="text-sm text-gray-700">• Google AI Studio</li>
          </ul>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">Free VPS</h3>
          <p class="mt-2 text-gray-500">
            Virtual Private Server options available for free or trial periods.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="text-sm text-gray-700">• AWS Free Tier</li>
            <li class="text-sm text-gray-700">• Google Cloud Free Tier</li>
            <li class="text-sm text-gray-700">
              • Microsoft Azure Free Account
            </li>
          </ul>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900">Free Webhosting</h3>
          <p class="mt-2 text-gray-500">
            Reliable web hosting services available for free to get your site
            online.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="text-sm text-gray-700">• Vercel</li>
            <li class="text-sm text-gray-700">• Netlify</li>
            <li class="text-sm text-gray-700">• GitHub Pages</li>
          </ul>
        </div>
      </div>

      <div class="mt-16 max-w-3xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          More Free Resources
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900">Free Databases</h3>
            <ul class="mt-2 space-y-1 text-sm text-gray-700">
              <li>• MongoDB Atlas (Free Tier)</li>
              <li>• Firebase</li>
              <li>• PlanetScale MySQL</li>
            </ul>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-gray-900">Free CDN</h3>
            <ul class="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Cloudflare</li>
              <li>• jsDelivr</li>
              <li>• UNPKG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})
</script>
