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
├── useSearchPage.ts (search page orchestrator)
├── useAlternativeSuggestions.ts
├── useAdvancedResourceSearch.ts (advanced search with operators)
└── useSearchSuggestions.ts (search suggestions)

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
├── useSavedSearches.ts (saved search management)
├── useUserPreferences.ts
├── useBookmarks.ts
├── useLoading.ts
├── useFocusManagement.ts
└── useCommunityFeatures.ts

Utilities (Pure Functions)
├── utils/queryParser.ts (query parsing with operators)
├── utils/searchHighlighting.ts (search term highlighting)
├── utils/fuseHelper.ts (Fuse.js initialization)
└── [other utilities...]
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

| Date       | Category     | Decision                                                        | Impact                                                                             |
| ---------- | ------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2025-01-07 | Code Quality | Removed duplicate Google Fonts caching in nuxt.config.ts        | Eliminated code duplication, reduced config size                                   |
| 2025-01-07 | Build System | Created separate nuxt.config.analyze.ts for bundle analysis     | Removed dynamic import anti-pattern, improved build predictability                 |
| 2025-01-07 | Security     | Removed static CSP meta tag from nuxt.config.ts                 | Centralized CSP in server plugin with nonce support, improved security             |
| 2025-01-07 | Architecture | Verified no circular dependencies exist in composables          | Confirmed clean dependency hierarchy                                               |
| 2025-01-07 | Code Quality | Extracted shared DOMPurify configuration from utils/sanitize.ts | Eliminated 158 lines of duplicate configuration, improved maintainability          |
| 2025-01-07 | Architecture | Created useSearchPage orchestrator composable for search page   | Implemented Layer Separation pattern, moved business logic from page to composable |
| 2025-01-07 | Architecture | Refactored pages/search.vue to use orchestrator pattern         | Eliminated 200+ lines of inline filtering logic, improved maintainability          |
| 2025-01-07 | Architecture | Search module refactoring to eliminate code duplication         | Eliminated 315 lines of duplicate code, created 4 single-responsibility utilities  |

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

## 💾 Data Architecture

### Database System

#### Technology Stack

- **ORM**: Prisma (Type-safe database client)
- **Database**: SQLite (via better-sqlite3)
- **Migrations**: Prisma Migrate (version-controlled schema changes)

#### Rationale

SQLite chosen for:

- Zero-configuration deployment
- Embedded database (no external dependencies)
- Fast read operations (suitable for analytics)
- Easy local development
- Serverless-friendly architecture

### Data Model

#### AnalyticsEvent Model

**Location**: `prisma/schema.prisma`

```prisma
model AnalyticsEvent {
  id         String   @id @default(cuid())
  type       String
  resourceId String?
  category   String?
  url        String?
  userAgent  String?
  ip         String
  timestamp  Int
  properties String?
}
```

**Design Principles**:

- Type-safe with TypeScript
- Optimized for read-heavy analytics workloads
- Timestamps stored as integers for fast comparison
- Properties stored as JSON for flexibility

### Index Strategy

#### Single-Column Indexes

| Column     | Purpose                                   |
| ---------- | ----------------------------------------- |
| timestamp  | Time-based filtering and range queries    |
| resourceId | Resource-specific analytics               |
| type       | Event type aggregation                    |
| ip         | IP-based rate limiting and user analytics |

#### Composite Indexes

| Columns                 | Query Pattern                 | Benefit                           |
| ----------------------- | ----------------------------- | --------------------------------- |
| (timestamp, type)       | Events by date and type       | Faster filtered analytics queries |
| (timestamp, resourceId) | Resource events by date       | Faster resource analytics         |
| (resourceId, type)      | Resource-specific event types | Optimized resource view analytics |

### Query Optimization

#### Database-Level Aggregation

Before: N+1 queries (load all events, aggregate in JavaScript)

```typescript
// Old approach (inefficient)
const events = await getAllEvents(startDate, endDate)
const totalEvents = events.length
const eventsByType = aggregateByType(events)
```

After: Database-level aggregation (single query)

```typescript
// New approach (efficient)
const [totalEvents, eventsByType] = await Promise.all([
  prisma.analyticsEvent.count({ where: { timestamp: { gte, lte } } }),
  prisma.analyticsEvent.groupBy({
    by: ['type'],
    where: { timestamp: { gte, lte } },
    _count: true,
  }),
])
```

**Benefits**:

- 95% reduction in data transfer
- Faster query execution
- Lower memory usage
- Better scalability

#### Parallel Query Execution

