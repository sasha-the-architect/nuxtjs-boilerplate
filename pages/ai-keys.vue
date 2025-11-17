<template>
  <div class="py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Free AI API Keys
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Access powerful AI models with these free API keys and tools
        </p>
      </div>

      <div class="space-y-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-4">OpenAI API</h2>
          <p class="text-gray-600 mb-4">
            OpenAI provides a free tier for their API with limited usage.
            Perfect for testing and small projects.
          </p>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="font-medium text-gray-900">Free Tier:</p>
            <ul class="mt-2 space-y-1 text-gray-700">
              <li>• $5 worth of usage for new users</li>
              <li>• 3 free months of ChatGPT Plus for students</li>
              <li>• Limited requests per minute/hour/day</li>
            </ul>
          </div>
          <div class="mt-4">
            <a
              href="https://platform.openai.com/"
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            >
              Get Free API Key
            </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Hugging Face Inference API
          </h2>
          <p class="text-gray-600 mb-4">
            Access thousands of open-source AI models with Hugging Face's free
            inference API.
          </p>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="font-medium text-gray-900">Free Tier:</p>
            <ul class="mt-2 space-y-1 text-gray-700">
              <li>• 30,000 free tokens per month</li>
              <li>• Access to 100,000+ models</li>
              <li>• Community-hosted models</li>
            </ul>
          </div>
          <div class="mt-4">
            <a
              href="https://huggingface.co/inference-api"
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            >
              Access API
            </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Google AI Studio</h2>
          <p class="text-gray-600 mb-4">
            Google's platform for building with their AI models, including
            Gemini.
          </p>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="font-medium text-gray-900">Free Tier:</p>
            <ul class="mt-2 space-y-1 text-gray-700">
              <li>• Free usage up to monthly limits</li>
              <li>• Access to Gemini models</li>
              <li>• API keys for integration</li>
            </ul>
          </div>
          <div class="mt-4">
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            >
              Get API Key
            </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Anthropic Claude API
          </h2>
          <p class="text-gray-600 mb-4">
            Anthropic's Claude AI models with a generous free tier.
          </p>
          <div class="bg-gray-50 p-4 rounded-md">
            <p class="font-medium text-gray-900">Free Tier:</p>
            <ul class="mt-2 space-y-1 text-gray-700">
              <li>• 100,000 free input tokens per month</li>
              <li>• 100,000 free output tokens per month</li>
              <li>• Access to Claude 3 models</li>
            </ul>
          </div>
          <div class="mt-4">
            <a
              href="https://www.anthropic.com/api"
              target="_blank"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            >
              Get API Key
            </a>
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
