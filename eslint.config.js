// ESLint flat config for Nuxt 3 project
import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import configPrettier from 'eslint-config-prettier'
import * as tsParserCore from '@typescript-eslint/parser'

// Get the vue recommended config
const vueRecommendedConfig = vuePlugin.configs['flat/recommended']

export default [
  js.configs.recommended,
  ...vueRecommendedConfig,
  ...tseslint.configs['flat/recommended'],
  // Base configuration for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParserCore,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        $fetch: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        useRoute: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
      },
    },
  },
  // Base configuration for Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
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
    },
    rules: {
      'no-console': process?.env?.NODE_ENV === 'production' ? 'error' : 'warn', // Prevent console statements in production
      'vue/multi-word-component-names': 'off', // Allow single-word component names for pages and layouts
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ], // Allow unused vars with underscore prefix
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
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ], // Allow unused vars with underscore prefix
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
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow only specific console methods, prefer using logger
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ], // Allow unused vars with underscore prefix
    },
  },
  // Special configuration for error logger
  {
    files: ['utils/errorLogger.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
      },
    },
    rules: {
      'no-console': process?.env?.NODE_ENV === 'production' ? 'error' : 'warn', // Allow console in development for error logger
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ], // Allow unused vars with underscore prefix
    },
  },
  // Configuration for Nuxt server API files
  {
    files: ['server/api/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        defineEventHandler: 'readonly',
        createError: 'readonly',
        setResponseStatus: 'readonly',
        setResponseHeaders: 'readonly',
        setResponseHeader: 'readonly',
        readBody: 'readonly',
        readMultipartFormData: 'readonly',
        getRequestHeader: 'readonly',
        getRouterParam: 'readonly',
        getQuery: 'readonly',
        getCookie: 'readonly',
        setCookie: 'readonly',
        deleteCookie: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
  // Configuration for Nuxt config file
  {
    files: ['nuxt.config.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Allow only specific console methods, prefer using logger
    },
  },
  // Configuration for ESLint config file
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly',
        defineNuxtConfig: 'readonly',
      },
    },
  },
  // Configuration for Nuxt config files
  {
    files: ['nuxt.config.ts', 'nuxt.config.analyze.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly',
        defineNuxtConfig: 'readonly',
      },
    },
  },
  // Configuration for Nuxt plugins
  {
    files: ['plugins/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly',
        defineNuxtPlugin: 'readonly',
      },
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
