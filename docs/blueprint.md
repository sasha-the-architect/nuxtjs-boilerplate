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

## 🔌 API Client Architecture

### Interface Definition Pattern

**Location**: `utils/api-client.ts` (interface + implementation)

**Plugin**: `plugins/api-client.ts`

The application defines a clear contract for API client operations using the **Interface Definition Pattern**. This allows for:

- **Testability**: Easy to mock API calls in tests
- **Flexibility**: Can switch implementations without changing callers
- **Type Safety**: Strongly typed request/response contracts
- **Dependency Inversion**: Higher-level modules depend on abstraction, not implementation

### API Client Interface

```typescript
export interface ApiClient {
  // HTTP methods
  get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>
  post<T>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
  put<T>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
  delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>
  patch<T>(
    url: string,
    body?: unknown,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>

  // Configuration
  setDefaultHeaders(headers: Record<string, string>): void
  setAuthToken(token: string | null): void
  getAuthToken(): string | null
}
```

### Fetch API Client Implementation

**Location**: `utils/api-client.ts`

The default implementation uses Nuxt's built-in `$fetch`:

- Wraps all HTTP operations
- Handles authentication headers automatically
- Provides consistent error handling
- Supports query parameters and request configuration

### ApiClient Plugin

**Location**: `plugins/api-client.ts`

Provides ApiClient instance globally to all composables via Nuxt plugin system:

```typescript
import { createFetchApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const apiClient = createFetchApiClient(globalThis.fetch)

  return {
    provide: {
      apiClient,
    },
  }
})
```

### Usage Example

```typescript
// In composable
const { $apiClient } = useNuxtApp()

// GET request
const response = await $apiClient.get<Resource[]>('/api/v1/resources')
if (response.success) {
  console.log(response.data)
}

// POST request
const newResource = await $apiClient.post<Resource>('/api/v1/resources', {
  title: 'New Resource',
  description: 'Description',
})

// Set auth token
$apiClient.setAuthToken('your-auth-token')

// Make authenticated request
const userResponse = await $apiClient.get<User>('/api/v1/user')
```

### API Client Principles

✅ **Interface Segregation**: Clean, focused interface for HTTP operations
✅ **Dependency Inversion**: Modules depend on `ApiClient` abstraction, not concrete implementation
✅ **Single Responsibility**: Only handles HTTP communication
✅ **Open/Closed**: New implementations can be added without modifying existing code
✅ **Testability**: Interface allows for easy mocking in unit tests
✅ **Global Availability**: Provided via Nuxt plugin for easy access throughout application

### API Client Decision Log

| Date       | Decision                         | Rationale                                                                                            |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 2026-01-10 | Create ApiClient interface       | Define contract for HTTP operations, improve testability, support multiple implementations           |
| 2026-01-10 | Implement FetchApiClient         | Default implementation using Nuxt's built-in $fetch for production use                               |
| 2026-01-15 | Create ApiClient plugin          | Provide ApiClient globally via Nuxt plugin system for consistent access across all composables       |
| 2026-01-15 | Migrate composables to ApiClient | Replace all direct $fetch calls with ApiClient abstraction (0 remaining $fetch calls in composables) |

## 🧑 Community Types Architecture

### Unified Type System

**Location**: `types/community.ts`

### Interface Definition Pattern

The application defines a unified type system for all community features, ensuring type consistency and eliminating type coercion across modules.

### Type Definitions

```typescript
export interface UserProfile {
  id: string
  name: string
  email: string
  username?: string
  role: string
  isModerator?: boolean
  joinDate: string
  joinedAt?: string
  contributions?: number
  reputation?: number
  contributionsDetail?: UserContributions
  privacy?: UserPrivacy
}

export interface Comment {
  id: string
  resourceId: string
  content: string
  userId: string
  userName: string
  timestamp: string
  votes: number
  replies: Comment[]
  isEdited: boolean
  editedAt?: string
  status: 'active' | 'removed' | 'flagged'
}

export interface Vote {
  id: string
  targetType: string
  targetId: string
  userId: string
  voteType: 'up' | 'down'
  timestamp: string
}

export interface Flag {
  id: string
  targetType: string
  targetId: string
  userId: string
  reason: string
  details: string
  reportedAt: string
  status: 'pending' | 'reviewed' | 'resolved'
}
```

### Callback Interfaces

```typescript
export interface UpdateVoteCountCallback {
  (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down',
    change: number
  ): void
}

export interface UpdateUserContributionsCallback {
  (userId: string, change: number): void
}

export interface RemoveCommentByModeratorCallback {
  (commentId: string): boolean
}

export interface ModerationActionCallback {
  (flagId: string, action: string, moderatorNote: string): boolean
}
```

### Module Usage

**Community Composables Using Unified Types**:

- `composables/community/useUserProfiles.ts` - User profile management
- `composables/community/useComments.ts` - Comment system
- `composables/community/useVoting.ts` - Voting system
- `composables/community/useModeration.ts` - Content moderation
- `composables/useCommunityFeatures.ts` - Orchestrator (consumes all above modules)

### Architectural Benefits

✅ **Interface Segregation**: Clean type definitions for each domain
✅ **Single Source of Truth**: All community types in one file
✅ **Type Safety**: Eliminates `as any` casts across all modules
✅ **Dependency Inversion**: Modules depend on type abstractions, not concrete implementations
✅ **Cross-Module Contracts**: Callback interfaces enable clean inter-module communication
✅ **Maintainability**: Type changes propagate automatically from single source

### Community Types Decision Log

| Date       | Category    | Decision                       | Rationale                                                                                                 |
| ---------- | ----------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 2026-01-10 | Type Safety | Create unified community types | Eliminated 11 `as any` casts from useCommunityFeatures, ensuring type safety across all community modules |

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

| Date       | Decision                                       | Rationale                                                                                                                                    |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-01-07 | Remove static CSP meta tag from nuxt.config.ts | CSP now handled exclusively by server plugin with dynamic nonce generation for better security                                               |
| 2026-01-20 | Conduct comprehensive security audit           | Verified zero vulnerabilities, confirmed all security controls (CSP, XSS prevention, input validation, secrets management) working correctly |

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

#### 4. **Webhook Reliability**

**Location**: `server/utils/webhookQueue.ts`, `server/api/v1/webhooks/trigger.post.ts`

Comprehensive webhook reliability system to ensure reliable, non-blocking webhook delivery:

**Modular Architecture (2026-01-21)**:

```
┌─────────────────────────────────────────────────────┐
│         WebhookQueueSystem (Orchestrator)      │
│         ~160 lines (coordination only)          │
└──────┬────────────────────┬────────────────────────┘
       │                    │
       ▼                    ▼
┌──────────────────┐   ┌──────────────────────────────┐
│ WebhookQueue     │   │ DeadLetterManager          │
│ Manager          │   │                          │
│ ~60 lines        │   │ ~80 lines                │
│                  │   │                         │
│ - enqueue()      │   │ - addToDeadLetter()       │
│ - dequeue()      │   │ - removeFromDeadLetter()   │
│ - startProcessor()│   │ - retry()                │
└──────────────────┘   └──────────────────────────────┘
       │
       └────────────┬──────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ WebhookDelivery │
         │ Service         │
         │ ~100 lines      │
         │                │
         │ - deliver()     │
         │ - deliverWithRetry()
         └──────────────────┘

Benefits:
✅ Single Responsibility (each module one concern)
✅ Testable (isolate each module)
✅ Reusable (modules usable elsewhere)
✅ SOLID compliant (SRP, OCP, DIP)
✅ Clear interfaces (dependency injection)
```

**Module Files**:

1. **`server/utils/webhook-signer.ts`** (~30 lines)
   - Signature generation and verification
   - HMAC-SHA256 signing
   - Pure functions for cryptographic operations

2. **`server/utils/webhook-queue-manager.ts`** (~60 lines)
   - Queue operations (enqueue, dequeue)
   - Background processing (5-second intervals)
   - Queue size and status tracking

3. **`server/utils/webhook-delivery.ts`** (~100 lines)
   - HTTP webhook delivery
   - Retry with exponential backoff
   - Delivery logging

4. **`server/utils/webhook-dead-letter.ts`** (~80 lines)
   - Failed webhook management
   - Retry capability
   - Dead letter queue operations

5. **`server/utils/webhookQueue.ts`** (~160 lines, orchestrator)
   - Coordinates all modules
   - Maintains backward compatibility
   - Circuit breaker integration

**Idempotency Keys**:

```typescript
export interface WebhookPayload {
  event: WebhookEvent
  data: any
  timestamp: string
  signature?: string
  idempotencyKey?: string // Prevents duplicate deliveries
}
```

- **At-Least-Once Delivery**: Duplicate requests with same idempotency key return existing delivery
- **Auto-Generated Keys**: If not provided, system generates unique key
- **Audit Trail**: All deliveries tracked by idempotency key for debugging

**Async Webhook Delivery**:

```typescript
await webhookQueueSystem.deliverWebhook(webhook, payload, {
  async: true, // Queue for background delivery
  maxRetries: 3,
  priority: 0,
})
```

- **Non-Blocking**: API responses return immediately after queuing
- **Priority Queue**: Critical webhooks can be prioritized
- **Background Processor**: Polls queue every 5 seconds
- **Performance**: 95% reduction in webhook trigger response time

**Retry with Exponential Backoff**:

```typescript
private async scheduleRetry(item: WebhookQueueItem): Promise<void> {
  const delay = calculateBackoff(item.retryCount, 1000, 30000, true)
  item.scheduledFor = new Date(Date.now() + delay).toISOString()
  item.retryCount++
}
```

- **Exponential Backoff**: 1s, 2s, 4s, 8s (max 30s)
- **Jitter**: 10% random variation to prevent thundering herd
- **Max Retries**: 3 attempts before moving to dead letter queue
- **Automatic**: Failed webhooks automatically retried

**Dead Letter Queue**:

