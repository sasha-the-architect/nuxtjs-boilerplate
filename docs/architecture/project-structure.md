# Project Structure

This document details the directory organization, file naming conventions, module responsibilities, and code organization principles of the Nuxt.js boilerplate.

## 📁 Directory Organization

### Root Level

```
nuxtjs-boilerplate/
├── __tests__/          # Test files and test utilities
├── app/                # Application entry point (app.vue)
├── assets/             # Static assets (CSS, images, fonts)
├── components/         # Reusable Vue components
├── composables/        # Vue composables (shared logic)
├── docs/               # Documentation files
├── layouts/            # Layout components
├── pages/              # Route-based pages
├── plugins/            # Nuxt plugins
├── public/             # Public static assets
├── server/             # Server-side code (API routes, middleware)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── .github/            # GitHub configuration
├── nuxt.config.ts      # Nuxt configuration
├── package.json        # Project dependencies and scripts
├── README.md           # Project overview
└── vitest.config.ts    # Test configuration
```

### Server Directory Structure

```
server/
├── api/                # API routes organized by feature
│   ├── analytics/      # Analytics-related endpoints
│   ├── resource-health/ # Resource health monitoring
│   ├── resources/      # Resource management endpoints
│   ├── search/         # Search-related endpoints
│   └── v1/            # Version 1 API endpoints
│       ├── alternatives/ # Alternative suggestions
│       ├── auth/       # Authentication endpoints
│       ├── comparisons/ # Comparison tools
│       ├── export/     # Data export endpoints
│       ├── webhooks/   # Webhook management
│       └── ...         # Other API categories
├── middleware/         # Server-side request middleware
├── plugins/            # Server-side plugins
├── routes/             # Custom route handlers
└── utils/              # Server-side utility functions
```

### Components Directory Structure

```
components/
├── __tests__/          # Component test files
├── AlternativeSuggestions.vue  # Alternative suggestions component
├── ApiKeys.vue         # API key management component
├── BookmarkButton.vue  # Resource bookmarking
├── ComparisonBuilder.vue # Comparison tool components
├── ComparisonTable.vue # Side-by-side comparison table
├── ErrorBoundary.vue   # Error handling components
├── LoadingSpinner.vue  # Loading state components
├── SearchBar.vue       # Search interface
├── SearchSuggestions.vue # Search suggestions
├── SkeletonLoader.vue  # Loading placeholders
└── ...                 # Additional components
```

### Composables Directory Structure

```
composables/
├── useAdvancedResourceSearch.ts  # Advanced search functionality
├── useAlternatives.ts   # Alternative suggestions
├── useAlternativeSuggestions.ts # Suggestion utilities
├── useBookmarks.ts      # Bookmark management
├── useCommunityFeatures.ts # Community features
├── useLoading.ts        # Loading state management
├── useRecommendationEngine.ts # Recommendation system
├── useResourceAnalytics.ts # Resource analytics
├── useResourceComparison.ts # Comparison functionality
├── useResourceData.ts   # Resource data management
├── useResourceFilters.ts # Resource filtering
├── useResourceRecommendations.ts # Recommendation logic
├── useResources.ts      # Main resource composable
├── useResourceSearch.ts # Search functionality
├── useResourceSort.ts   # Sorting functionality
├── useSearchHistory.ts  # Search history management
├── useSearchSuggestions.ts # Search suggestions
└── useUrlSync.ts        # URL state synchronization
```

## 🏗️ Module Responsibilities

### Components

- **Responsibility**: Presentational logic and UI rendering
- **Scope**: Reusable UI elements and page-specific components
- **Pattern**: Single-file Vue components with clear props and emits

### Composables

- **Responsibility**: Shared state management and business logic
- **Scope**: Cross-component functionality and data fetching
- **Pattern**: Vue 3 Composition API functions following `use*` naming convention

### API Routes

- **Responsibility**: Server-side data processing and HTTP request handling
- **Scope**: All server-side API endpoints
- **Pattern**: Nuxt server API routes with clear request/response handling

### Pages

- **Responsibility**: Route-specific views and page-level logic
- **Scope**: URL routes and page-level state management
- **Pattern**: Auto-routed Vue components in pages directory

### Plugins

- **Responsibility**: Application-level initialization and global functionality
- **Scope**: Cross-cutting concerns like analytics, error handling
- **Pattern**: Nuxt plugins for client and server-side initialization

## 📝 File Naming Conventions

### Components

- **Format**: PascalCase (e.g., `ResourceCard.vue`, `SearchBar.vue`)
- **Pattern**: Noun-based descriptive names
- **Location**: `components/` directory

### Composables

- **Format**: camelCase with `use` prefix (e.g., `useResources.ts`, `useSearchHistory.ts`)
- **Pattern**: Action-oriented or state-oriented names
- **Location**: `composables/` directory

### API Routes

- **Format**: kebab-case (e.g., `search.get.ts`, `resources.post.ts`)
- **Pattern**: `{action}.{method}.ts` format
- **Location**: `server/api/` directory

### Pages

- **Format**: kebab-case (e.g., `index.vue`, `search.vue`)
- **Pattern**: Route-based naming matching URL structure
- **Location**: `pages/` directory

### Utilities

- **Format**: camelCase (e.g., `sanitize.ts`, `searchAnalytics.ts`)
- **Pattern**: Function or purpose-based naming
- **Location**: `utils/` or `server/utils/` directory

## 🎯 Code Organization Principles

### Separation of Concerns

- Components handle presentation
- Composables manage state and logic
- API routes handle server-side processing
- Pages manage route-level concerns

### Modularity

- Each file has a single, clear responsibility
- Components are reusable and self-contained
- Composables are focused and composable

### Consistency

- Similar functionality follows consistent patterns
- Naming conventions are applied uniformly
- Error handling patterns are standardized

### Scalability

- Architecture supports feature growth
- Components are designed for extensibility
- API routes follow versioning patterns

## 🔧 Development Patterns

### Component Architecture

- Props for data input
- Emits for event output
- Slots for content distribution
- Composition API for complex logic

### State Management

- Reactive state in composables
- Shared state across components
- Client-side persistence where appropriate
- Server-side validation and storage

### Error Handling

- Centralized error handling in plugins
- Component-level error boundaries
- API route error responses
- User-friendly error messages

### Testing Strategy

- Component tests in `__tests__` directories
- API route tests for server logic
- Integration tests for feature workflows
- Unit tests for utility functions

---

_Last Updated: 2025-11-29_
