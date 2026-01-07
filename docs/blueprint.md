# 🏗️ Architecture Blueprint

## 📋 Overview

This document serves as the architectural blueprint for the Nuxt.js boilerplate project, defining the fundamental design decisions, patterns, and principles that guide system architecture.

## 🎯 Core Architectural Principles

### 1. **Separation of Concerns**

- **Components**: Handle presentation and user interaction only
- **Composables**: Manage business logic and state
- **Server Routes**: Handle data processing and API concerns
- **Utils**: Provide pure functions for common operations

### 2. **Dependency Flow**

All dependencies flow inward following Clean Architecture principles:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│      (Components, Pages, Layouts)      │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│       Business Logic Layer             │
│         (Composables)                 │
│  - High-level: useResources           │
│  - Mid-level: useResourceFilters      │
│  - Low-level: useResourceData        │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│       Data Access Layer               │
│    (Server Routes, Utils, Types)      │
└─────────────────────────────────────────┘
```

### 3. **Modularity**

Each module is atomic, replaceable, and has a single responsibility:

- **High-level composables** orchestrate multiple low-level composables
- **Low-level composables** provide focused, reusable functionality
- No circular dependencies exist in the codebase

### 4. **Type Safety**

- TypeScript strict mode enforced
- All functions have explicit type signatures
- Types are centralized in `types/` directory
- Interfaces define clear contracts between modules

## 🔐 Security Architecture

### Layered Security Approach

#### 1. **Server-Side Security Headers**

Implemented via `server/plugins/security-headers.ts`:

- Dynamic nonce generation per request
- Content Security Policy (CSP) with nonce support
- Route-specific cache control headers
- Security headers: X-Frame-Options, X-Content-Type-Options, etc.

#### 2. **Centralized Security Configuration**

Located in `server/utils/security-config.ts`:

- Single source of truth for security settings
- CSP directives defined declaratively
- Nonce generation and CSP string generation functions

#### 3. **Input Sanitization**

Implemented in `utils/sanitize.ts`:

- DOMPurify integration for XSS prevention
- HTML sanitization before rendering
- Text highlighting with sanitization

### Security Decision Log

| Date       | Decision                                       | Rationale                                                                                      |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 2025-01-07 | Remove static CSP meta tag from nuxt.config.ts | CSP now handled exclusively by server plugin with dynamic nonce generation for better security |

## 🔌 Integration Architecture

### Resilience Patterns

The application implements industry-standard resilience patterns for external service integrations:

#### 1. **Circuit Breaker Pattern**

**Location**: `server/utils/circuit-breaker.ts`

The circuit breaker prevents cascading failures by stopping calls to failing services:

- **States**: CLOSED (normal), OPEN (failing), HALF-OPEN (testing recovery)
- **Configuration**:
  - `failureThreshold`: Number of failures before opening (default: 5)
  - `successThreshold`: Number of successes to close (default: 2)
  - `timeoutMs`: Time before attempting reset (default: 60000ms)

**Usage Example**:

```typescript
const breaker = getCircuitBreaker('service-name', {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000,
})