```typescript
interface DeadLetterWebhook {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: WebhookPayload
  failureReason: string
  lastAttemptAt: string
  createdAt: string
  deliveryAttempts: WebhookDelivery[]
}
```

- **Preservation**: Failed webhooks stored for manual inspection
- **Retry Capability**: Dead letter webhooks can be retried via API
- **Full History**: All delivery attempts recorded for debugging
- **No Data Loss**: Webhooks never lost, only moved to dead letter

**Integration Points**:

- `server/api/v1/webhooks/trigger.post.ts` - Uses async queue for webhook delivery
- `server/api/v1/webhooks/queue.get.ts` - Queue monitoring and management
- `server/api/v1/webhooks/dead-letter/[id]/retry.post.ts` - Retry failed webhooks

**Webhook Reliability Architecture**:

```
Webhook Trigger Endpoint
    ↓
Idempotency Check (prevent duplicates)
    ↓
Add to Queue (priority + schedule)
    ↓
Background Processor (every 5s)
    ↓
Circuit Breaker Check (prevent cascading failures)
    ↓
HTTP Delivery (10s timeout, HMAC signature)
    ↓
    ├─ Success → Record delivery
    └─ Failure → Retry with exponential backoff
                      ↓
                 ├─ Max retries → Dead letter queue
                 └─ < Max retries → Retry queue (reschedule)
```

**Database Persistence (Prisma + SQLite)**:

- **Webhook Model**: Stores webhook configurations with soft-delete support
  - Indexes: `active`, `deletedAt`, `url`
  - JSON serialization for `events` array field
  - Supports activation/deactivation without data loss

- **WebhookDelivery Model**: Logs all webhook delivery attempts
  - Indexes: `webhookId`, `idempotencyKey`, `status`, `createdAt`, `webhookId + status`, `deletedAt`
  - Tracks delivery status, attempts, responses
  - Supports idempotency via dedicated IdempotencyKey model

- **WebhookQueue Model**: Persists scheduled webhook deliveries
  - Indexes: `scheduledFor`, `priority + scheduledFor`, `webhookId`, `deletedAt`
  - Enables queue persistence across server restarts
  - Priority-based scheduling for critical webhooks

- **DeadLetterWebhook Model**: Stores failed webhooks after max retries
  - Indexes: `createdAt`, `webhookId`, `deletedAt`
  - Preserves failed webhook history for debugging and retry
  - Full delivery attempt history for troubleshooting

- **ApiKey Model**: Manages API keys with expiration support
  - Indexes: `key` (unique), `userId`, `active`, `expiresAt`, `deletedAt`
  - JSON serialization for `permissions` array field
  - Supports scoped permissions and expiration dates

- **IdempotencyKey Model**: Stores idempotency key mappings
  - Indexes: `key` (unique), `webhookId`, `createdAt`, `expiresAt`, `deletedAt`
  - Links to WebhookDelivery for delivery tracking
  - Prevents duplicate deliveries across restarts

**Benefits of Database Persistence**:

✅ **Data Integrity**: ACID transactions ensure data consistency
✅ **Server Restart Safe**: All webhooks, deliveries, queue, API keys persisted
✅ **Horizontal Scaling**: Database can be shared across multiple server instances
✅ **Audit Trail**: Complete history of webhook deliveries and failures
✅ **Soft-Delete Support**: Data never permanently deleted, recovery possible
✅ **Idempotency Guarantee**: Persistent idempotency keys prevent duplicate deliveries
✅ **Performance**: Optimized indexes for query patterns (O(1) lookups)

**Migration**: `20260120234718_add_webhook_models`

**Storage Implementation**: `server/utils/webhookStorage.ts` (Prisma ORM with SQLite)

#### 5. **Rate Limiting**

**Location**: `server/utils/enhanced-rate-limit.ts`

Token bucket algorithm with endpoint-specific rate limiting to protect API from overload:

**Token Bucket Algorithm**:

```typescript
interface TokenBucket {
  tokens: number
  lastRefill: number
}

interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  tokensPerInterval: number // Tokens added per interval
  intervalMs: number // Token refill interval (in ms)
  message: string // Error message when limit exceeded
}
```

- **Token Bucket**: Tokens refilled at regular intervals, consumed per request
- **Smooth Rate Limiting**: Allows bursts of traffic while preventing sustained abuse
- **Endpoint-Specific Configs**: Different limits for different endpoint types
- **In-Memory Storage**: Fast O(1) lookups using Map

**Rate Limit Configurations**:

| Config Type | Max Requests | Window | Refill Rate | Use Case                     |
| ----------- | ------------ | ------ | ----------- | ---------------------------- |
| `general`   | 100          | 15 min | 10/min      | General requests             |
| `api`       | 50           | 5 min  | 5/min       | API endpoints                |
| `search`    | 30           | 1 min  | 5/30s       | Search endpoints             |
| `heavy`     | 10           | 1 min  | 2/min       | Resource-intensive endpoints |
| `export`    | 5            | 1 min  | 1/min       | Data export endpoints        |

**Usage Example**:

```typescript
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  await rateLimit(event)

  // Process request
  return { success: true, data: ... }
})
```

**Rate Limit Headers**:

All rate-limited endpoints receive standard headers:

- `X-RateLimit-Limit`: Max requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets
- `X-RateLimit-Window`: Window duration in seconds
- `X-RateLimit-Bypassed`: Present if admin bypass used

**Admin Bypass**:

- **Header-Based**: `x-admin-bypass-key` header for trusted admin requests
- **Security**: Bypass keys blocked in query parameters (to prevent log exposure)
- **Testing**: Helper functions for adding/clearing bypass keys in tests

**Analytics**:

Built-in analytics for monitoring rate limiting:

```typescript
interface RateLimitAnalytics {
  totalRequests: number
  blockedRequests: number
  bypassedRequests: number
}
```

**Database-Backed Rate Limiting for Analytics**:

**Location**: `server/utils/rate-limiter.ts`, `server/api/analytics/events.post.ts`

Analytics events use a special database-backed rate limiter that queries the analyticsEvent table:

```typescript
export async function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult>
```

- **Uses Actual Data**: Rate limits based on real analytics events submitted
- **Appropriate for Analytics**: Makes sense to use analytics data as rate limit source
- **Fallback Graceful**: Returns allowed=true on errors to prevent analytics loss

**Rate Limiting Best Practices**:

#### DO:

✅ Use `enhanced-rate-limit.ts` for all new API endpoints
✅ Configure appropriate limits based on endpoint cost (heavy vs. light)
✅ Use database-backed rate limiter for analytics endpoints
✅ Include rate limit headers in all responses
✅ Use admin bypass key for trusted monitoring systems
✅ Monitor analytics for rate limit violations

#### DO NOT:

❌ Hardcode rate limits without considering endpoint cost
❌ Allow bypass keys in query parameters (security risk)
❌ Mix rate limiting implementations in same codebase
❌ Rate limit monitoring/health check endpoints
❌ Rate limit without providing retry-after information

### Integration Decision Log

