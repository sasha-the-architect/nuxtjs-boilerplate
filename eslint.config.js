// Simple flat config for ESLint 8
import js from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'

export default [
  // Ignore generated and dependency directories
  {
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/public/**',
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // Register plugins
  {
    plugins: {
      prettier: pluginPrettier,
      vue: pluginVue,
    },
  },

  // JS files configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Basic code style
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // TS files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
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
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Basic code style
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: false,
        },
      ],
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // Vue files configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: (await import('vue-eslint-parser')).default,
      parserOptions: {
        parser: tsParser, // Use TS parser for script blocks in Vue files
        ecmaVersion: 2022,
        sourceType: 'module',
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
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      // Basic Vue rules
      'vue/multi-word-component-names': 'off', // Allow single word component names in pages/layouts
      'vue/no-multiple-template-root': 'error',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // Pages and layouts specific rules
  {
    files: [
      '**/pages/**/*.{js,ts,vue}',
      '**/layouts/**/*.{js,ts,vue}',
      '**/app.{js,ts,vue}',
      '**/error.{js,ts,vue}',
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Configuration for config files that need process global
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },

  // Configuration for plugin files that need browser globals
  {
    files: ['plugins/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        defineNuxtPlugin: 'readonly',
        process: 'readonly',
        window: 'readonly',
        performance: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
      },
    },
  },
]
