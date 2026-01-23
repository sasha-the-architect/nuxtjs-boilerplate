# ESLint Configuration Setup

## Overview

This document explains the current ESLint setup in the Nuxt 3 project, which has been configured to use ESLint v9 with the new flat config system.

## Current Configuration

The project uses:

- **ESLint version**: 9.39.1 (latest v9.x)
- **Config format**: Flat config (`eslint.config.js`)
- **Supports**: Vue 3, TypeScript, Nuxt 3 composables

## ESLint v9 Flat Configuration

ESLint v9 introduced a new flat configuration system that is now the default. The configuration is defined in `eslint.config.js` using the following structure:

- **Global definitions** for Nuxt 3 composables like `useSeoMeta`, `useHead`, `definePageMeta`, etc.
- **File-specific configurations** for different file types (Vue, JS, TS, server files)
- **Plugin integrations** for Vue, Nuxt, and Prettier
- **Rule configurations** tailored for Nuxt 3 development

## Key Features

1. **Nuxt 3 Composable Support**: All Nuxt 3 composables are properly defined as globals
2. **Vue 3 Compatibility**: Vue-specific linting rules and parser
3. **TypeScript Support**: TypeScript parsing and linting rules
4. **Prettier Integration**: Code formatting consistency
5. **Security Focus**: Rules to prevent XSS vulnerabilities (e.g., `vue/no-v-html`)

## Migration Notes

- The project was successfully migrated from ESLint v8 to v9
- The flat config system is now properly recognized and functioning
- All Nuxt 3 globals are configured and available for use
- The configuration supports the monorepo-style setup with different rules for different file types

## Verification

To verify configuration is working:

```bash
npx eslint .
```

This should run without configuration errors and properly lint all project files.

## Running Linting

ESLint can be run directly without an npm script:

```bash
# Lint all files
npx eslint .

# Lint specific file
npx eslint path/to/file.vue

# Lint with auto-fix
npx eslint . --fix
```
