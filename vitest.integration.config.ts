import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'vitest-environment-nuxt',
    testTimeout: 10000,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.integration.test.ts', '**/__tests__/*integration*.test.ts'],
  },
})
