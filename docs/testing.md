# Testing Framework

This project uses Vitest with Vue Test Utils for comprehensive testing of Vue components and Nuxt applications.

## Setup

The testing framework is configured with:

- Vitest as the test runner
- Happy DOM as the testing environment (browser-like environment)
- Vue Test Utils for Vue component testing
- Coverage reports using v8 provider

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

Tests are located in the `tests/` directory with the following structure:

- `tests/components/` - Component unit tests
- `tests/composables/` - Composable function tests
- `tests/pages/` - Page component tests
- `tests/utils/` - Utility function tests

## Writing Tests

When writing tests, follow these patterns:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        // mock props
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
```

## Test Configuration

The test environment is configured in `vitest.config.ts` with:

- Happy DOM environment for browser-like testing
- Global test functions enabled
- Test setup file for common mocks
- Coverage thresholds and reporting

## Mocking Nuxt Features

The `test-setup.ts` file includes mocks for common Nuxt composables:

- `useHead`
- `useSeoMeta`
- `useRuntimeConfig`
- `useFetch`
- `useAsyncData`
- And other Nuxt-specific APIs

## Coverage

The project maintains a 70%+ coverage threshold as defined in the configuration. Coverage reports are generated in text, JSON, and HTML formats.