```typescript
const [totalEvents, eventsByType, resourceViews, dailyTrends] = await Promise.all([
  prisma.analyticsEvent.count(...),
  prisma.analyticsEvent.groupBy({ by: ['type'] }),
  prisma.analyticsEvent.groupBy({ by: ['resourceId'] }),
  prisma.$queryRaw<Array<{ date: string; count: number }>>(...)
])
```

### Migration Strategy

#### Migration System

**Location**: `prisma/migrations/`

**Principles**:

- All migrations are reversible (down.sql generated automatically)
- Migrations are version-controlled
- Database schema evolves incrementally
- Zero-downtime deployments (SQLite allows hot schema changes)

#### Migration Workflow

```bash
# Create migration
npm run prisma:migrate -- --name migration_description

# Generate client after schema changes
npm run prisma:generate

# Apply migrations to production
prisma migrate deploy
```

### Data Access Pattern

#### Single Source of Truth

All database access goes through `server/utils/analytics-db.ts` using Prisma ORM.

**Before**: Mixed data access patterns

- Direct SQLite queries (`analytics-db.ts`)
- Prisma ORM (`db.ts`)
- Violates Single Source of Truth principle

**After**: Unified Prisma ORM

- Type-safe queries via Prisma Client
- Consistent error handling
- Automated migrations
- Better query optimization

#### Async/Await Pattern

All database operations are async to prevent blocking the event loop:

```typescript
export async function insertAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    await prisma.analyticsEvent.create({ data: { ... } })
    return true
  } catch (error) {
    console.error('Error inserting analytics event:', error)
    return false
  }
}
```

### Data Integrity

#### Schema-Level Constraints

| Constraint            | Column       | Purpose                          |
| --------------------- | ------------ | -------------------------------- |
| NOT NULL              | id, type, ip | Required fields must have values |
| PRIMARY KEY           | id           | Unique identifier                |
| INDEX                 | timestamps   | Fast time-based queries          |
| FOREIGN KEY (planned) | resourceId   | Referential integrity            |

#### Application-Level Validation

- Type safety via TypeScript
- Zod schemas for API input validation (`server/utils/validation-schemas.ts`)
- Input sanitization (DOMPurify for XSS prevention)
- Rate limiting for abuse prevention (database-level aggregation)
- Event type validation (lowercase letters and underscores only)
- IP address format validation (IPv4/IPv6)

#### Rate Limiting Implementation

**Location**: `server/utils/rate-limiter.ts`

- **Database-level aggregation**: Uses Prisma `count()` with time window filters
- **Scalable**: Works across multiple instances (no in-memory state)
- **Efficient**: Single query to check event count vs. client-side filtering
- **Fail-safe**: On database errors, allows request (prevents blocking)

**Configuration**:

- Max requests: 10 per IP per minute
- Time window: 60 seconds
- Endpoint: `/api/analytics/events`

**Rate Limit Response**:

```typescript
{
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded. Please try again later.',
    category: 'rate_limit',
    details: { retryAfter: 45 } // seconds until reset
  }
}
```

### Performance Characteristics

#### Query Performance

| Query Type          | Time Complexity | Optimization Strategy              |
| ------------------- | --------------- | ---------------------------------- |
| Single event lookup | O(log n)        | Primary key index                  |
| Date range query    | O(log n + k)    | Timestamp index                    |
| Resource analytics  | O(log n + k)    | Composite index (resourceId, type) |
| Aggregation by type | O(n)            | Database-level GROUP BY            |
| Full-text search    | O(n)            | Future: FTS index                  |

**Legend**: n = total rows, k = result set size

#### Storage Efficiency

- Timestamps as integers: 8 bytes vs ISO strings (variable length)
- JSON properties only when needed: Null when absent
- Index overhead: ~20% of table size (acceptable for query speed)

### Data Retention Policy

#### Automatic Cleanup

**Location**: `server/utils/analytics-db.ts:cleanupOldEvents()`

```typescript
export async function cleanupOldEvents(
  retentionDays: number = 30
): Promise<number> {
  const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  return await prisma.analyticsEvent.deleteMany({
    where: { timestamp: { lt: cutoffDate } },
  })
}
```

**Configuration**:

- Default retention: 30 days
- Configurable per environment
- Executed via scheduled task/cron job

### Security Considerations

#### Database Security

- File permissions on SQLite database files
- No direct database access from client-side
- All queries through server-side API
- Input validation at API boundary

#### Data Privacy

- IP addresses stored (can be anonymized in future)
- User agent strings (may contain sensitive info)
- Properties JSON field (developer-controlled schema)
- GDPR-compliant retention policies (planned)

### Scalability Path

#### Current Capacity

- Small to medium datasets (< 1M events)
- Single-instance deployment
- Embedded SQLite database

#### Future Enhancements

