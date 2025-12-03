// ESLint flat config for Nuxt 3 project
import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import nuxtPlugin from 'eslint-plugin-nuxt'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import pluginPrettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

// Get the vue recommended config
const vueRecommendedConfig = vuePlugin.configs['flat/recommended']

export default [
  js.configs.recommended,
  ...vueRecommendedConfig,
  // Base configuration for Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt 3 composables and utilities
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        useRoute: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        onErrorCaptured: 'readonly',
        clearError: 'readonly',
      },
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // Use TypeScript parser for script blocks in Vue files
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // Prevent console statements in production
      },
    },
  },
  // Configuration for test files
  {
    files: [
      '**/*.spec.ts',
      '**/*.test.ts',
      'test-setup.ts',
      'test-*.js',
      '**/*.test.js',
      'validate-*.js',
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'vue/one-component-per-file': 'off', // Allow multiple components in test files
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow only specific console methods, prefer using logger
    },
  },
  // Configuration for script files
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow only specific console methods, prefer using logger
    },
  },
  // Configuration for utility files
  {
    files: ['utils/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow only specific console methods, prefer using logger
    },
  },
  // Special configuration for error logger
  {
    files: ['utils/errorLogger.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // Allow console in development for error logger
    },
  },
  // Configuration for Nuxt config file
  {
    files: ['nuxt.config.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow only specific console methods, prefer using logger
    },
  },
  // Apply prettier config to disable conflicting rules
  configPrettier,
  // Global ignores
  {
    ignores: [
      'dist/**',
      '.nuxt/**',
      'node_modules/**',
      '.output/**',
      'coverage/**',
      'public/**',
      'nuxt.d.ts',
      'app.config.ts',
    ],
  },
]
