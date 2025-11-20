<<<<<<< HEAD
// ESLint flat config for Nuxt 3 project
import js from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // Ignore generated and dependency directories
  {
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'pnpm-lock.yaml',
      'package-lock.json',
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // Register plugins
  {
    plugins: {
      vue: pluginVue,
      prettier: pluginPrettier,
      '@typescript-eslint': tsPlugin,
    },
  },

  // JS files configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Environment globals
        ...globals.browser,
        ...globals.node,
        // Nuxt.js specific globals
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
        defineNuxtPlugin: 'readonly',
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
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

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
        defineNuxtPlugin: 'readonly',
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
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },

  // Vue files configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
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
        defineNuxtPlugin: 'readonly',
      },
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    rules: {
      // Basic Vue rules
      'vue/multi-word-component-names': 'off', // Allow single word component names in pages/layouts
      'vue/no-multiple-template-root': 'error',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Code style
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

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
=======
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import nuxt from 'eslint-plugin-nuxt'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: typescriptParser,
      },
    },
    plugins: {
      vue,
      typescript,
      nuxt,
      prettier,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
      ...typescript.configs.recommended.rules,
      ...nuxt.configs.recommended.rules,
      ...prettierConfig.rules,
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
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
]
>>>>>>> 9273e24 ([maintenance] critical fixes for repository health)