| Date       | Decision                                              | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-01-07 | Implement circuit breaker pattern                     | Prevent cascading failures from external services                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2025-01-07 | Add exponential backoff with jitter                   | Prevent thundering herd on retries, improve distributed system resilience                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2025-01-07 | Standardize error responses with codes and categories | Consistent client error handling, better debugging and monitoring                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2025-01-07 | Create retry presets for different operation types    | Appropriate retry strategies for different use cases                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2025-01-07 | Add circuit breaker stats monitoring                  | Proactive identification of failing services                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2025-01-08 | Standardize API endpoints with error helpers          | Replace custom error responses with standardized helpers, improve consistency                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-01-09 | Complete API standardization across all endpoints     | All API endpoints now use centralized error response helpers for consistency                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-01-09 | Implement webhook idempotency keys                    | Prevent duplicate webhook deliveries for same event (at-least-once semantics)                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-01-09 | Add async webhook delivery queue                      | Prevent API blocking on webhook delivery, improve response times by 95%                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-01-09 | Implement webhook dead letter queue                   | Preserve failed webhooks for manual inspection and retry, prevent data loss                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-01-09 | Add webhook retry with exponential backoff            | Automatic retry for transient failures with proper backoff and jitter                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-01-10 | Add Zod schemas for API validation                    | Consistent validation across all API endpoints with type-safe schemas                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-01-10 | Standardize API response format                       | All endpoints use sendSuccessResponse helper for consistent output                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-01-10 | Pre-computed Lookup Maps for Search Suggestions       | Added computed Maps for tag/category counts, eliminating O(n²) array scans in suggestion generation                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-01-10 | Complete API documentation in OpenAPI spec            | Added 10+ missing API endpoints including alternatives, health checks, submissions, moderation, webhook queue management, dead letter retry                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-01-11 | Complete API documentation - Add 4 missing endpoints  | Added JSON export, XML sitemap, resource comparisons, analytics data endpoints with proper schemas, reaching 100% endpoint coverage (45 total)                                                                                                                                                                                                                                                                                                                                                              |
| 2026-01-15 | Extract ID Generation Utility (DRY Principle)         | Eliminated duplicate ID generation logic across 4 community composables, created reusable utils/id.ts utility (8 lines removed total)                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-01-15 | LocalStorage Abstraction - Storage Utility Pattern    | Created utils/storage.ts for type-safe localStorage operations, eliminated 60+ lines of duplicate storage logic across 4 composables (useBookmarks, useSearchHistory, useSavedSearches, useUserPreferences), improved maintainability with single source of truth for persistence                                                                                                                                                                                                                           |
| 2026-01-15 | Integration Health Monitoring Endpoint                | Created `/api/integration-health` endpoint for comprehensive monitoring of external integrations including circuit breakers, webhooks, and queue systems; exported CircuitBreakerStats and CircuitBreakerConfig interfaces for type safety; added aggregate health status (healthy/degraded/unhealthy) for operations teams; documented in OpenAPI spec                                                                                                                                                     |
| 2026-01-19 | Verify API Documentation Completeness                 | Verified all API endpoints are documented in OpenAPI spec; confirmed 45+ endpoints fully documented with schemas, parameters, responses; validated integration patterns (circuit breaker, retry, rate limiting) properly documented in endpoint descriptions; OpenAPI spec serves as single source of truth for API consumers                                                                                                                                                                               |
| 2026-01-20 | Consolidate rate limiting implementations             | Removed unused server/plugins/rate-limit.ts plugin; standardized on token bucket algorithm (enhanced-rate-limit.ts) for all API endpoints; kept database-backed rate limiter for analytics endpoints; documented rate limiting architecture with best practices                                                                                                                                                                                                                                             |
| 2026-01-20 | Process-then-Transform optimization for search API    | Moved pagination before `convertResourcesToHierarchicalTags` in search API endpoint; reduces transformation from O(n) to O(k) where k is page size; achieved 51x speedup for 1000 resources with 20 per page; added performance test to demonstrate improvement                                                                                                                                                                                                                                             |
| 2026-01-21 | Update webhookStorage tests for async/await           | Updated all test functions to use async/await for 50+ webhookStorage method calls; aligned with new asynchronous API from webhook persistence migration; 60+ test functions modified to properly await Promise-returning methods; all 9 Webhook, 8 Delivery, 9 API Key, 5 Queue, 5 Dead Letter, 8 Idempotency tests updated with async pattern                                                                                                                                                              |
| 2026-01-21 | Modularize Webhook Queue System (SRP)                 | Extracted WebhookSigner, WebhookQueueManager, WebhookDeliveryService, and DeadLetterManager modules; reduced webhookQueueSystem from 370 lines to ~160 lines; applied Single Responsibility Principle with dependency injection; eliminated God Class anti-pattern in webhook architecture                                                                                                                                                                                                                  |
| 2026-01-21 | Search Suggestions O(n) to O(k) Optimization          | Optimized useSearchSuggestions composable tag/category matching by scanning only Fuse.js search results instead of all resources; reduces O(n) to O(k) where k is search result count (typically 10 vs 1000 resources); performance test shows ~3% improvement in synthetic test due to Fuse.js overhead, real API usage pattern would see larger benefit; aligned with Process-then-Transform principle                                                                                                    |
| 2026-01-21 | Query Limits and Error Handling Improvements          | Added `take` limits to all webhookStorage queries (getAllWebhooks, getWebhooksByEvent, getAllDeliveries, getDeliveriesByWebhookId, getAllApiKeys, getQueue, getDeadLetterQueue) to prevent memory issues in production; fixed updateWebhook, updateDelivery, updateApiKey methods to check for record existence before updating to return null instead of throwing P2025 errors; improved error handling and data safety across webhook storage layer                                                       |
| 2026-01-21 | API Error Response Standardization                    | Standardized error responses across 16 API endpoints (search/suggestions, user/preferences, v1/rss, analytics/data, analytics/search, resource-health, resource-health/[id], v1/export/csv, v1/export/json, resources/lifecycle, sitemap, v1/sitemap, v1/webhooks/deliveries/index, resources/[id]/status.put); replaced custom error formats with centralized sendSuccessResponse, sendBadRequestError, sendNotFoundError, and handleApiRouteError helpers; improved API consistency for client developers |

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
| Error Handling    | composables/useErrorHandler.ts   | Centralized error management   |

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

## 🧩 Composable Architecture

### Hierarchy

```
High-Level (Orchestrators)
├── useResources.ts (main orchestrator)
├── useSearchPage.ts (search page orchestrator)
├── useRecommendationEngine.ts (recommendation orchestrator)
├── useAlternativeSuggestions.ts
├── useAdvancedResourceSearch.ts (advanced search with operators)
├── useAIResources.ts (AI-specific resource filtering)
└── useSearchSuggestions.ts (search suggestions)

Mid-Level (Feature-Specific)
├── useResourceFilters.ts
├── useResourceSearchFilter.ts
├── recommendation-strategies/useContentBasedRecommendations.ts
├── recommendation-strategies/useTrendingRecommendations.ts
├── recommendation-strategies/usePopularRecommendations.ts
├── recommendation-strategies/useCategoryBasedRecommendations.ts
├── recommendation-strategies/usePersonalizedRecommendations.ts
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
 ├── community/useCommunityFeatures.ts (orchestrator)
 │   ├── community/useUserProfiles.ts (user profile management)
 │   ├── community/useComments.ts (comment and reply management)
 │   ├── community/useVoting.ts (voting system)
 │   └── community/useModeration.ts (content moderation and flagging)

Utilities (Pure Functions)
├── utils/queryParser.ts (query parsing with operators)
├── utils/searchHighlighting.ts (search term highlighting)
├── utils/fuseHelper.ts (Fuse.js initialization)
├── utils/recommendation-algorithms.ts (recommendation algorithms)
└── [other utilities...]
```

### Dependency Rules

1. **Low-level composables**: Never import other composables
2. **Mid-level composables**: May import low-level composables
3. **High-level composables**: May import mid-level and low-level composables
4. **No circular dependencies**: Enforced by architecture

## 🎯 Recommendation Architecture

### Strategy Pattern Implementation

The recommendation engine follows the Strategy Pattern to provide flexible, testable recommendation algorithms:

```
useRecommendationEngine (Orchestrator)
├── Config Management
├── Strategy Composition
│   ├── useContentBasedRecommendations (content similarity)
│   ├── useTrendingRecommendations (recently popular)
│   ├── usePopularRecommendations (all-time popular)
│   ├── useCategoryBasedRecommendations (category filtering)
│   └── usePersonalizedRecommendations (user preferences)
└── getDiverseRecommendations (main API)

utils/recommendation-algorithms.ts (Pure Functions)
├── calculateSimilarity (resource similarity)
├── calculateInterestMatch (user interest matching)
├── calculateSkillMatch (skill level matching)
├── calculateCollaborativeScore (collaborative filtering)
└── applyDiversity (diversity algorithm)
```

### Recommendation Strategies

#### 1. Content-Based Recommendations

- **File**: `composables/recommendation-strategies/useContentBasedRecommendations.ts`
- **Algorithm**: Calculates similarity between resources based on category, tags, and technology
- **Use Case**: When user is viewing a specific resource, recommend similar resources

#### 2. Trending Recommendations

- **File**: `composables/recommendation-strategies/useTrendingRecommendations.ts`
- **Algorithm**: Identifies recently added resources with high popularity (> 5)
- **Use Case**: Discover new, popular resources

#### 3. Popular Recommendations

- **File**: `composables/recommendation-strategies/usePopularRecommendations.ts`
- **Algorithm**: Ranks all resources by popularity score
- **Use Case**: Discover all-time popular resources

#### 4. Category-Based Recommendations

- **File**: `composables/recommendation-strategies/useCategoryBasedRecommendations.ts`
- **Algorithm**: Filters resources by category and ranks by popularity
- **Use Case**: Explore resources within a specific category

#### 5. Personalized Recommendations

- **File**: `composables/recommendation-strategies/usePersonalizedRecommendations.ts`
- **Algorithm**: Combines multiple factors:
  - Content similarity (if viewing specific resource)
  - User interest matching (interests, tags, technology)
  - Collaborative filtering (past interactions)
  - Popularity score
  - Skill level matching
- **Use Case**: Personalized recommendations based on user behavior and preferences

### Recommendation Orchestration

The orchestrator (`useRecommendationEngine`) coordinates all strategies:

```typescript
const engine = useRecommendationEngine(resources, userPreferences)

// Get diverse recommendations combining all strategies
const recommendations = engine.getDiverseRecommendations(
  currentResource,
  currentCategory
)

// Get personalized recommendations
const personalized = engine.getPersonalizedRecommendations(currentResource)

// Update configuration
engine.updateConfig({ maxRecommendations: 15 })
```

### Architectural Benefits

1. **Single Responsibility**: Each strategy focuses on one recommendation algorithm
2. **Open/Closed**: New strategies can be added without modifying existing code
3. **Testability**: Pure functions and isolated strategies are easy to test
4. **Flexibility**: Strategies can be composed in different combinations
5. **Maintainability**: Each strategy is ~50-80 lines, easy to understand and modify

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

5. **Process-then-Transform Optimization**:
   - Apply filtering and pagination BEFORE data transformation
   - Only transform the data that will actually be used
   - Reduces O(n) to O(k) where k << n
   - Example: `server/api/v1/resources.get.ts` - hierarchical tag conversion moved after pagination (25x improvement)
   - Example: `server/api/v1/search.get.ts` - hierarchical tag conversion moved after pagination (51x improvement)

6. **O(1) Lookup Optimization**:
   - Use Map/WeakMap for O(1) lookups instead of Array.find() O(n)
   - Reduces deduplication from O(n²) to O(n)
   - Example: `composables/useAdvancedResourceSearch.ts` - deduplication using Map instead of find()

7. **Map-Based Indexing for Composables**:
   - Maintain Maps alongside arrays for fast data access
   - Initialize Maps from initial data for O(1) lookups
   - Keep Maps synchronized with array operations
   - Reduces all linear searches to constant time
   - Example: `composables/useCommunityFeatures.ts` - Map indexing for users, comments, votes, flags (134x faster)

8. **O(1) Set Lookups for Array Operations**:
   - Replace Array.includes() with Set.has() for O(1) lookups
   - Use Set for membership checks instead of linear search
   - Reduces complexity from O(n²) to O(n) in loops
   - Examples in `utils/recommendation-algorithms.ts`:
     - `calculateSimilarity()`: Set lookups for tags and technology matching
     - `calculateInterestMatch()`: Set lookups for user interests matching
     - `calculateCollaborativeScore()`: Set lookups for resource interaction checks
     - `applyDiversity()`: Set lookups for category and technology diversity (up to 82% faster)

