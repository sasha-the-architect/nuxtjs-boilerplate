module.exports = {
  extends: ['@nuxtjs/eslint-config', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  globals: {
    definePageMeta: 'readonly',
    defineNuxtConfig: 'readonly',
    defineNuxtRouteMiddleware: 'readonly',
    useRuntimeConfig: 'readonly',
    useState: 'readonly',
    useFetch: 'readonly',
    useAsyncData: 'readonly',
    navigateTo: 'readonly',
    $fetch: 'readonly',
  },
}
