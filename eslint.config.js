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
        // Additional Nuxt globals that might be needed
        useCookie: 'readonly',
        useRequestHeaders: 'readonly',
        useRequestEvent: 'readonly',
        useNuxtData: 'readonly',
        refreshNuxtData: 'readonly',
        clearNuxtData: 'readonly',
        useError: 'readonly',
        showError: 'readonly',
        clearError: 'readonly',
        useAppConfig: 'readonly',
        getAppManifest: 'readonly',
        getNuxtClientPayload: 'readonly',
        getNuxtData: 'readonly',
        preloadComponents: 'readonly',
        preloadRouteComponents: 'readonly',
        refresh: 'readonly',
        abortNavigation: 'readonly',
        addRouteMiddleware: 'readonly',
        callOnce: 'readonly',
        defineNuxtComponent: 'readonly',
        isNuxtError: 'readonly',
        isVue2: 'readonly',
        isVue3: 'readonly',
        onNuxtReady: 'readonly',
        setResponseStatus: 'readonly',
        useRequestURL: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
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
      'no-console': 'warn',
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
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
      nuxt: nuxtPlugin,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
      'no-unused-vars': 'off', // Disable this rule to allow unused variables in development
    },
  },
  {
    // For script files
    files: ['scripts/**/*.js'],
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
      'no-console': 'warn',
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
      },
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
  // Apply prettier config to disable conflicting rules
  configPrettier,
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
