<template>
  <div
    v-if="pwa.showInstallPrompt"
    role="alertdialog"
    aria-labelledby="pwa-install-title"
    aria-describedby="pwa-install-description"
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 max-w-sm w-full mx-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="bg-gray-100 rounded-lg p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
        <div>
          <h3 id="pwa-install-title" class="font-medium text-gray-900">
            Install App
          </h3>
          <p id="pwa-install-description" class="text-sm text-gray-500">
            Add to your home screen
          </p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Cancel app installation"
          @click="cancelInstall"
        >
          Not now
        </button>
        <button
          class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Install app to home screen"
          @click="installPWA"
        >
          Install
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'

const { pwa } = useNuxtApp()

const installPWA = () => {
  pwa.installPWA()
}

const cancelInstall = () => {
  // Simply hide the prompt by resetting the ref
  // We don't actually cancel the deferred prompt, just hide the UI
  // The prompt may still appear later if the user navigates to another page
}
</script>