9. **O(1) Set Lookups for Filter Matching**:
   - Pre-convert filter arrays to Sets before filtering for O(1) lookups
   - Use Set.has() instead of Array.includes() or Array.some()
   - Reduces filter complexity from O(n²) to O(n)
   - Example: `composables/useFilterUtils.ts` - Filter matching with Sets (up to 5x faster)

10. **Single-Pass Filter Consolidation**:

- Combine multiple sequential `filter()` operations into single iteration
- Use early exit pattern to skip unnecessary checks
- Reduces overhead of creating intermediate arrays
- Improves cache locality by processing each item once
- Example: `server/api/v1/search.get.ts` - Consolidated 6 filter operations into 1 pass (50% reduction)

10. **Pre-Processing Optimization**:
    - Pre-process filter values before iteration (lowercase conversion, Set creation)
    - Perform expensive operations once instead of per-item
    - Move invariant operations outside loops
    - Example: `server/api/v1/search.get.ts` - Pre-processed tags to Set for O(1) lookups

11. **Single-Pass Facet Calculation**:
    - Calculate all facet counts in single iteration instead of multiple searches
    - Perform search once, then count all facets from results
    - Eliminates redundant search operations
    - Example: `composables/useSearchPage.ts` - Facet counts calculated in single pass (83% faster)

12. **Cached Search Results**:
    - Cache search results in computed property to avoid duplicate searches
    - Vue's computed caching automatically reuses results when dependencies unchanged
    - Eliminates redundant search API calls across multiple computed properties
    - Example: `composables/useSearchPage.ts` - Search results cached and reused for filteredResources and facetCounts (50% faster)

13. **Correct Virtual Scroll Event Handling**:
    - Avoid manually adding scroll event listeners to virtual scroll containers
    - Virtual scroll libraries automatically handle scroll events through ref binding
    - Incorrect event handlers cause performance degradation and wasted CPU cycles

14. **Process-then-Transform Optimization (Search API)**:
    - Apply pagination BEFORE data transformation in search API
    - Only transform paginated resources, not all filtered resources
    - Reduces O(n) conversion to O(k) where k is page size (k << n)
    - Example: `server/api/v1/search.get.ts` - pagination moved before `convertResourcesToHierarchicalTags` (51x speedup)
    - Critical for search endpoints with large result sets (1000+ resources filtered, 20 per page)
    - Example: `components/VirtualResourceList.vue` - Removed incorrect scroll event listener, virtualizer handles events automatically

15. **Batch Filter Optimization**:
    - Filter all resources at once instead of iterating one-by-one
    - Eliminates repeated filter function calls
    - Example: `composables/useSearchPage.ts` - Filter all resources together instead of per-resource checks

16. **O(n²) to O(n) Deduplication**:
    - Replace `Array.some()` with Set for deduplication
    - Track seen IDs in Set for O(1) lookup
    - Transforms quadratic complexity to linear
    - Example: `composables/useRecommendationEngine.ts` - Recommendation deduplication (O(n²) → O(n))

17. **Lazy Component Loading**:
    - Use Nuxt 3 `Lazy` prefix for on-demand component loading
    - Remove direct imports for components not needed immediately
    - Reduces initial bundle size by excluding large components from main chunk
    - Nuxt automatically creates separate chunks and handles async loading
    - Example: `LazyResourceCard` instead of direct ResourceCard import
    - Benefits: Smaller initial bundle, faster Time to Interactive (TTI), same functionality
    - Pattern: `<LazyComponent />` instead of `<Component />` + `import Component from ...`
    - Use case: Large components (100+ lines) used in multiple locations with conditional/v-for rendering

18. **O(n²) to O(n) Filter Consolidation**:
    - Call filter functions once on entire array instead of per-resource
    - Eliminates n-1 redundant filter operations
    - Transforms quadratic complexity to linear
    - Example: `composables/useSearchPage.ts` - filteredResources computation (12.3x faster)
    - Benefits: Dramatic performance improvement for larger datasets, simpler code
    - Pattern: Single `filter(allItems)` instead of `items.filter(i => filter([i]).length > 0)`
    - Use case: Filtering arrays where filter function accepts array parameter

19. **Lazy Component Loading Enforcement**:
    - Replace direct component imports with Nuxt `Lazy` prefix for code splitting
    - Large components (100+ lines) loaded on-demand instead of bundled in initial chunk
    - Reduces initial bundle size, improves Time to Interactive (TTI)
    - Example: `LazySearchBar`, `LazyResourceFilters` instead of direct imports
    - Benefits: 7.3 kB gzipped removed from initial bundle, faster page load
    - Pattern: `<LazyComponent />` instead of `<Component />` + `import Component from ...`
    - Use case: Large components used in multiple pages (pages/index.vue, pages/search.vue, layouts/default.vue)

20. **LRU Search Result Caching**:
    - Cache search results using LRU (Least Recently Used) eviction policy
    - Prevent duplicate expensive search operations when multiple functions access same query
    - Use Map with size limit and order tracking for LRU behavior
    - Example: `composables/useAdvancedResourceSearch.ts` - Search results cached with 100-entry LRU cache
    - Benefits: Eliminates redundant Fuse.js searches when filteredResources and facetCounts both call advancedSearchResources()
    - Pattern: Cache on first access, reuse on subsequent calls, evict oldest when cache full
    - Use case: Search results used by multiple computed properties or functions within same composable instance

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

| Date       | Category          | Decision                                                                | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-01-07 | Code Quality      | Removed duplicate Google Fonts caching in nuxt.config.ts                | Eliminated code duplication, reduced config size                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2025-01-07 | Build System      | Created separate nuxt.config.analyze.ts for bundle analysis             | Removed dynamic import anti-pattern, improved build predictability                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2025-01-07 | Security          | Removed static CSP meta tag from nuxt.config.ts                         | Centralized CSP in server plugin with nonce support, improved security                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2025-01-07 | Architecture      | Verified no circular dependencies exist in composables                  | Confirmed clean dependency hierarchy                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2025-01-07 | Code Quality      | Extracted shared DOMPurify configuration from utils/sanitize.ts         | Eliminated 158 lines of duplicate configuration, improved maintainability                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2025-01-07 | Architecture      | Created useSearchPage orchestrator composable for search page           | Implemented Layer Separation pattern, moved business logic from page to composable                                                                                                                                                                                                                                                                                                                                                                                              |
| 2025-01-07 | Architecture      | Refactored pages/search.vue to use orchestrator pattern                 | Eliminated 200+ lines of inline filtering logic, improved maintainability                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2025-01-07 | Architecture      | Search module refactoring to eliminate code duplication                 | Eliminated 315 lines of duplicate code, created 4 single-responsibility utilities                                                                                                                                                                                                                                                                                                                                                                                               |
| 2025-01-07 | Architecture      | Refactored useRecommendationEngine to Strategy Pattern                  | Eliminated God Class anti-pattern (437→~80 lines orchestrator), 5 single-responsibility strategies, improved testability                                                                                                                                                                                                                                                                                                                                                        |
| 2025-01-07 | Architecture      | Layer Separation in analytics and home pages                            | Extracted business logic from page components to dedicated composables, 31% code reduction, improved maintainability                                                                                                                                                                                                                                                                                                                                                            |
| 2025-01-07 | Type Safety       | Fixed `any` types in useUrlSync and useCommunityFeatures                | Replaced all `any` types with proper TypeScript interfaces and types, enhanced type checking and IDE support                                                                                                                                                                                                                                                                                                                                                                    |
| 2025-01-09 | Architecture      | Layer Separation in submit page                                         | Extracted business logic from page to dedicated composable (useSubmitPage), 137 lines removed from page component (449→312, 31% reduction)                                                                                                                                                                                                                                                                                                                                      |
| 2025-01-09 | Architecture      | Layer Separation in API keys page                                       | Extracted business logic from page to dedicated composable (useApiKeysPage), 60 lines removed from page component (188→128, 32% reduction)                                                                                                                                                                                                                                                                                                                                      |
| 2025-01-09 | Build System      | Added Nuxt 3 globals to TypeScript ESLint config                        | Fixed 'no-undef' errors for Nuxt globals ($fetch, ref, computed, etc.) in TypeScript files                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-01-09 | Architecture      | Refactored useCommunityFeatures to modular composables                  | Eliminated God Class anti-pattern (432→~170 lines orchestrator), created 4 single-responsibility composables, replaced O(n) linear searches with O(1) Map-based indexing, full Vue 3 reactivity support                                                                                                                                                                                                                                                                         |
| 2026-01-09 | Architecture      | Layer Separation in AI keys page                                        | Extracted AI-specific filtering logic from page template to dedicated composable (useAIResources), eliminated business logic in presentation layer                                                                                                                                                                                                                                                                                                                              |
| 2026-01-10 | Data Architecture | Added down.sql files to all migrations                                  | Ensured all migrations are reversible (migration safety), enables safe rollback in case of migration failures                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-01-10 | Data Architecture | Added composite index (category, timestamp)                             | Optimized analytics queries filtering by category and date, improves getAggregatedAnalytics performance                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-01-10 | Data Architecture | Extracted event mapping helper function                                 | Eliminated code duplication in analytics-db.ts, single source of truth for database-to-application event transformation                                                                                                                                                                                                                                                                                                                                                         |
| 2026-01-10 | Architecture      | Module Extraction - Centralized filtering in useFilterUtils             | Eliminated 70+ lines of duplicate filtering logic in useSearchPage, added date range filtering as reusable utility function                                                                                                                                                                                                                                                                                                                                                     |
| 2026-01-10 | Type Safety       | Interface Definition - Unified community types                          | Created types/community.ts with unified type definitions, eliminated 11 `as any` casts from useCommunityFeatures.ts, ensured type-safe contracts across all community modules                                                                                                                                                                                                                                                                                                   |
| 2026-01-10 | Data Architecture | Implemented soft-delete pattern for AnalyticsEvent                      | Added deletedAt timestamp column, index, and 5 new functions (cleanupOldEvents, cleanupSoftDeletedEvents, restoreSoftDeletedEvents, getSoftDeletedEventsCount, getSoftDeletedEvents, exportSoftDeletedEventsToCsv) preventing permanent data loss with restore capability                                                                                                                                                                                                       |
| 2026-01-10 | Data Architecture | Applied pending migration for category timestamp index                  | Migration 20260110022513_add_category_timestamp_index now applied to optimize category-based analytics queries (3-5x performance improvement)                                                                                                                                                                                                                                                                                                                                   |
| 2026-01-12 | Type Safety       | Interface Definition - Centralized Comment type in ResourceComments.vue | Removed inline `interface Comment` duplication, standardized with types/community.ts, added display adapter for backward compatibility, eliminated type inconsistency and improved maintainability                                                                                                                                                                                                                                                                              |
| 2026-01-10 | Data Architecture | Applied soft-delete migration                                           | Migration 20260110100000_add_soft_delete applied with reversible down.sql (DROP INDEX, ALTER TABLE DROP COLUMN), enables safe data deletion with backup and restore capability                                                                                                                                                                                                                                                                                                  |
| 2026-01-10 | Data Architecture | Added application-layer data validation                                 | Updated insertAnalyticsEvent to use analyticsEventSchema Zod validation with safeParse, returns {success, error?} object, enforces valid event types, categories, and IP addresses at application boundary (SQLite constraint limitations)                                                                                                                                                                                                                                      |
| 2026-01-16 | Architecture      | Extract Collection Utils - Map-Array Synchronization                    | Eliminated duplicate Map-Array synchronization pattern across 3 community composables (useUserProfiles, useModeration, useVoting); created utils/collection-utils.ts with updateInArrayMap, addToArrayMap, removeInArrayMap, initializeMapFromArray utilities (76 lines removed from composables, 132 lines added to utils)                                                                                                                                                     |
| 2026-01-19 | Performance       | Lazy Component Loading - Bundle Optimization                            | Replaced direct imports of SearchBar and ResourceFilters with Lazy components in 4 files (pages/index.vue, pages/search.vue, layouts/default.vue, pages/ai-keys.vue); enabled code splitting for 7.3 kB gzipped reduction in initial bundle; improved Time to Interactive (TTI)                                                                                                                                                                                                 |
| 2026-01-19 | Data Architecture | Fixed Soft-Delete Violation - Data Integrity                            | Fixed critical data integrity issue in analyticsCleanup.ts that used hard delete instead of soft-delete pattern; replaced deleteMany with updateMany (sets deletedAt); all data deletion now follows consistent soft-delete pattern with backup and restore capability; prevents permanent data loss, aligns with migration 20260110100000 intent                                                                                                                               |
| 2026-01-19 | Architecture      | Storage Abstraction Consistency - LocalStorage Pattern                  | Refactored utils/searchAnalytics.ts and plugins/performance.client.ts to use createStorage utility instead of direct localStorage calls; eliminated 92 lines of duplicate localStorage logic (custom loadFromStorage/saveToStorage methods); unified Date serialization via storage utility (**date** marker); all localStorage operations now use single source of truth with consistent error handling and type safety; improved maintainability and reduced code duplication |

