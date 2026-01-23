import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    setupFiles: ['./test-setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/__tests__/*integration*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'nuxt.config.ts',
        '.nuxt/',
        '.output/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'test-setup.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
      '#app': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
      '#imports': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
      '#build': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
    },
  },
})
