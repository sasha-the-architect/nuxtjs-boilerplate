<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
  >
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div class="mb-6">
        <svg
          class="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
      <p class="text-gray-600 mb-6">
        It looks like you're not connected to the internet. Please check your
        connection and try again.
      </p>
      <div class="space-y-3">
        <button
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="checkConnection"
        >
          Check Connection
        </button>
        <button
          class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          @click="goHome"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

const checkConnection = () => {
  if (navigator.onLine) {
    window.location.href = window.location.origin
  } else {
    alert('You are still offline. Please check your internet connection.')
  }
}

const goHome = () => {
  window.location.href = window.location.origin
}
</script>