1. **Database Partitioning**:
   - Monthly tables (AnalyticsEvent_YYYY_MM)
   - Faster cleanup by dropping old partitions
   - Better query performance on recent data

2. **Read Replicas**:
   - Multiple read-only SQLite instances
   - Write-through to primary
   - Load balanced reads

3. **Migration to PostgreSQL**:
   - For larger datasets (> 10M events)
   - Better concurrent write support
   - Advanced features (foreign keys, constraints)

4. **Time-Series Database**:
   - InfluxDB or TimescaleDB
   - Optimized for analytics workloads
   - Automatic data downsampling

---

## 📊 Data Architecture Decision Log

| Date       | Decision                               | Rationale                                                                 |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------- |
| 2025-01-07 | Migrate to SQLite from PostgreSQL      | Zero configuration, better for boilerplate, matches better-sqlite3 dep    |
| 2025-01-07 | Consolidate to Prisma ORM              | Single source of truth, type safety, migrations, query optimization       |
| 2025-01-07 | Add composite indexes                  | Optimize common query patterns (timestamp + resourceId, timestamp + type) |
| 2025-01-07 | Refactor to database-level aggregation | Fix N+1 queries, 95% reduction in data transfer                           |
| 2025-01-07 | Implement Prisma Migrate               | Version-controlled schema changes, reversible migrations                  |
| 2025-01-07 | Enhanced data validation at boundary   | Centralized Zod schemas, consistent error responses, better type safety   |
| 2025-01-07 | Made IP field optional in schema       | Handle edge cases where IP unavailable, better data model flexibility     |
| 2025-01-07 | Database-based rate limiting           | Scalable across instances, efficient aggregation, no in-memory state      |

---

## 🔌 API Documentation Architecture

### OpenAPI Specification

**Location**: `server/api/api-docs/spec.get.ts`

The API uses OpenAPI 3.0.3 specification for comprehensive documentation:

- **Interactive UI**: Swagger UI available at `/api-docs`
- **JSON Spec**: Machine-readable spec at `/api-docs/spec.json`
- **Standardized Format**: Consistent documentation across all endpoints
- **Error Documentation**: All error codes and categories documented
- **Rate Limiting Info**: Rate limit details documented per endpoint

### Documentation Coverage

#### Documented Endpoints (18 endpoints)

**Resources**:

- `GET /api/v1/resources` - List resources with filtering and pagination
- `GET /api/v1/resources/{id}` - Get resource by ID
- `POST /api/resources/bulk-status` - Bulk update resource status

**Search**:

- `GET /api/v1/search` - Advanced search with fuzzy matching

**Webhooks**:

- `GET /api/v1/webhooks` - List webhooks
- `POST /api/v1/webhooks` - Create webhook
- `PUT /api/v1/webhooks/{id}` - Update webhook
- `DELETE /api/v1/webhooks/{id}` - Delete webhook
- `POST /api/v1/webhooks/trigger` - Test webhook delivery
- `GET /api/v1/webhooks/deliveries` - List webhook deliveries

**Analytics**:

- `POST /api/analytics/events` - Record analytics event
- `GET /api/analytics/search` - Query analytics data
- `GET /api/analytics/resource/{id}` - Get resource analytics

**Submissions**:

- `POST /api/submissions` - Submit new resource

**Moderation**:

- `GET /api/moderation/queue` - Get moderation queue
- `POST /api/moderation/approve` - Approve submission
- `POST /api/moderation/reject` - Reject submission

**Export**:

- `GET /api/v1/export/csv` - Export resources as CSV

**Validation**:

- `POST /api/validate-url` - Validate URL with resilience patterns

### Error Response Documentation

