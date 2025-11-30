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
  {
    // For Vue files
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
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-unused-vars': 'off', // Allow unused vars in templates
      'vue/require-default-prop': 'off', // Allow optional props without defaults
      'vue/no-required-prop-with-default': 'off', // Allow required props with defaults
      'prettier/prettier': 'error',
      'no-console': 'off', // Allow console statements in Vue components for error logging
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For JS files
    files: ['**/*.js', '**/*.mjs'],
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
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For page files
    files: ['pages/**/*.vue'],
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
        // Vue 3 composition API
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
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
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-unused-vars': 'off', // Allow unused vars in templates
      'prettier/prettier': 'error',
      'no-console': 'off', // Allow console statements in pages for error logging
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For script files
    files: ['scripts/**/*.js', 'validate-*.js', 'test-*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // Allow console statements in script files
    },
  },
  {
    // For TS files
    files: ['**/*.ts'],
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
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For composable and utility TS files
    files: ['composables/**/*.ts', 'utils/**/*.ts'],
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
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'off', // Allow console statements in composables and utils for error logging
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For server files
    files: ['server/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        readBody: 'readonly',
        onErrorCaptured: 'readonly',
        setResponseStatus: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console statements in server-side code for error logging
    },
  },
  {
    // For composable files
    files: ['composables/**/*.ts'],
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
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'off', // Allow console statements in composables for error logging
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For test files
    files: ['**/*.spec.ts', '**/*.test.ts', 'test-setup.ts'],
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
    },
  },
  {
    // For utility files
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
      'no-console': 'off', // Allow console statements in utility files for error logging
    },
  },
  {
    // For error logger utility (specific rule)
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
  // For Nuxt configuration file
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
      'no-console': 'off', // Allow console statements in nuxt config for build-time logging
    },
  },
  // For test files and validation scripts
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
      'no-console': 'off', // Allow console statements in test and validation files for debugging
    },
  },
  // Apply prettier config to disable conflicting rules
  configPrettier,
  {
    // For nuxt.config.ts file specifically
    files: ['nuxt.config.ts'],
    rules: {
      'no-console': 'off', // Allow console in config file for development tool warnings
    },
  },
  {
    // Global ignores
    ignores: [
      'dist/**',
      '.nuxt/**',
      'node_modules/**',
      '.output/**',
      'coverage/**',
      'public/**',
      '.nuxt/**/*',
      'nuxt.d.ts',
      'app.config.ts',
    ],
  },
]
