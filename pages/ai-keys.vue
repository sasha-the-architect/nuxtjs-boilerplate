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
        <ResourceCard
          title="OpenAI API"
          description="OpenAI provides a free tier for their API with limited usage. Perfect for testing and small projects."
          :benefits="[
            '$5 worth of usage for new users',
            '3 free months of ChatGPT Plus for students',
            'Limited requests per minute/hour/day',
          ]"
          url="https://platform.openai.com/"
          button-label="Get Free API Key"
        />

        <ResourceCard
          title="Hugging Face Inference API"
          description="Access thousands of open-source AI models with Hugging Face's free inference API."
          :benefits="[
            '30,000 free tokens per month',
            'Access to 100,000+ models',
            'Community-hosted models',
          ]"
          url="https://huggingface.co/inference-api"
          button-label="Access API"
        />

        <ResourceCard
          title="Google AI Studio"
          description="Google's platform for building with their AI models, including Gemini."
          :benefits="[
            'Free usage up to monthly limits',
            'Access to Gemini models',
            'API keys for integration',
          ]"
          url="https://aistudio.google.com/"
          button-label="Get API Key"
        />

        <ResourceCard
          title="Anthropic Claude API"
          description="Anthropic's Claude AI models with a generous free tier."
          :benefits="[
            '100,000 free input tokens per month',
            '100,000 free output tokens per month',
            'Access to Claude 3 models',
          ]"
          url="https://www.anthropic.com/api"
          button-label="Get API Key"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Import ResourceCard component
import ResourceCard from '~/components/ResourceCard.vue'

definePageMeta({
  layout: 'default',
})
</script>