| 2026-01-11 | Bug Fixes | Fixed getUserFlags property mismatch | Fixed flag filtering in useModeration to use `userId` instead of `flaggedBy`, enabling user-based flag queries to return correct results; updated test to validate fixed behavior |
| 2026-01-11 | Type Safety | Made UserPrivacy properties optional | Updated UserPrivacy interface to have optional properties (`showEmail?`, `showActivity?`), enabling partial privacy updates without TypeScript errors; all 61 useUserProfiles tests passing |

| 2026-01-10 | Data Architecture | Added application-layer data validation | Updated insertAnalyticsEvent to use Zod schema validation, enforces valid event types, categories, and IP addresses at application boundary (SQLite constraint limitations) |
| 2026-01-10 | Architecture | Dead Code Removal - Removed obsolete useResourceRecommendations | Eliminated 287 lines of dead code (old recommendation implementation), single source of truth now useRecommendationEngine with Strategy Pattern, reduced confusion and technical debt |
| 2026-01-10 | Architecture | Layer Separation - WebhookManager component refactoring | Extracted business logic from components/WebhookManager.vue to dedicated composable (useWebhooksManager), eliminated API calls and state management from presentation layer, components now handle UI only (reduced from 510 to ~180 lines) |
| 2026-01-10 | Architecture | Layer Separation - SubmissionReview component refactoring | Extracted business logic from components/SubmissionReview.vue to dedicated composable (useSubmissionReview), eliminated API calls and validation logic from presentation layer, components now handle UI only (reduced from 458 to ~120 lines) |

| 2026-01-10 | Architecture | DRY - Extracted generic toggle utility for filter arrays | Eliminated 70+ lines of duplicate toggle logic in useSearchPage, created reusable toggleArrayItem utility in useFilterUtils, reduced code by 23 lines (net 12 lines total reduction) |
| 2026-01-10 | UI/UX Architecture | Component Extraction - Created FilterSection reusable component | Eliminated 220 lines of duplicate filter section code (54% reduction in ResourceFilters), created single-responsibility component for all checkbox-based filters with full ARIA accessibility support |
| 2026-01-11 | Architecture | Layer Separation - ApiKeys component refactoring | Extracted business logic from components/ApiKeys.vue to dedicated composable (useApiKeysManager), eliminated API calls and state management from presentation layer, components now handle UI only (reduced from 484 to ~360 lines, 26% reduction) |
| 2026-01-11 | Architecture | Layer Separation - StatusManager component refactoring | Extracted business logic from components/StatusManager.vue to dedicated composable (useResourceStatusManager), eliminated API calls and state management from presentation layer, components now handle UI only (reduced from 247 to 196 lines, 21% reduction) |
| 2026-01-11 | Architecture | Layer Separation - compare page refactoring | Extracted business logic from pages/compare/[ids].vue to dedicated composable (useComparisonPage), eliminated duplicate defaultCriteria (now uses useResourceComparison config), removed API calls and state management from presentation layer, page now handles UI only (reduced from 211 to 80 lines, 62% reduction) |
| 2026-01-11 | Performance | Batch facet calculation optimization | Reduced search operations from 6 to 1 in useSearchPage facet calculation, implemented calculateAllFacetCounts for single-pass facet counting (83% reduction in search operations, O(6n log n) → O(n log n)) |
| 2026-01-11 | Architecture | Layer Separation - resources/[id].vue page refactoring | Extracted business logic from pages/resources/[id].vue to dedicated composable (useResourceDetailPage), eliminated API calls, state management, analytics fetching, history fetching, SEO metadata, JSON-LD structured data, and related resource logic from presentation layer, page now handles UI only (reduced from 522 to 197 lines, 62% reduction) |
| 2026-01-12 | Architecture | Layer Separation - SearchAnalytics component refactoring | Extracted business logic from components/SearchAnalytics.vue to dedicated composable (useSearchAnalytics), centralized type definitions to types/analytics.ts, eliminated API calls, state management, error handling, and date formatting from presentation layer, component now handles UI only (reduced from 413 to 299 lines, 28% reduction) |
| 2026-01-15 | Architecture | Module Extraction - useResourceDetailPage refactoring | Eliminated God Class anti-pattern in useResourceDetailPage.ts (343 → 238 lines, 31% reduction), extracted SEO metadata logic to utils/seo.ts (144 lines), extracted clipboard operations to utils/clipboard.ts (103 lines), removed hardcoded sampleComments data, composable now acts as orchestrator only (delegates to specialized utilities), improved Single Responsibility Principle, enhanced code reusability across application |
| 2026-01-16 | Architecture | DRY - Extract duplicate updateInArray utility for comments | Eliminated code duplication in useComments.ts (309 → 231 lines, 25% reduction) by extracting updateInArray helper to utils/comment-utils.ts (40 lines), removed 4 duplicate function definitions, single source of truth for comment array updates, improved maintainability and testability, applied DRY principle |
| 2026-01-16 | Architecture | Interface Definition - Recommendation Strategy Pattern | Created RecommendationStrategy interface with getRecommendations() contract, refactored all 5 recommendation composables (useContentBased, usePopular, useTrending, useCategoryBased, usePersonalized) to implement unified interface, eliminated duplicate API patterns in useRecommendationEngine (now uses uniform strategy.getRecommendations(context) calls), enables polymorphism and easy addition of new strategies, improved maintainability and extensibility, applied Strategy Pattern |
| 2026-01-17 | Performance | O(n²) to O(n) Filter Optimization in useSearchPage | Fixed critical O(n²) bug in filteredResources computed property that called filterByAllCriteriaWithDateRange([resource]) for each resource instead of once on entire array; reduced 4 lines of code; achieved 12.3x speedup (5.124ms → 0.415ms for 100 resources); eliminated n-1 redundant filter operations; all 1245 tests passing with 0 regressions |
| 2026-01-19 | Architecture | Dead Code Removal - Mock data in useResourceDetailPage | Eliminated resourceStats dead code with mock random data (Math.random() for viewCount/trending) from useResourceDetailPage; reduced 13 lines (238 → 225, 5.5% reduction); analyticsData remains as single source of truth for stats; improved data integrity by removing inconsistent mock data; all 1298 tests passing with 0 regressions |
| 2026-01-18 | Architecture | Single Responsibility - Remove duplicate sorting logic from useResourceFilters | Removed filteredResources computed with duplicate sort logic from useResourceFilters (121 → 66 lines, 55 lines removed), removed sortOption state and setSortOption (not filtering responsibility), moved sortOption state management to useResources orchestrator (clear ownership), updated useResourceFilters tests to use filterByAllCriteria utility directly (210 → 233 lines), enforced Single Responsibility - useResourceFilters only handles filtering, eliminated 16 lines of duplicate sort logic (DRY principle), all 1246 tests pass (100% pass rate), 0 lint errors, net 32 lines removed (cleaner architecture) |
| 2026-01-17 | Architecture | Module Extraction - Facet counting utility | Eliminated code duplication in useAdvancedResourceSearch.ts (235 → 188 lines, 20% reduction) by creating utils/facet-utils.ts with countProperty helper and specialized counting functions (countCategory, countPricingModel, countDifficulty, countTechnology, countTags, countBenefits), eliminated 50 lines of duplicate counting logic in calculateAllFacetCounts, applied DRY principle, single source of truth for facet counting, improved maintainability |
| 2026-01-17 | Architecture | DRY - Extract toggle function pattern in useSearchPage | Eliminated duplicate toggle logic in useSearchPage.ts (248 → 234 lines, 6% reduction) by creating generic toggleFilterOption helper that handles array toggling and analytics tracking for all 6 filter types (category, pricing, difficulty, technology, tag, benefit), reduced 30 lines of duplicate code, applied DRY principle, single source of truth for filter toggle logic, improved maintainability |

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
  ip         String?
  timestamp  Int
  properties String?
  deletedAt  Int?

  @@index([timestamp])
  @@index([resourceId])
  @@index([type])
  @@index([ip])
  @@index([timestamp, type])
  @@index([timestamp, resourceId])
  @@index([resourceId, type])
  @@index([ip, timestamp])
  @@index([category, timestamp])
  @@index([deletedAt])
  @@index([resourceId, type, timestamp, deletedAt])
  @@index([timestamp, deletedAt])
  @@index([ip, timestamp, deletedAt])
}
```

**Design Principles**:

- Type-safe with TypeScript
- Optimized for read-heavy analytics workloads
- Timestamps stored as integers for fast comparison
- Properties stored as JSON for flexibility
- **Soft-delete support**: `deletedAt` timestamp prevents permanent data loss

### Index Strategy

#### Single-Column Indexes

| Column     | Purpose                                   |
| ---------- | ----------------------------------------- |
| timestamp  | Time-based filtering and range queries    |
| resourceId | Resource-specific analytics               |
| type       | Event type aggregation                    |
| ip         | IP-based rate limiting and user analytics |
| deletedAt  | Soft-delete record filtering              |

#### Composite Indexes

| Columns                                  | Query Pattern                              | Benefit                                                |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| (timestamp, type)                        | Events by date and type                    | Faster filtered analytics queries                      |
| (timestamp, resourceId)                  | Resource events by date                    | Faster resource analytics                              |
| (resourceId, type)                       | Resource-specific event types              | Optimized resource view analytics                      |
| (ip, timestamp)                          | Rate limiting by IP and time               | Optimized rate limiting queries                        |
| (category, timestamp)                    | Events by category and date                | Optimized category analytics                           |
| (resourceId, type, timestamp, deletedAt) | Resource analytics with soft-delete filter | Optimized `getResourceAnalytics` queries (3-5x faster) |
| (timestamp, deletedAt)                   | Old event cleanup with soft-delete filter  | Optimized `cleanupOldEvents` queries                   |
| (ip, timestamp, deletedAt)               | IP analytics with soft-delete filter       | Optimized IP-based queries with soft-delete            |

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

- All migrations are reversible (down.sql manually added for safety)
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

### Soft-Delete Pattern

**Purpose**: Prevent permanent data loss while maintaining storage efficiency

**Implementation**: AnalyticsEvent model includes `deletedAt` timestamp column

#### Functions

| Function                      | Purpose                                     | Return Type                               |
| ----------------------------- | ------------------------------------------- | ----------------------------------------- |
| `cleanupOldEvents()`          | Soft-delete old records by retention period | `Promise<number>` (count of soft-deleted) |
| `cleanupSoftDeletedEvents()`  | Permanently delete soft-deleted records     | `Promise<{ deletedCount, backupPath }>`   |
| `restoreSoftDeletedEvents()`  | Restore soft-deleted records by ID          | `Promise<number>` (count of restored)     |
| `getSoftDeletedEventsCount()` | Get count of soft-deleted records           | `Promise<number>`                         |
| `getSoftDeletedEvents()`      | Fetch soft-deleted records for review       | `Promise<AnalyticsEvent[]>`               |

#### Query Filtering

All analytics queries automatically filter out soft-deleted records:

```typescript
where: {
  timestamp: { gte, lte },
  deletedAt: null  // Exclude soft-deleted records
}
```

#### Export and Backup

Soft-deleted events can be exported to CSV before permanent deletion:

```typescript
const backup = await cleanupSoftDeletedEvents(true)
// backup.backupPath contains CSV file location
// backup.deletedCount contains deleted record count
```

**Benefits**:

- Zero data loss - all deleted records can be restored
- Audit trail - soft-delete timestamp tracks when record was deleted
- Storage management - old records can be permanently deleted after backup
- Recovery capability - accidental deletions can be undone

**Anti-Patterns Avoided**:

- ❌ Destructive delete without backup
- ❌ No ability to recover deleted records
- ❌ Audit trail gaps

### Data Validation

**Approach**: Application-layer validation using Zod schemas

Since SQLite doesn't support ENUM types or CHECK constraints, validation is enforced at application boundary.

#### Validation Schema

**Location**: `server/utils/validation-schemas.ts`

**Event Type Validation**:

```typescript
const VALID_EVENT_TYPES = [
  'resource_view',
  'search',
  'filter_change',
  'bookmark',
  'comparison',
  'submission',
]
```

#### Validation in `insertAnalyticsEvent()`

```typescript
// Validate using Zod schema before database insert
const validation = analyticsEventSchema.safeParse(event)

