<template>
  <div class="py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Submit a Resource
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Share valuable free resources with the community
        </p>
      </div>

      <div class="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <form
          class="space-y-6"
          novalidate
          @submit.prevent="submitResource"
        >
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Resource Title <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <input
              id="title"
              ref="titleInput"
              v-model="formData.title"
              type="text"
              required
              maxlength="200"
              aria-required="true"
              aria-describedby="title-description title-error"
              :aria-invalid="errors.title ? 'true' : 'false'"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
              placeholder="e.g., OpenAI API"
            >
            <p
              id="title-description"
              class="mt-1 text-sm text-gray-500"
            >
              The name of the resource or service
            </p>
            <div
              v-if="errors.title"
              id="title-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.title }}
            </div>
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Description <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              required
              rows="4"
              maxlength="1000"
              aria-required="true"
              aria-describedby="description-description description-error"
              :aria-invalid="errors.description ? 'true' : 'false'"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
              placeholder="Describe the resource and its benefits..."
            />
            <p
              id="description-description"
              class="mt-1 text-sm text-gray-500"
            >
              At least 10 characters. Explain what this resource offers and why
              it's valuable.
            </p>
            <div
              v-if="errors.description"
              id="description-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.description }}
            </div>
          </div>

          <div>
            <label
              for="url"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              URL <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <input
              id="url"
              v-model="formData.url"
              type="url"
              required
              aria-required="true"
              aria-describedby="url-description url-error"
              :aria-invalid="errors.url ? 'true' : 'false'"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
              placeholder="https://example.com"
            >
            <p
              id="url-description"
              class="mt-1 text-sm text-gray-500"
            >
              The official website or page for this resource
            </p>
            <div
              v-if="errors.url"
              id="url-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.url }}
            </div>
          </div>

          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Category <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <select
              id="category"
              v-model="formData.category"
              required
              aria-required="true"
              aria-describedby="category-description category-error"
              :aria-invalid="errors.category ? 'true' : 'false'"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
            >
              <option
                value=""
                disabled
              >
                Select a category
              </option>
              <option value="AI & Machine Learning">
                AI & Machine Learning
              </option>
              <option value="Cloud & Hosting">
                Cloud & Hosting
              </option>
              <option value="Databases & Storage">
                Databases & Storage
              </option>
              <option value="Development Tools">
                Development Tools
              </option>
              <option value="Design & UI">
                Design & UI
              </option>
              <option value="Learning Resources">
                Learning Resources
              </option>
              <option value="Productivity & Utilities">
                Productivity & Utilities
              </option>
              <option value="Other">
                Other
              </option>
            </select>
            <p
              id="category-description"
              class="mt-1 text-sm text-gray-500"
            >
              Choose the most appropriate category for this resource
            </p>
            <div
              v-if="errors.category"
              id="category-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.category }}
            </div>
          </div>

          <div>
            <label
              for="tags"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (Optional)
            </label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              aria-describedby="tags-description"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
              placeholder="Enter tags separated by commas"
            >
            <p
              id="tags-description"
              class="mt-1 text-sm text-gray-500"
            >
              Add relevant tags to help categorize this resource (e.g., "api,
              free-tier, openai")
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              aria-live="polite"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">Submit Resource</span>
              <span
                v-else
                class="flex items-center"
              >
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            </button>
          </div>
        </form>

        <!-- Success message -->
        <div
          v-if="submitSuccess"
          class="mt-8 p-4 bg-green-50 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Submission received!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  Thank you for submitting a resource. Our team will review it
                  and approve it if it meets our quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div
          v-if="submitError"
          class="mt-8 p-4 bg-red-50 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Submission failed
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ submitError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubmitPage } from '~/composables/useSubmitPage'

const {
  formData,
  tagsInput,
  errors,
  isSubmitting,
  submitSuccess,
  submitError,
  submitResource,
} = useSubmitPage()

const titleInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  titleInput.value?.focus()
})

definePageMeta({
  layout: 'default',
})

const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Submit a Resource - Free Stuff on the Internet',
  ogTitle: 'Submit a Resource - Free Stuff on the Internet',
  description:
    'Share valuable free resources with the community. Submit free AI tools, hosting services, databases, and other developer resources.',
  ogDescription:
    'Share valuable free resources with the community. Submit free AI tools, hosting services, databases, and other developer resources.',
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || 'http://localhost:3000'}/submit`,
  twitterCard: 'summary_large_image',
})
</script>
