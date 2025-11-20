# Development Guidelines

This document outlines the standards, conventions, and best practices for contributing to the "Free Stuff on the Internet" project.

## 📋 Table of Contents

- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Component Guidelines](#component-guidelines)
- [Testing Practices](#testing-practices)
- [Performance Guidelines](#performance-guidelines)
- [Accessibility Standards](#accessibility-standards)
- [Documentation Standards](#documentation-standards)

## 🎨 Code Standards

### Vue.js Guidelines

#### Component Structure

Follow this order for component sections:

```vue
<template>
  <!-- Template content -->
</template>

<script setup>
// Imports
// Props definition
// Emits definition
// Reactive state
// Computed properties
// Methods
// Lifecycle hooks
</script>

<style scoped>
/* Component styles */
</style>
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `SearchBar.vue`, `ResourceCard.vue`)
- **Files**: kebab-case (e.g., `search-bar.vue`, `resource-card.vue`)
- **Props**: camelCase (e.g., `resourceData`, `isLoading`)
- **Events**: kebab-case (e.g., `@resource-selected`, `@search-complete`)
- **CSS Classes**: kebab-case with BEM methodology (e.g., `search-bar__input--focused`)

#### Vue Composition API

Prefer Composition API with `<script setup>`:

```vue
<script setup>
// Good
const props = defineProps({
  title: String,
  items: Array,
})

const emit = defineEmits(['update', 'select'])

const isLoading = ref(false)
const filteredItems = computed(() => {
  return props.items.filter(item => item.active)
})

const handleSelect = item => {
  emit('select', item)
}
</script>
```

### TypeScript Guidelines

#### Type Definitions

Use interfaces for type definitions:

```typescript
// types/resource.ts
export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: ResourceCategory
  tags: string[]
  featured: boolean
}

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  icon: string
}
```

#### Component Props

Use TypeScript for props:

```vue
<script setup lang="ts">
interface Props {
  resources: Resource[]
  loading?: boolean
  showFeatured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showFeatured: true,
})
</script>
```

### CSS/SCSS Guidelines

#### Tailwind CSS Usage

- Prefer utility classes over custom CSS
- Use component variants with `@apply` for complex patterns
- Maintain consistency in spacing and colors

```vue
<template>
  <!-- Good: Utility classes -->
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      {{ title }}
    </h2>
  </div>
</template>

<style scoped>
/* Use @apply for complex, reusable patterns */
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
</style>
```

#### Custom CSS

When custom CSS is necessary:

```css
/* Use BEM methodology */
.search-bar {
  /* Block styles */
}

.search-bar__input {
  /* Element styles */
}

.search-bar__input--focused {
  /* Modifier styles */
}
```

## 🔄 Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-cleanup` - Refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

```bash
feat(search): add advanced filtering options
fix(nav): resolve mobile menu toggle issue
docs(readme): update installation instructions
test(components): add unit tests for ResourceCard
```

### Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **PR Requirements**
   - Clear title and description
   - Link to relevant issues
   - Tests pass (when implemented)
   - Code follows guidelines
   - Documentation updated if needed

## 🧩 Component Guidelines

### Component Architecture

#### Atomic Design Pattern

- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Simple component combinations (search bar, card)
- **Organisms**: Complex components (header, resource list)
- **Templates**: Page layouts
- **Pages**: Complete pages

#### Component Structure

```vue
<template>
  <div class="resource-card">
    <div class="resource-card__header">
      <h3 class="resource-card__title">{{ resource.title }}</h3>
      <span class="resource-card__category">{{ resource.category.name }}</span>
    </div>

    <div class="resource-card__content">
      <p class="resource-card__description">{{ resource.description }}</p>
    </div>

    <div class="resource-card__actions">
      <Button
        variant="primary"
        @click="handleVisit"
        class="resource-card__button"
      >
        Visit Resource
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '@/types/resource'

interface Props {
  resource: Resource
  featured?: boolean
}

interface Emits {
  visit: [resource: Resource]
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const emit = defineEmits<Emits>()

const handleVisit = () => {
  emit('visit', props.resource)
}
</script>

<style scoped>
.resource-card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
}

.resource-card--featured {
  @apply ring-2 ring-blue-500;
}

.resource-card__title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.resource-card__description {
  @apply text-gray-600 mb-4;
}
</style>
```

### Best Practices

- **Single Responsibility**: Each component should have one clear purpose
- **Reusable**: Design components to be reusable across the application
- **Props Down, Events Up**: Follow unidirectional data flow
- **Composition over Inheritance**: Prefer composition patterns
- **Performance**: Use `v-memo`, `v-once`, and lazy loading appropriately

## 🧪 Testing Practices

### Testing Pyramid

1. **Unit Tests** (70%)
   - Test individual functions and components
   - Fast and isolated
   - Mock external dependencies

2. **Integration Tests** (20%)
   - Test component interactions
   - Test API integrations
   - Test user workflows

3. **E2E Tests** (10%)
   - Test complete user journeys
   - Test critical paths
   - Test cross-browser compatibility

### Writing Tests

#### Unit Test Example

```typescript
// tests/unit/components/ResourceCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '@/components/ResourceCard.vue'

describe('ResourceCard', () => {
  const mockResource = {
    id: '1',
    title: 'Test Resource',
    description: 'Test description',
    url: 'https://example.com',
    category: { id: '1', name: 'Test', slug: 'test', icon: 'test' },
    tags: ['test'],
    featured: false,
  }

  it('renders resource information correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    expect(wrapper.find('.resource-card__title').text()).toBe('Test Resource')
    expect(wrapper.find('.resource-card__description').text()).toBe(
      'Test description'
    )
  })

  it('emits visit event when button is clicked', async () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    await wrapper.find('.resource-card__button').trigger('click')

    expect(wrapper.emitted('visit')).toBeTruthy()
    expect(wrapper.emitted('visit')[0]).toEqual([mockResource])
  })
})
```

## ⚡ Performance Guidelines

### Code Splitting

- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load images and components

```typescript
// Dynamic import
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)

// Route-based splitting
const routes = [
  {
    path: '/admin',
    component: () => import('@/pages/admin.vue'),
  },
]
```

### Image Optimization

- Use appropriate image formats
- Implement lazy loading
- Use responsive images

```vue
<template>
  <img
    :src="imageSrc"
    :alt="imageAlt"
    loading="lazy"
    class="responsive-image"
  />
</template>
```

### Bundle Optimization

- Analyze bundle size regularly
- Remove unused dependencies
- Use tree shaking

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

- **Semantic HTML**: Use appropriate HTML5 elements
- **ARIA Labels**: Add ARIA attributes where needed
- **Keyboard Navigation**: Ensure all functionality is keyboard accessible
- **Color Contrast**: Maintain 4.5:1 contrast ratio for normal text
- **Focus Management**: Implement proper focus handling

### Implementation Examples

```vue
<template>
  <!-- Semantic HTML -->
  <main role="main" aria-label="Main content">
    <header>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/" aria-current="page">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>

    <!-- Accessible button -->
    <button
      @click="handleAction"
      :aria-busy="loading"
      :disabled="loading"
      class="btn-primary"
    >
      <span v-if="loading" aria-hidden="true">Loading...</span>
      <span v-else>Submit</span>
    </button>

    <!-- Accessible form -->
    <form @submit.prevent="handleSubmit">
      <label for="search">Search resources</label>
      <input
        id="search"
        v-model="searchQuery"
        type="search"
        aria-describedby="search-help"
        required
      />
      <div id="search-help" class="sr-only">
        Enter keywords to search for free resources
      </div>
    </form>
  </main>
</template>
```

## 📚 Documentation Standards

### Code Comments

- **JSDoc**: Use JSDoc for functions and complex logic
- **Vue Comments**: Comment complex template logic
- **TODO Comments**: Use TODO for future improvements

```typescript
/**
 * Filters resources based on search criteria
 * @param resources - Array of resources to filter
 * @param query - Search query string
 * @param category - Optional category filter
 * @returns Filtered array of resources
 */
export function filterResources(
  resources: Resource[],
  query: string,
  category?: string
): Resource[] {
  // Implementation
}
```

### README Files

Each major directory should include a README.md explaining:

- Purpose and functionality
- Usage examples
- API documentation
- Contributing guidelines

---

_Last Updated: 2025-11-19_