if (!validation.success) {
  // Log validation error
  console.error('Analytics event validation failed:', errorMessage)
  return { success: false, error: errorMessage }
}

// Insert only validated data
await prisma.analyticsEvent.create({ data: validatedEvent })
```

**Benefits**:

- Type-safe validation at compile time
- Runtime validation catches invalid data
- Clear error messages for debugging
- Single source of truth for validation rules
- Database integrity enforced at application layer

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

#### Event Mapping Helper Function

Database event objects are transformed to application-level AnalyticsEvent type using a helper function:

```typescript
function mapDbEventToAnalyticsEvent(event: {
  type: string
  resourceId: string | null
  category: string | null
  url: string | null
  userAgent: string | null
  ip: string | null
  timestamp: number
  properties: string | null
}): AnalyticsEvent {
  return {
    type: event.type,
    resourceId: event.resourceId || undefined,
    category: event.category || undefined,
    url: event.url || undefined,
    userAgent: event.userAgent || undefined,
    ip: event.ip || undefined,
    timestamp: event.timestamp,
    properties: event.properties ? JSON.parse(event.properties) : undefined,
  }
}
```

**Benefits**:

- Single source of truth for event transformation logic
- Eliminates code duplication across multiple functions
- Consistent null-to-undefined conversion
- Consistent JSON parsing for properties field
- Easier maintenance and testing

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
- Shared constants for valid values (`server/utils/constants.ts`)
- Input sanitization (DOMPurify for XSS prevention)
- Rate limiting for abuse prevention (database-level aggregation)
- Event type validation (strict check against VALID_EVENT_TYPES constant)
- Category validation (strict check against VALID_CATEGORIES constant)
- IP address format validation (IPv4/IPv6)

#### Validation Constants Architecture

**Location**: `server/utils/constants.ts`

**Purpose**: Single source of truth for valid categories and event types

**Implementation**:

```typescript
// Valid categories for resources and analytics
export const VALID_CATEGORIES = [
  'Development',
  'Design',
  'Productivity',
  'Marketing',
  'Analytics',
  'Security',
  'AI/ML',
  'DevOps',
  'Testing',
  'Education',
] as const

// Type-safe validation function
export function isValidCategory(category: string): category is ValidCategory {
  return VALID_CATEGORIES.includes(category as ValidCategory)
}

// Valid event types for analytics
export const VALID_EVENT_TYPES = [
  'resource_view',
  'search',
  'filter_change',
  'bookmark',
  'comparison',
  'submission',
] as const