All endpoints use standardized error response format:

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed for field: email',
    category: 'validation',
    details: {
      field: 'email',
      message: 'Invalid email format',
      value: 'not-an-email'
    },
    timestamp: '2025-01-07T12:00:00Z',
    requestId: 'req_abc123',
    path: '/api/v1/resources'
  }
}
```

**Error Codes** (12 documented):

| Code                   | HTTP | Category         | Description                      |
| ---------------------- | ---- | ---------------- | -------------------------------- |
| INTERNAL_SERVER_ERROR  | 500  | internal         | Unexpected server error          |
| BAD_REQUEST            | 400  | validation       | Malformed request                |
| UNAUTHORIZED           | 401  | authentication   | Missing or invalid auth          |
| FORBIDDEN              | 403  | authorization    | Insufficient permissions         |
| NOT_FOUND              | 404  | not_found        | Resource not found               |
| CONFLICT               | 409  | validation       | Duplicate or conflicting data    |
| VALIDATION_ERROR       | 400  | validation       | Input validation failed          |
| RATE_LIMIT_EXCEEDED    | 429  | rate_limit       | Too many requests                |
| SERVICE_UNAVAILABLE    | 503  | external_service | Service temporarily unavailable  |
| GATEWAY_TIMEOUT        | 504  | network          | External service timeout         |
| CIRCUIT_BREAKER_OPEN   | 503  | external_service | Circuit breaker preventing calls |
| EXTERNAL_SERVICE_ERROR | 502  | external_service | Third-party service failure      |

### Integration Pattern Documentation

#### Circuit Breaker Pattern

**Endpoints with Circuit Breakers**:

- `/api/validate-url` - Per-hostname circuit breakers
- `/api/v1/webhooks/*` - Per-webhook circuit breakers

**Configuration**:

- Failure threshold: 5 failures
- Success threshold: 2 successes
- Timeout: 60 seconds
- States: CLOSED, OPEN, HALF-OPEN

**Error Handling**: Returns `CIRCUIT_BREAKER_OPEN` error when circuit is open

#### Retry with Exponential Backoff

**Endpoints with Retry**:

- `/api/validate-url` - Configurable retry attempts
- `/api/v1/webhooks/*` - Automatic webhook delivery retry

**Configuration**:

- Default: 3 attempts
- Base delay: 1000ms
- Max delay: 30000ms
- Jitter: Enabled (prevents thundering herd)

**Retryable Errors**:

- HTTP: 408, 429, 500, 502, 503, 504
- Network: ECONNRESET, ETIMEDOUT, ENOTFOUND, ECONNREFUSED

#### Rate Limiting

**Endpoints with Rate Limiting**:

- `/api/analytics/events` - 10 events/minute per IP
- `/api/v1/resources/*` - Path-based rate limiting
- `/api/v1/search` - Path-based rate limiting

**Response Headers**:

- `Retry-After`: Seconds until retry allowed
- `X-RateLimit-Remaining`: Requests remaining in window

**Rate Limit Categories**:

- General: 100 requests/minute
- Search: 30 requests/minute
- Heavy operations: 10 requests/minute
- Export: 5 requests/minute
- API keys: 50 requests/minute

#### Validation

**Validation Layers**:

1. **Request Schema Validation** (Zod schemas)
   - Location: `server/utils/validation-schemas.ts`
   - Type-safe input validation
   - Field-level error messages

2. **Business Logic Validation**
   - Custom validation in endpoint handlers
   - Returns `VALIDATION_ERROR` with details

3. **Output Encoding**
   - DOMPurify for XSS prevention
   - URL validation before external calls
   - Sanitized HTML for user-generated content

### Documentation Best Practices

#### DO:

✅ Document all error responses with codes and categories
✅ Include rate limiting information in endpoint descriptions
✅ Document retry and timeout behaviors
✅ Provide example requests and responses
✅ Document authentication requirements
✅ Include cache behavior (X-Cache headers)
✅ Document circuit breaker states for resilience

#### DO NOT:

❌ Document endpoints that don't exist
❌ Omit error response documentation
❌ Forget to document rate limits
❌ Ignore authentication requirements
❌ Skip retry behavior documentation
❌ Document internal implementation details

### API Documentation Decision Log

| Date       | Decision                             | Rationale                                                             |
| ---------- | ------------------------------------ | --------------------------------------------------------------------- |
| 2025-01-07 | Create comprehensive OpenAPI spec    | Document 18 core endpoints with standardized error format             |
| 2025-01-07 | Document all integration patterns    | Include circuit breaker, retry, rate limiting, and validation details |
| 2025-01-07 | Add Swagger UI integration           | Provide interactive API documentation for developers                  |
| 2025-01-07 | Standardize error code documentation | List all 12 error codes with HTTP mappings and categories             |

### Documentation Maintenance

**Update Triggers**:

1. **New Endpoint Added**:
   - Add endpoint to OpenAPI spec
   - Document request/response schemas
   - Include error responses
   - Note rate limiting behavior

2. **Error Code Added**:
   - Add to `server/utils/api-error.ts`
   - Update OpenAPI spec error codes list
   - Update blueprint documentation

3. **Integration Pattern Changed**:
   - Update blueprint.md with new pattern
   - Document configuration changes
   - Update affected endpoint docs

**Documentation Review**:

- Monthly review of spec completeness
- Compare OpenAPI spec with actual endpoints
- Verify error code accuracy
- Check rate limiting documentation

---

**Last Updated**: 2025-01-07
**Maintained By**: Senior Integration Engineer
**Status**: ✅ Active API Documentation

📚 **API DOCUMENTATION ESTABLISHED**
