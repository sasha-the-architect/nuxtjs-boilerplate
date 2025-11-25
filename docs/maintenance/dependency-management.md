# Dependency Management Guidelines

## Overview

This document outlines the dependency management strategy for the Nuxt.js boilerplate project to prevent conflicts and ensure stability.

## Critical Dependency Relationships

### Vitest and @nuxt/test-utils Compatibility

- **Current stable configuration**: `vitest@^3.2.4` with `@nuxt/test-utils@^3.20.1`
- **Compatibility constraint**: `@nuxt/test-utils` requires `vitest@^3.2.0`
- **Important**: Do not upgrade `vitest` to 4.x series without confirming `@nuxt/test-utils` compatibility
- **Version alignment**: All `@vitest/*` packages must match the main `vitest` version

### Package Manager Consistency

- **Primary package manager**: npm (as specified in `packageManager` field)
- **Lock file**: Use `package-lock.json` for dependency resolution
- **Installation**: Always use `npm install` to maintain consistency

## Dependency Update Guidelines

### Before Updating Dependencies

1. Check peer dependency requirements for all related packages
2. Verify compatibility between `vitest`, `@nuxt/test-utils`, and other test utilities
3. Test the complete build pipeline after updates
4. Run all tests to ensure functionality remains intact

### Safe Update Process

1. Update one dependency group at a time
2. For test dependencies, update all related packages together (vitest, @vitest/ui, @vitest/coverage-v8)
3. Verify that `npm run test` passes completely
4. Confirm that `npm run lint` runs without errors
5. Run `npm run build` to ensure build process works

### Conflict Resolution Strategy

If dependency conflicts arise:

1. Use `npm ls` to identify conflicting packages
2. Check peer dependency warnings during installation
3. Align versions to match compatibility requirements
4. Consider using resolutions field in package.json for stubborn conflicts

## ESLint Configuration

- Uses ESLint flat config (eslint.config.js)
- Integrates with Prettier for code formatting
- Includes Vue and Nuxt-specific rules
- Maintains compatibility with latest ecosystem

## Prevention Measures

- Regular dependency audits using `npm audit`
- Consistent package manager usage
- Documentation of critical dependency relationships
- Testing workflow to catch conflicts early

## Troubleshooting Common Issues

### Vitest Version Conflicts

If encountering vitest conflicts:

1. Check if @nuxt/test-utils is compatible with the intended vitest version
2. Align all vitest-related packages to the same major version
3. Review the @nuxt/test-utils documentation for supported vitest versions

### Build System Failures

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check package-lock.json for conflicting entries
3. Verify packageManager field matches the package manager being used

### ESLint and Test Framework Issues

If encountering ESLint or test framework issues:

1. Run `npm install` to ensure all dependencies are properly installed and resolved
2. Verify that all required packages are present in package-lock.json
3. Check for missing peer dependencies that might be causing conflicts

This strategy ensures the build system remains stable and prevents the development blocking issues mentioned in issue #126.
