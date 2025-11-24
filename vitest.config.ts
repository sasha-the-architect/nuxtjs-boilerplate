import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  // Configuration for vitest
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: './',
        overrides: {
          // Any Nuxt config overrides for testing
        },
      },
    },
    setupFiles: ['./test-setup.ts'],
  },
})