// Type-safe validation function
export function isValidEventType(type: string): type is ValidEventType {
  return VALID_EVENT_TYPES.includes(type as ValidEventType)
}
```

**Usage Points**:

1. **API Validation** (`validation-schemas.ts`): Zod schemas use `isValidCategory()` and `isValidEventType()` to reject invalid data at API boundary
2. **Quality Checks** (`quality-checks.ts`: Resource submissions validated against `VALID_CATEGORIES`
3. **Type Safety**: TypeScript type guards ensure compile-time checking
4. **Error Messages**: Validation errors include list of all valid values for user guidance

**Benefits**:

- Single source of truth eliminates duplication
- Type-safe validation with TypeScript
- Consistent validation across all modules
- Easy to update when adding new categories or event types
- Clear error messages guide users to correct values

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

## 🎨 Form Accessibility Decision Log

| Date       | Decision                                     | Rationale                                                   |
| ---------- | -------------------------------------------- | ----------------------------------------------------------- |
| 2025-01-08 | Implemented comprehensive ARIA support       | Ensure all forms are WCAG 2.1 AA compliant                  |
| 2025-01-08 | Added live regions for status messages       | Screen readers announce changes without explicit navigation |
| 2025-01-08 | Implemented focus trap for modals            | Keyboard users stay contained within modal boundaries       |
| 2025-01-08 | Added validation error announcements         | Screen readers announce all validation errors immediately   |
| 2025-01-08 | Used semantic form elements                  | Proper HTML5 structure improves accessibility               |
| 2025-01-08 | Standardized form patterns across components | Consistent UX for all forms in the application              |

---

## 📊 Data Architecture Decision Log

| Date       | Decision                                        | Rationale                                                                   |
| ---------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| 2025-01-07 | Migrate to SQLite from PostgreSQL               | Zero configuration, better for boilerplate, matches better-sqlite3 dep      |
| 2025-01-07 | Consolidate to Prisma ORM                       | Single source of truth, type safety, migrations, query optimization         |
| 2025-01-07 | Add composite indexes                           | Optimize common query patterns (timestamp + resourceId, timestamp + type)   |
| 2025-01-07 | Refactor to database-level aggregation          | Fix N+1 queries, 95% reduction in data transfer                             |
| 2025-01-07 | Implement Prisma Migrate                        | Version-controlled schema changes, reversible migrations                    |
| 2025-01-07 | Enhanced data validation at boundary            | Centralized Zod schemas, consistent error responses, better type safety     |
| 2025-01-07 | Made IP field optional in schema                | Handle edge cases where IP unavailable, better data model flexibility       |
| 2025-01-07 | Database-based rate limiting                    | Scalable across instances, efficient aggregation, no in-memory state        |
| 2025-01-07 | Fix N+1 query in getAggregatedAnalytics         | Move category aggregation to Promise.all, 50% reduction in roundtrips       |
| 2026-01-09 | Added strict category and event type validation | Prevent invalid data from entering system, establish single source of truth |
| 2026-01-09 | Created shared constants for validation         | Eliminate data duplication, ensure consistency across validation layers     |
| 2026-01-09 | Added composite index for rate limiting         | Optimize (ip, timestamp) queries used in rate limiting, improve scalability |

## 📊 Performance Architecture Decision Log

| Date       | Decision                                       | Rationale                                                                                                                                                                    |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-01-07 | Process-then-Transform optimization pattern    | Apply transformations AFTER filtering/pagination to reduce O(n) to O(k)                                                                                                      |
| 2025-01-07 | O(1) lookup optimization for deduplication     | Use Map/WeakMap instead of find() to reduce deduplication from O(n²) to O(n)                                                                                                 |
| 2025-01-08 | Map-based indexing for useCommunityFeatures    | O(1) lookups for all data access, 134x faster performance (76ms→0.57ms for 10k lookups)                                                                                      |
| 2025-01-09 | O(1) Set lookups for recommendation algorithms | Replace Array.includes() with Set.has() in loops to reduce O(n²) to O(n) for diversity, similarity, interest, and collaborative calculations (up to 83% faster)              |
| 2026-01-10 | O(1) Set lookups for filter matching           | Pre-convert filter arrays to Sets for O(1) lookups instead of O(n) Array.includes() in useFilterUtils.ts (up to 5x faster)                                                   |
| 2026-01-10 | Single-pass facet calculation                  | Calculate all facet counts in single iteration instead of 6 separate searches in useSearchPage.ts (83% faster)                                                               |
| 2026-01-10 | Batch filter optimization                      | Filter all resources at once instead of one-by-one iteration in useSearchPage.ts (reduces filter overhead)                                                                   |
| 2026-01-10 | Pre-computed Maps for search suggestions       | Eliminated O(n²) array scans in useSearchSuggestions.ts by pre-computing tag/category Maps for O(1) lookups (up to 90% faster)                                               |
| 2026-01-10 | Eliminated unnecessary array copy              | Removed `[...resources]` array copy in useResourceSearchFilter.ts, avoiding memory allocation and overhead                                                                   |
| 2026-01-20 | LRU search result caching                      | Added 100-entry LRU cache in useAdvancedResourceSearch.ts to eliminate duplicate Fuse.js searches when filteredResources and facetCounts both call advancedSearchResources() |

---

## 🎨 Form Accessibility Architecture

### WCAG 2.1 AA Compliance Patterns

Implemented comprehensive form accessibility following WCAG 2.1 Level AA guidelines:

#### 1. ARIA Attribute Pattern

**Location**: Applied across all form components

**Implementation**:

```vue
<!-- Required field with proper ARIA -->
<label for="email">
  Email <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-description email-error"
  :aria-invalid="errors.email ? 'true' : 'false'"
/>
<p id="email-description" class="sr-only">
  Enter your email address
</p>
<div v-if="errors.email" id="email-error" role="alert">
  {{ errors.email }}
</div>
```

**Benefits**:

- Screen readers identify required fields
- Error states are programmatically associated
- Field descriptions linked for assistive technology
- Clear validation state communication

#### 2. Live Region Pattern

**Location**: `pages/submit.vue`, `components/ApiKeys.vue`

**Implementation**:

```vue
<!-- Success message with live region -->
<div v-if="success" role="alert" aria-live="polite">
  <p>Your submission was successful!</p>
</div>

<!-- Error message with immediate announcement -->
<div v-if="error" role="alert" aria-live="assertive">
  <p>{{ error }}</p>
</div>
```

**Benefits**:

- Success messages announced when they appear
- Error messages announced immediately and prominently
- Non-intrusive status updates for screen readers
- `aria-live="polite"` for informational messages
- `aria-live="assertive"` for urgent error messages

#### 3. Focus Management Pattern

**Location**: `components/ApiKeys.vue`

**Implementation**:

```typescript
// Focus trap for modal
const trapFocus = (event: KeyboardEvent) => {
  const focusableContent = getFocusableElements(modalContent.value)
  const firstElement = focusableContent[0]
  const lastElement = focusableContent[focusableContent.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Store and restore focus
const previousActiveElement = document.activeElement as HTMLElement
// ... open modal ...
previousActiveElement?.focus() // Restore focus on close
```

**Benefits**:

- Keyboard users stay trapped within modal boundaries
- Focus properly restored after modal interactions
- Predictable focus behavior for keyboard navigation
- Improved accessibility for modal dialogs
- Better experience for keyboard-only users

#### 4. Form Validation Announcement Pattern

**Location**: `pages/submit.vue`

**Implementation**:

```typescript
const announceErrors = () => {
  const errorList = Object.values(errors.value).join('. ')
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'alert')
  announcement.setAttribute('aria-live', 'assertive')
  announcement.className = 'sr-only'
  announcement.textContent = `Form validation failed: ${errorList}`

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 5000)
}
```

**Benefits**:

- Screen readers announce all validation errors immediately
- Users understand what needs to be corrected
- No need to navigate to find errors manually
- Better form submission experience for assistive technology users
- Temporary announcements removed after 5 seconds

#### 5. Semantic Form Structure Pattern

**Location**: `components/WebhookManager.vue`

**Implementation**:

```vue
<!-- Checkbox group with proper semantics -->
<fieldset>
  <legend class="font-medium mb-2">Events</legend>
  <div
    role="group"
    aria-label="Select webhook events"
    class="event-checkboxes"
  >
    <label v-for="event in events" :key="event">
      <input
        v-model="selectedEvents"
        type="checkbox"
        :value="event"
        :aria-label="`Subscribe to ${event} event`"
      />
      {{ event }}
    </label>
  </div>
</fieldset>
```

**Benefits**:

- Proper semantic structure for checkbox groups
- Screen readers understand related checkbox relationship
- Clear label for entire group
- Individual checkboxes have contextual labels
- Better navigation for keyboard and screen reader users

#### 6. Modal Dialog Pattern

**Location**: `components/ApiKeys.vue`

**Implementation**:

```vue
<div
  v-if="showModal"
  class="modal-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  @click="closeModal"
  @keydown.esc="closeModal"
>
  <div
    ref="modalContent"
    class="modal-content"
    tabindex="-1"
    @click.stop
  >
    <h2 id="modal-title">Modal Title</h2>
    <!-- Modal content -->
  </div>
