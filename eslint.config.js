// ESLint flat config for Nuxt 3 project
import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
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
        // Nuxt composables
        useSeoMeta: 'readonly',
        useHead: 'readonly',
        useRuntimeConfig: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useState: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        createError: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        readBody: 'readonly',
        // Vue composition API
        ref: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        // Browser globals
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
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
    },
  },
  {
    // For JS files
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Nuxt composables
        useSeoMeta: 'readonly',
        useHead: 'readonly',
        useRuntimeConfig: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useState: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        createError: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        readBody: 'readonly',
        // Vue composition API
        ref: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        // Browser globals
        window: 'readonly',
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
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
        // Nuxt composables
        useSeoMeta: 'readonly',
        useHead: 'readonly',
        useRuntimeConfig: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        defineNuxtPlugin: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useState: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        createError: 'readonly',
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        readBody: 'readonly',
        // Vue composition API
        ref: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        nextTick: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        // Browser globals
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
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    // For server/api files (Nuxt server routes)
    files: ['server/api/**/*.ts', 'server/routes/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        // Nuxt server composables
        defineEventHandler: 'readonly',
        setResponseHeader: 'readonly',
        createError: 'readonly',
        readBody: 'readonly',
        getQuery: 'readonly',
        sendRedirect: 'readonly',
        appendHeader: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prettier/prettier': 'error',
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
    ],
  },
]
