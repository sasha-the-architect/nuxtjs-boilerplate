<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  configPrettier,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    languageOptions: {
      parser: parserVue,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
>>>>>>> a79774e ([maintenance] fix ESLint configuration and update documentation)
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        navigateTo: 'readonly',
        $fetch: 'readonly',
<<<<<<< HEAD
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
=======
import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

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
      'comma-dangle': ['error', 'only-multiline'],
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-unused-vars': 'off', // Allow unused vars in templates
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
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'off',
      'no-debugger': 'off',
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
>>>>>>> 673cec2 (fix: migrate ESLint to flat config format and resolve linting issues)
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
<<<<<<< HEAD
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
=======
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    rules: {
      'comma-dangle': ['error', 'only-multiline'],
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
  {
    // Ignore generated files and build artifacts
    ignores: [
      '.nuxt/**',
      'dist/**',
      'build/**',
      '.output/**',
      'node_modules/**',
    ],
  },
]
>>>>>>> 673cec2 (fix: migrate ESLint to flat config format and resolve linting issues)
=======
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
]
>>>>>>> a79774e ([maintenance] fix ESLint configuration and update documentation)