const result = await breaker.execute(
  async () => await externalApiCall(),
  () => fallbackData()
)
```

**Integration Points**:

- Webhook delivery (`server/utils/webhookDelivery.ts`)
- URL validation (`utils/urlValidation.ts`)
- Per-service circuit breakers with hostname-based keys

#### 2. **Retry with Exponential Backoff**

**Location**: `server/utils/retry.ts`

Sophisticated retry mechanism to handle transient failures:

- **Exponential Backoff**: Delay increases with each retry (baseDelayMs × 2^attempt)
- **Jitter**: Random variation in delay to prevent thundering herd
- **Configurable Presets**:
  - `quick`: Fast retries (500ms-5s, max 2 attempts)
  - `standard`: Balanced (1s-30s, max 3 attempts)
  - `slow`: Persistent failures (2s-60s, max 5 attempts)
  - `aggressive`: High throughput (100ms-5s, max 3 attempts)

**Usage Example**:

```typescript
const result = await retryWithBackoff(async () => await externalApiCall(), {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterEnabled: true,
})
```

**Retryable Errors**:

- HTTP: 408, 429, 500, 502, 503, 504
- Network: ECONNRESET, ETIMEDOUT, ENOTFOUND, ECONNREFUSED

#### 3. **Standardized Error Responses**

**Location**: `server/utils/api-error.ts`, `server/utils/api-response.ts`

Consistent error format across all API endpoints:

```typescript
{
  success: false,
  error: {
    code: ErrorCode,
    message: string,
    category: ErrorCategory,
    details?: string | Record<string, unknown>,
    timestamp: string,
    requestId?: string,
    path?: string
  }
}
```

**Error Categories**:

- `validation`: Request validation failures
- `authentication`: Authentication required
- `authorization`: Access forbidden
- `not_found`: Resource not found
- `rate_limit`: Rate limit exceeded
- `external_service`: Third-party service failures
- `internal`: Server errors
- `network`: Network-related errors

**Helper Functions**:

- `sendApiError()`: Send standardized error response
- `sendBadRequestError()`: 400 errors
- `sendUnauthorizedError()`: 401 errors
- `sendNotFoundError()`: 404 errors
- `sendRateLimitError()`: 429 errors with Retry-After header

#### 4. **Health Monitoring**

All resilience patterns include built-in monitoring:

- **Circuit Breaker Stats**:
  - State (closed/open/half-open)
  - Failure/success counts
  - Last failure/success time
  - Failure rate percentage

- **Retry Stats**:
  - Total attempts
  - Total delay time
  - Individual attempt errors

**Monitoring Endpoint**:

```typescript
// Get all circuit breaker stats
getAllCircuitBreakerStats()
```

### Integration Best Practices

#### DO:

✅ Use circuit breakers for all external service calls
✅ Configure appropriate retry strategies based on operation type
✅ Implement fallback mechanisms for critical paths
✅ Log all failures with contextual information
✅ Set reasonable timeouts (10s for webhooks, configurable for other services)
✅ Use jitter in retry delays to prevent thundering herd
✅ Monitor circuit breaker states for proactive intervention

#### DO NOT:

❌ Call external services without circuit breakers
❌ Use infinite retries
❌ Retry non-idempotent operations without idempotency keys
❌ Expose internal errors to clients in production
❌ Hardcode timeout values across all operations
❌ Retry without backoff or jitter
❌ Ignore circuit breaker open states

### Integration Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              API Endpoint / Service                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Circuit Breaker                      │
│  • Check state (closed/open/half-open)          │
│  • Track failures/successes                     │
│  • Execute or return fallback                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Retry Logic                          │
│  • Exponential backoff                          │
│  • Jitter for distributed load                  │
│  • Configurable max retries                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          External Service Call                    │
│  • HTTP request with timeout                     │
│  • Response handling                            │
└─────────────────────────────────────────────────────┘
```

### Integration Decision Log

| Date       | Decision                                              | Rationale                                                                 |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| 2025-01-07 | Implement circuit breaker pattern                     | Prevent cascading failures from external services                         |
| 2025-01-07 | Add exponential backoff with jitter                   | Prevent thundering herd on retries, improve distributed system resilience |
| 2025-01-07 | Standardize error responses with codes and categories | Consistent client error handling, better debugging and monitoring         |
| 2025-01-07 | Create retry presets for different operation types    | Appropriate retry strategies for different use cases                      |
| 2025-01-07 | Add circuit breaker stats monitoring                  | Proactive identification of failing services                              |

## 📦 Configuration Architecture

### Nuxt Configuration Structure

- **nuxt.config.ts**: Main configuration (base config)
- **nuxt.config.analyze.ts**: Bundle analysis configuration (extends base config)
- Separation allows specialized build configurations without duplication

### Configuration Decisions

| Component         | Location                         | Purpose                        |
| ----------------- | -------------------------------- | ------------------------------ |
| CSP Configuration | server/utils/security-config.ts  | Centralized, nonce-enabled CSP |
| Cache Strategy    | nuxt.config.ts (workbox section) | PWA caching policies           |
| Bundle Analysis   | nuxt.config.analyze.ts           | Separate analyzer config       |
| Route Rules       | nuxt.config.ts                   | Prerendering and routing       |

<<<<<<< HEAD
| Error Handling | composables/useErrorHandler.ts | Centralized error management |

## 🛡️ Error Handling Architecture

### Centralized Error Management

Implemented via `composables/useErrorHandler.ts`:

- **Error State Management**: Unified error state across application
- **Error Logging**: Consistent logging via `errorLogger` utility
- **Global Error Tracking**: Maintain history of errors for debugging
- **Async Error Handling**: Wrapper for async operations with error handling
- **Severity Levels**: Support for info, warning, error, critical levels

### Error Handling Pattern

```
Component/Page
    ↓
useErrorHandler (composable)
    ↓
errorLogger (utility)
    ↓
Logger (console/output)
```

### Error Handling Best Practices

1. **Use useErrorHandler**: All components should use centralized error handler
2. **Consistent Logging**: Always use `logError`, `logWarning`, `logCritical`
3. **Error Boundaries**: Use app/error.vue for global error handling
4. **User Feedback**: Display user-friendly error messages
5. **Error Tracking**: Maintain error history for debugging
   > > > > > > > f02fc3a (Refactor architecture: Eliminate code duplication and anti-patterns)