</div>
```

**Benefits**:

- Modal properly announced as dialog to screen readers
- ESC key handler for keyboard users
- Click outside to close for mouse users
- Focus trap keeps keyboard navigation contained
- Focus returns to previous element on close
- Full keyboard accessibility support

### Form Accessibility Best Practices

#### DO:

✅ Use ARIA attributes for all form fields (`aria-required`, `aria-invalid`, `aria-describedby`)
✅ Implement live regions for status messages (`role="alert"`, `aria-live`)
✅ Provide keyboard alternatives for all interactive elements
✅ Ensure form validation errors are announced to screen readers
✅ Use semantic HTML elements (`fieldset`, `legend`, `label`)
✅ Implement focus management for modals and dynamic content
✅ Test with screen readers (NVDA, JAWS, VoiceOver)
✅ Test with keyboard-only navigation

#### DO NOT:

❌ Use color alone to indicate form validation state
❌ Rely on visual cues only for error messages
❌ Forget focus management for modals and dynamic content
❌ Leave form validation errors silent for screen readers
❌ Use `placeholder` as a substitute for `label`
❌ Create forms without proper keyboard navigation support
❌ Ignore focus indicators and focus states

### Form Accessibility Decision Log

| Date       | Decision                                     | Rationale                                                                      |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| 2025-01-08 | Implemented comprehensive ARIA support       | Ensure all forms are WCAG 2.1 AA compliant                                     |
| 2025-01-08 | Added live regions for status messages       | Screen readers announce changes without explicit navigation                    |
| 2025-01-08 | Implemented focus trap for modals            | Keyboard users stay contained within modal boundaries                          |
| 2025-01-08 | Added validation error announcements         | Screen readers announce all validation errors immediately                      |
| 2025-01-08 | Used semantic form elements                  | Proper HTML5 structure improves accessibility                                  |
| 2025-01-08 | Standardized form patterns across components | Consistent UX for all forms in the application                                 |
| 2026-01-10 | Enhanced search input ARIA attributes        | Added aria-expanded, aria-controls, aria-autocomplete for screen readers       |
| 2026-01-10 | Added role=group to resource actions         | Better semantic structure for action button groups in ResourceCard             |
| 2026-01-10 | Implemented radiogroup for date filters      | Improved keyboard navigation and screen reader announcements for radio buttons |
| 2026-01-10 | Enhanced ARIA labels on buttons              | Descriptive labels for "Reset all filters" and "Clear all search history"      |
| 2026-01-10 | Implemented focus trap for mobile menu       | Keyboard navigation contained within mobile menu with ESC key support          |

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
- `POST /api/v1/webhooks/trigger` - Test webhook delivery (async with idempotency)
- `GET /api/v1/webhooks/deliveries` - List webhook deliveries
- `GET /api/v1/webhooks/queue` - Get webhook queue and dead letter queue status
- `POST /api/v1/webhooks/dead-letter/{id}/retry` - Retry dead letter webhook

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

---

## 🔐 Security Architecture Decision Log

| Date       | Decision                                               | Rationale                                                              |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 2025-01-08 | Comprehensive security audit completed                 | Zero vulnerabilities found, comprehensive security controls verified   |
| 2025-01-08 | Token bucket rate limiting implementation              | Scalable, memory-efficient rate limiting without external dependencies |
| 2025-01-08 | Multi-layer XSS prevention (DOMPurify + preprocessing) | Defense in depth for input sanitization                                |
| 2025-01-08 | Dynamic nonce generation for CSP                       | Prevents XSS attacks with per-request nonces                           |
| 2025-01-08 | Circuit breaker pattern for external services          | Prevents cascading failures from external dependencies                 |
| 2025-01-08 | Retry with exponential backoff and jitter              | Prevents thundering herd, improves distributed system resilience       |

---

## 🛡️ Security Audit Summary (2025-01-08)

### Vulnerability Status

| Category                 | Status  | Count | Severity |
| ------------------------ | ------- | ----- | -------- |
| Known CVEs               | ✅ Pass | 0     | N/A      |
| Hardcoded Secrets        | ✅ Pass | 0     | Critical |
| Missing Security Headers | ✅ Pass | 0     | High     |
| Input Validation Issues  | ✅ Pass | 0     | High     |
| Outdated Dependencies    | ⚠️ Warn | 5     | Medium   |

### Security Controls Implemented

#### 1. Content Security Policy (CSP)

- Dynamic nonce generation per request
- Strict source restrictions (self, https:)
- Script-src: self, strict-dynamic, https:
- Style-src: self, unsafe-inline (for Google Fonts)
- Frame-ancestors: none (prevents clickjacking)
- Object-src: none (prevents plugin-based attacks)

#### 2. HTTP Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

#### 3. Input Sanitization

- DOMPurify integration with strict configuration
- Regex preprocessing for dangerous patterns
- SVG tag removal with content preservation
- HTML entity decoding prevention
- Event handler removal (onload, onclick, etc.)
- Protocol filtering (javascript:, vbscript:, data:)

#### 4. Rate Limiting

- Token bucket algorithm (memory-efficient)
- Multiple rate limit tiers (general, heavy, export)
- Per-endpoint configuration
- Proper HTTP headers (X-RateLimit-\*, Retry-After)
- Database-level analytics for rate limiting

#### 5. Authentication

- API key-based authentication via X-API-Key header
- Secure secret generation (randomUUID for webhooks)
- Proper error responses (401 Unauthorized)
- Rate limiting on authentication endpoints

#### 6. Resilience Patterns

- Circuit breaker for external service calls
- Retry with exponential backoff and jitter
- Configurable presets for different operation types
- Comprehensive error categorization

### Dependency Security

**Vulnerability-Free**: 0 CVEs across 1,704 packages

**Outdated Packages** (requires attention):

1. Nuxt 3.20.2 → 4.2.2 (major update, breaking changes)
2. Vitest 3.2.4 → 4.0.16 (major update)
3. @vitest/coverage-v8 3.2.4 → 4.0.16
4. @vitest/ui 3.2.4 → 4.0.16
5. jsdom 25.0.1 → 27.4.0

**Dependency Hygiene**:

- No deprecated packages
- All packages actively maintained
- Regular dependency audits performed
- .env files properly ignored

### Security Posture

**Overall**: 🔒 STRONG

**Strengths**:

- Zero known vulnerabilities
- Comprehensive security headers
- Multi-layer input sanitization
- Robust rate limiting
- Circuit breaker pattern
- No hardcoded secrets
- Defense in depth approach

**Areas for Improvement**:

- Update outdated dependencies (Nuxt 4.x, Vitest 4.x)
- Minor code quality improvements (unused variables)

### Security Metrics

| Metric                    | Value |
| ------------------------- | ----- |
| Total Dependencies        | 1,704 |
| Production Dependencies   | 202   |
| Development Dependencies  | 1,472 |
| Known CVEs                | 0     |
| Security Headers          | 10    |
| Rate Limited Endpoints    | 10    |
| Input Sanitization Layers | 3     |
| Resilience Patterns       | 2     |
| Hardcoded Secrets         | 0     |

---

## 🚀 DevOps Architecture Decision Log

| Date       | Category     | Decision                                               | Rationale                                                                                                                                                                                                                     |
| ---------- | ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-17 | Architecture | Eliminate Toggle Function Duplication (DRY Principle)  | Refactored 5 duplicate toggle functions in useResourceFilters.ts to use existing toggleArrayItem utility; reduced code by 20 lines (14% reduction); eliminated code duplication while maintaining full backward compatibility |
| 2026-01-16 | Architecture | Extract Event Emitter Utility (DRY Principle)          | Eliminated duplicate event emission patterns in useBookmarks and useSavedSearches by creating utils/event-emitter.ts; improved type safety with generic event handlers; automatic cleanup functions prevent memory leaks      |
| 2026-01-09 | DevOps       | Add TypeScript ESLint plugin and rule configuration    | Fixed 335 lint errors by adding proper TypeScript linting support with underscore-prefixed parameter handling                                                                                                                 |
| 2026-01-09 | DevOps       | Configure @typescript-eslint/no-unused-vars rule       | Allow intentionally unused parameters with underscore prefix for type signatures                                                                                                                                              |
| 2026-01-09 | Code Quality | Fix all component Emits interface lint errors          | Vue components now properly declare event type signatures without lint warnings                                                                                                                                               |
| 2026-01-09 | Code Quality | Remove unused imports and variables across codebase    | Reduced technical debt and improved type safety                                                                                                                                                                               |
| 2026-01-09 | DevOps       | Update ESLint configuration for flat config format     | Removed tseslint.configs.recommended (not supported in flat config)                                                                                                                                                           |
| 2026-01-10 | Performance  | Optimize search endpoint filter operations             | Consolidated 6 sequential filters into single pass, reduced iterations by 50%, added Set-based O(1) tag lookups                                                                                                               |
| 2026-01-10 | Performance  | Optimize recommendation deduplication                  | Replaced O(n²) Array.some() with O(n) Set lookups, exponential to linear complexity reduction in getDiverseRecommendations                                                                                                    |
| 2026-01-10 | Architecture | Layer Separation - ModerationDashboard & HealthMonitor | Extracted business logic from components to dedicated composables (useModerationDashboard, useResourceHealth), enforcing separation of concerns and improving testability                                                     |
| 2026-01-11 | Performance  | Lazy Load ResourceCard Component                       | Converted 6 direct imports to lazy-loaded components, reduced initial bundle size by ~15-20KB, improved Time to Interactive (TTI)                                                                                             |

---

## 🔧 Build System Architecture

### Lint Configuration

#### TypeScript ESLint Integration

**Location**: `eslint.config.js`

**Purpose**: Unified linting rules across TypeScript and Vue files with proper type checking.

**Configuration**:

```javascript
// TypeScript ESLint Plugin
import tseslint from '@typescript-eslint/eslint-plugin'

// Add TypeScript recommended config to all configurations
export default [
  ...tseslint.configs.recommended,
  // ... other configs
]
```

#### Rule Configuration

**`@typescript-eslint/no-unused-vars` Rule**:

Applied to all relevant file types:

- Vue files (`**/*.vue`)
- Test files (`**/*.test.ts`, `**/*.spec.ts`)
- Script files (`scripts/**/*.js`)
- Utility files (`utils/**/*.ts`)
- Server API files (`server/api/**/*.ts`)
- Nuxt config files (`nuxt.config.ts`, `nuxt.config.analyze.ts`)
- Nuxt plugins (`plugins/**/*.ts`)

**Configuration**:

```javascript
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
```

**Rationale**:

- Emits interface parameters (event, value, etc.) are type signatures, not actual variables
- Underscore prefix (`_`) indicates intentionally unused parameters
- Prevents false positives for function type definitions

### Build Health Metrics

**Before Fix**:

- Lint Errors: 335
- CI Status: Failing
- Build Time: ~2-3 minutes

**After Fix**:

- Lint Errors: 0
- CI Status: Passing
- Build Time: ~2-3 minutes
- Warnings: Only intentional console statements in test files (acceptable)

### CI/CD Pipeline Improvements

#### 1. Automated Lint Configuration

**Before**: Inline `eslint-disable` comments scattered across files

- Difficult to maintain
- Inconsistent suppression reasons
- Global rules not enforced

**After**: Centralized ESLint configuration

- Single source of truth for linting rules
- Consistent application across all file types
- Easy to update and maintain

#### 2. Type Safety Enforcement

**Improvements**:

- All unused imports identified and removed
- All unused variables identified and removed
- Proper TypeScript error handling
- Better IDE support with accurate type checking

#### 3. Code Quality Metrics

**Files Fixed**: 16 files

- Component files: 5
- Composable files: 1
- Page files: 3
- Plugin files: 1
- Utility files: 2
- Middleware files: 1
- Module files: 1
- Test files: 1

**Errors Resolved**: 335 total

- TypeScript errors: ~250
- ESLint configuration errors: ~50
- Unused variables/imports: ~35

| Date       | Category                 | Decision                                                  | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-19 | Performance Optimization | Single-pass tag/category matching in useSearchSuggestions | Combined duplicate resource iteration loops from O(2n) to O(n), eliminating redundant array traversals, 2x performance improvement for suggestion generation                                                                                                                                                                                                                                                                                                   |
| 2026-01-20 | Data Architecture        | Migrate webhook storage from in-memory to database        | Designed and implemented 6 Prisma models (Webhook, WebhookDelivery, WebhookQueue, DeadLetterWebhook, ApiKey, IdempotencyKey) with soft-delete support, proper indexes, and JSON serialization; refactored webhookStorage.ts to use Prisma ORM instead of in-memory arrays; created reversible migration (20260120234718_add_webhook_models) with up/down scripts; zero data loss on server restart, horizontal scaling capability, persistent idempotency keys |

---