## 🧩 Composable Architecture

### Hierarchy

```
High-Level (Orchestrators)
├── useResources.ts (main orchestrator)
└── useAlternativeSuggestions.ts

Mid-Level (Feature-Specific)
├── useResourceFilters.ts
├── useResourceSearchFilter.ts
├── useRecommendationEngine.ts
└── useUrlSync.ts

Low-Level (Core Functionality)
├── useResourceData.ts
├── useResourceSearch.ts
├── useResourceSort.ts
├── useSearchHistory.ts
├── useUserPreferences.ts
├── useBookmarks.ts
├── useLoading.ts
├── useFocusManagement.ts
└── useCommunityFeatures.ts
```

### Dependency Rules

1. **Low-level composables**: Never import other composables
2. **Mid-level composables**: May import low-level composables
3. **High-level composables**: May import mid-level and low-level composables
4. **No circular dependencies**: Enforced by architecture

### Data Flow Pattern

```
User Interaction
    ↓
Component
    ↓
High-Level Composable (useResources)
    ↓
Mid-Level Composables (filters, search, sort)
    ↓
Low-Level Composables (data loading, state)
    ↓
Server API / Local Storage
```

## 🔧 Build Architecture

### Build Process

1. **Development Build**: `npm run dev`
   - Hot Module Replacement (HMR)
   - Fast feedback loop
   - Development optimizations disabled

2. **Production Build**: `npm run build`
   - Code splitting enabled
   - Tree shaking
   - Minification (Terser)
   - Source maps disabled

3. **Bundle Analysis**: `npm run analyze`
   - Uses nuxt.config.analyze.ts
   - Generates visual report
   - Identifies bundle size issues

### Build Optimization Strategies

- **Manual Chunks**: Vendor libraries split for better caching
- **Code Splitting**: Automatic by Nuxt/Vite
- **Tree Shaking**: Removes unused code
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: @nuxt/image module

## 📁 Directory Structure

```
nuxtjs-boilerplate/
├── app/                      # App configuration
│   ├── error.vue             # Global error boundary
│   └── app.vue             # Root component
├── assets/                   # Static assets
│   └── css/main.css         # Global styles
├── components/               # Vue components
│   ├── __tests__/          # Component tests
│   └── *.vue              # Reusable components
├── composables/             # Business logic
│   ├── useResources.ts     # Main orchestrator
│   ├── useResourceData.ts  # Data management
│   └── [other composables]
├── layouts/                 # Layout components
│   └── default.vue         # Main layout
├── pages/                   # Route-based pages
│   ├── index.vue          # Home page
│   └── [other pages]
├── plugins/                 # Nuxt plugins
│   └── [client/server plugins]
├── server/                  # Server-side code
│   ├── api/               # API routes
│   ├── plugins/           # Server plugins
│   └── utils/            # Server utilities
├── types/                   # TypeScript definitions
│   ├── resource.ts        # Resource types
│   └── [other types]
├── utils/                   # Client utilities
│   ├── sanitize.ts        # Sanitization
│   ├── analytics.ts       # Analytics helpers
│   └── [other utils]
└── docs/                    # Documentation
    ├── architecture.md     # This file
    └── [other docs]
```

## 🎨 Design Patterns Used

### 1. **Composition Pattern**

- Vue 3 Composition API
- Composables for reusable logic
- Reactive state management

### 2. **Repository Pattern**

- Data access abstracted through composables
- Server routes act as data repositories
- Clear separation of concerns

### 3. **Strategy Pattern**

- Multiple filtering strategies
- Configurable sorting algorithms
- Pluggable search implementations

### 4. **Observer Pattern**

- Vue reactivity system
- Watchers and computed properties
- Event-driven updates

### 5. **Singleton Pattern**

- Security configuration (centralized)
- Logger instances
- Service instances

## 🔍 Anti-Patterns to Avoid

### ❌ Circular Dependencies

- **Problem**: Composable A imports B, B imports C, C imports A
- **Solution**: Enforce dependency hierarchy, use proper architecture

### ❌ God Classes/Functions

- **Problem**: Single composable handles too many responsibilities
- **Solution**: Split into focused, single-responsibility composables

### ❌ Mixed Concerns

- **Problem**: Components handle business logic or data fetching
- **Solution**: Keep components pure, use composables for logic

### ❌ Hardcoded Configuration

- **Problem**: Magic numbers and strings scattered in code
- **Solution**: Centralize configuration in dedicated files

### ❌ Dynamic Require Statements

- **Problem**: Runtime dependency resolution, unpredictable builds
- **Solution**: Use static imports and separate build configurations

## 🚀 Performance Architecture

### Caching Strategy

1. **API Caching** (Server-side):
   - 5-minute cache for API responses
   - Tag-based invalidation
   - Stale-while-revalidate pattern

2. **PWA Caching** (Client-side):
   - Cache-first for static assets
   - Network-first for API calls
   - Service worker for offline support

3. **Browser Caching**:
   - 1-year cache for Nuxt build assets
   - 1-week cache for GitHub CDN resources
   - Cache-Control headers via server plugin

4. **In-Memory Caching** (Client-side):
   - Fuse.js search index caching using WeakMap
   - Search highlighting memoization using Map
   - Date parsing memoization for consistent timestamps
   - Cached computed values to prevent recomputation

### Bundle Optimization

- **Manual Chunks**: Vendor libraries split
- **Code Splitting**: Route and component level
- **Tree Shaking**: Unused code removed
- **Lazy Loading**: On-demand component loading

### Performance Patterns

1. **Memoization**:
   - Use WeakMap for object-based caching (automatic garbage collection)
   - Use Map for string-based caching (controlled lifecycle)
   - Implemented in `utils/memoize.ts`

2. **Single-Pass Operations**:
   - Consolidate multiple array iterations into single pass
   - Use Sets for efficient deduplication
   - Implemented in `composables/useFilterUtils.ts`

3. **Lazy Initialization**:
   - Create expensive objects (Fuse.js instances) on-demand
   - Cache instances for reuse across operations
   - Prevent redundant re-initializations

4. **Computed Property Optimization**:
   - Consolidate related computed properties into single property
   - Reduce reactive dependencies and re-computation
   - Extract multiple values in single iteration

## 🧪 Testing Architecture

### Test Organization

```
tests/
├── __tests__/
│   ├── components/        # Component tests
│   ├── composables/       # Composable tests
│   ├── utils/           # Utility tests
│   └── pages/           # Page tests
└── test-setup.ts        # Test configuration
```

### Testing Strategy

1. **Unit Tests**: Individual functions and composables
2. **Component Tests**: Vue component behavior
3. **Integration Tests**: Workflow and interaction testing
4. **E2E Tests**: Complete user journeys (future)

### Test Framework

- **Vitest**: Test runner
- **Vue Test Utils**: Component testing
- **happy-dom**: Lightweight DOM implementation

## 📊 Monitoring & Analytics

### Performance Monitoring

- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Analysis**: Rollup visualizer
- **Build Metrics**: Build time, bundle size

### User Analytics

- **Search Analytics**: Query tracking and suggestions
- **Resource Analytics**: Usage patterns
- **Event Tracking**: User interactions

## 🔄 Decision Log

| Date       | Category     | Decision                                                        | Impact                                                                    |
| ---------- | ------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2025-01-07 | Code Quality | Removed duplicate Google Fonts caching in nuxt.config.ts        | Eliminated code duplication, reduced config size                          |
| 2025-01-07 | Build System | Created separate nuxt.config.analyze.ts for bundle analysis     | Removed dynamic import anti-pattern, improved build predictability        |
| 2025-01-07 | Security     | Removed static CSP meta tag from nuxt.config.ts                 | Centralized CSP in server plugin with nonce support, improved security    |
| 2025-01-07 | Architecture | Verified no circular dependencies exist in composables          | Confirmed clean dependency hierarchy                                      |
| 2025-01-07 | Code Quality | Extracted shared DOMPurify configuration from utils/sanitize.ts | Eliminated 158 lines of duplicate configuration, improved maintainability |

## 🎓 Design Principles Applied

### SOLID Principles

1. **Single Responsibility**: Each composable has one clear purpose
2. **Open/Closed**: Modules open for extension, closed for modification
3. **Liskov Substitution**: Type-safe composables can be swapped
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)

- Centralized configuration
- Reusable composables
- Shared utility functions

### KISS (Keep It Simple, Stupid)

- Simplest solution that works
- Avoid over-engineering
- Prefer explicit over implicit

## 📈 Future Architecture Considerations

### Scalability

- **Feature Modules**: Organize by feature, not by type
- **Micro-Frontends**: Consider for large-scale applications
- **State Management**: Pinia for complex global state

### Performance

- **Edge Computing**: Deploy to edge (Cloudflare Workers)
- **ISR (Incremental Static Regeneration)**: Hybrid rendering
- **Prefetching**: Smart data prefetching

### Developer Experience

- **Storybook**: Component documentation
- **Type-Strict Mode**: Enable strict type checking
- **ESLint Strict Rules**: Enforce code quality

---

**Last Updated**: 2025-01-07
**Maintained By**: Code Architect
**Status**: ✅ Active Architecture Blueprint

🏗️ **ARCHITECTURE BLUEPRINT ESTABLISHED**
