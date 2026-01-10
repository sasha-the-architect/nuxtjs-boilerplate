# API Endpoints

This document provides comprehensive documentation for all API endpoints available in the Nuxt.js boilerplate, including request/response formats, authentication requirements, and usage examples.

**Note**: All API endpoints use standardized error responses. See [API Documentation](./README.md) for complete error response format.

## 📋 Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [Resource Management](#resource-management)
- [Search and Discovery](#search-and-discovery)
- [Community Features](#community-features)
- [Analytics and Monitoring](#analytics-and-monitoring)
- [Comparison Tools](#comparison-tools)
- [Webhook Management](#webhook-management)
- [Export and Feeds](#export-and-feeds)
- [API Key Management](#api-key-management)
- [Health and Status](#health-and-status)
- [Standardized Error Responses](#standardized-error-responses)

**Note**: This documentation reflects API v1 paths. All endpoints are prefixed with `/api/v1/` unless otherwise noted.

## 🔐 Authentication Endpoints

### POST /api/auth/register

Register a new user account.

#### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Response

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login

Authenticate user and generate JWT token.

#### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error (401):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials",
    "category": "authentication",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/auth/login"
  }
}
```

### GET /api/auth/profile

Get authenticated user profile (requires valid JWT token).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "bio": "Software developer",
  "avatar": "/avatars/user_123.jpg",
  "createdAt": "2025-01-01T00:00:00Z",
  "contributionCount": 5,
  "lastActive": "2025-11-29T12:00:00Z"
}
```

### PUT /api/auth/profile

Update authenticated user profile.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "name": "John Doe Updated",
  "bio": "Senior Software Developer",
  "avatar": "data:image/jpeg;base64,..."
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for field: email",
    "category": "validation",
    "details": {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/auth/register"
  }
}
```

## 📚 Resource Management

### GET /api/v1/resources

Get paginated list of resources with filtering and sorting options.

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search query string
- `category` (optional): Filter by category slug
- `tag` (optional): Filter by tag
- `sort` (optional): Sort field (default: "title")
- `order` (optional): Sort order (asc/desc, default: asc)

#### Response

```json
{
  "data": [
    {
      "id": "res_123",
      "title": "Example Resource",
      "description": "Resource description",
      "url": "https://example.com",
      "category": "development",
      "tags": ["free", "tools"],
      "featured": false,
      "createdAt": "2025-01-01T00:00:00Z",
      "upvotes": 5,
      "downvotes": 1,
      "healthStatus": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### GET /api/v1/resources/{id}

Get a specific resource by ID.

#### Response

```json
{
  "id": "res_123",
  "title": "Example Resource",
  "description": "Resource description",
  "url": "https://example.com",
  "category": "development",
  "tags": ["free", "tools"],
  "featured": false,
  "createdAt": "2025-01-01T00:00:00Z",
  "upvotes": 5,
  "downvotes": 1,
  "healthStatus": "active",
  "alternatives": [
    {
      "id": "res_456",
      "title": "Alternative Resource",
      "url": "https://alternative.com"
    }
  ],
  "comments": [
    {
      "id": "comment_1",
      "author": "user_456",
      "authorName": "Jane Doe",
      "content": "Great resource!",
      "createdAt": "2025-01-02T00:00:00Z",
      "upvotes": 2
    }
  ]
}
```

### GET /api/v1/resources/{id}/alternatives

Get alternative resources similar to the specified resource.

#### Query Parameters

- `limit` (optional): Number of alternatives to return (default: 5, max: 20)

#### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "resourceId": "res_123",
    "alternatives": [
      {
        "id": "res_456",
        "title": "Alternative Resource",
        "description": "Alternative description",
        "url": "https://alternative.com",
        "score": 0.85
      }
    ]
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found: res_123",
    "category": "not_found",
    "timestamp": "2026-01-10T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/resources/res_123/alternatives"
  }
}
```

## 📤 Export and Feeds

### GET /api/v1/export/csv

Export resource data as CSV.

#### Query Parameters

- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `search` (optional): Filter by search term

#### Response

Returns CSV file with resource data.

### GET /api/v1/export/json

Export resource data as JSON.

#### Query Parameters

- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `search` (optional): Filter by search term

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "res_123",
      "title": "Example Resource",
      "description": "Resource description",
      "url": "https://example.com",
      "category": "development"
    }
  ]
}
```

### GET /api/v1/rss

Get RSS feed of resources.

#### Query Parameters

- `limit` (optional): Number of items in feed (default: 20)

#### Response

Returns RSS/XML feed.

### GET /api/v1/sitemap

Get sitemap.xml of all resources.

#### Response

Returns XML sitemap.

## 🔑 API Key Management

### GET /api/v1/auth/api-keys

Get user's API keys (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "key_123",
      "name": "Production Key",
      "key": "sk_live_abc123",
      "lastUsed": "2025-11-29T12:00:00Z",
      "createdAt": "2025-11-01T00:00:00Z"
    }
  ]
}
```

### POST /api/v1/auth/api-keys

Create a new API key (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "name": "Production Key",
  "scopes": ["read", "write"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "key_456",
    "name": "Production Key",
    "key": "sk_live_xyz789",
    "createdAt": "2025-11-29T12:00:00Z"
  }
}
```

### DELETE /api/v1/auth/api-keys/{id}

Delete an API key (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API Key not found: key_123",
    "category": "not_found",
    "details": {
      "resource": "API Key",
      "identifier": "key_123"
    },
    "timestamp": "2026-01-10T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/auth/api-keys/key_123"
  }
}
```

### POST /api/submissions

Submit a new resource for moderation (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "title": "New Resource",
  "description": "Resource description",
  "url": "https://newresource.com",
  "category": "development",
  "tags": ["free", "tools"],
  "featured": false
}
```

#### Response

```json
{
  "success": true,
  "resource": {
    "id": "res_789",
    "title": "New Resource",
    "description": "Resource description",
    "url": "https://newresource.com",
    "category": "development",
    "tags": ["free", "tools"],
    "featured": false,
    "status": "pending"
  }
}
```

### GET /api/submissions

Get list of submissions (moderator access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `status` (optional): Filter by status (pending, approved, rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

```json
{
  "data": [
    {
      "id": "sub_123",
      "resourceData": {
        "title": "New Resource",
        "description": "Resource description",
        "url": "https://newresource.com"
      },
      "status": "pending",
      "submittedBy": "user_123",
      "submittedAt": "2025-11-29T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

## 🔍 Search and Discovery

### GET /api/v1/search

Perform search across resources with advanced filtering.

#### Query Parameters

- `q` (required): Search query
- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `pricing` (optional): Filter by pricing model
- `difficulty` (optional): Filter by difficulty level
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

```json
{
  "results": [
    {
      "id": "res_123",
      "title": "Example Resource",
      "description": "Resource description",
      "url": "https://example.com",
      "category": "development",
      "tags": ["free", "tools"],
      "score": 0.95
    }
  ],
  "total": 25,
  "took": 45,
  "facets": {
    "categories": [
      { "name": "development", "count": 15 },
      { "name": "design", "count": 8 }
    ],
    "tags": [
      { "name": "free", "count": 22 },
      { "name": "tools", "count": 18 }
    ]
  }
}
```

### GET /api/search/suggestions

Get search suggestions based on user input.

#### Query Parameters

- `q` (required): Partial search query

#### Response

```json
{
  "suggestions": [
    "javascript frameworks",
    "javascript tutorials",
    "javascript tools"
  ],
  "related": [
    {
      "term": "react",
      "count": 12
    },
    {
      "term": "vue",
      "count": 8
    }
  ]
}
```

### GET /api/v1/categories

Get all categories with resource counts.

#### Response

```json
{
  "success": true,
  "data": [
    { "name": "Development", "count": 42 },
    { "name": "Design", "count": 35 },
    { "name": "AI", "count": 28 }
  ]
}
```

### GET /api/v1/tags

Get all tags with optional hierarchy parameters.

#### Query Parameters

- `includeChildren` (optional): Include child tags
- `includeParents` (optional): Include parent tags
- `rootOnly` (optional): Return only root-level tags

#### Response

```json
{
  "success": true,
  "data": {
    "tags": ["react", "vue", "javascript"],
    "includeChildren": false,
    "includeParents": false,
    "rootOnly": false
  }
}
```

## 👥 Community Features

### POST /api/comments

Add a comment to a resource (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "resourceId": "res_123",
  "content": "This is a great resource for learning!",
  "parentId": "comment_456" // optional, for replies
}
```

#### Response

```json
{
  "success": true,
  "comment": {
    "id": "comment_789",
    "resourceId": "res_123",
    "author": "user_123",
    "authorName": "John Doe",
    "content": "This is a great resource for learning!",
    "parentId": "comment_456",
    "createdAt": "2025-11-29T12:00:00Z",
    "upvotes": 0,
    "downvotes": 0
  }
}
```

### POST /api/votes

Vote on a resource or comment (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "targetId": "res_123",
  "targetType": "resource", // or "comment"
  "voteType": "up" // or "down"
}
```

#### Response

```json
{
  "success": true,
  "vote": {
    "targetId": "res_123",
    "targetType": "resource",
    "userId": "user_123",
    "voteType": "up",
    "createdAt": "2025-11-29T12:00:00Z"
  }
}
```

### POST /api/flags

Report inappropriate content (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "targetId": "res_123",
  "targetType": "resource", // or "comment"
  "reason": "spam",
  "details": "This resource appears to be promoting a commercial product"
}
```

#### Response

```json
{
  "success": true,
  "flag": {
    "id": "flag_123",
    "targetId": "res_123",
    "targetType": "resource",
    "userId": "user_123",
    "reason": "spam",
    "details": "This resource appears to be promoting a commercial product",
    "status": "pending",
    "createdAt": "2025-11-29T12:00:00Z"
  }
}
```

### GET /api/moderation/queue

Get moderation queue (moderator access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `type` (optional): Filter by target type (resource, comment)
- `status` (optional): Filter by flag status (pending, resolved)
- `page` (optional): Page number (default: 1)

#### Response

```json
{
  "data": [
    {
      "id": "flag_123",
      "targetId": "res_123",
      "targetType": "resource",
      "reason": "spam",
      "details": "This resource appears to be promoting a commercial product",
      "status": "pending",
      "reportedBy": "user_456",
      "createdAt": "2025-11-29T12:00:00Z",
      "targetData": {
        "title": "Example Resource",
        "description": "Resource description",
        "url": "https://example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### POST /api/moderation/approve

Approve a submission (moderator access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "submissionId": "sub_123",
  "notes": "Approved after review"
}
```

#### Response

```json
{
  "success": true,
  "submission": {
    "id": "sub_123",
    "status": "approved",
    "reviewedBy": "user_789",
    "reviewedAt": "2025-11-29T12:00:00Z",
    "notes": "Approved after review"
  }
}
```

### POST /api/moderation/reject

Reject a submission (moderator access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "submissionId": "sub_123",
  "reason": "duplicate",
  "notes": "This resource already exists in the database"
}
```

#### Response

```json
{
  "success": true,
  "submission": {
    "id": "sub_123",
    "status": "rejected",
    "rejectionReason": "duplicate",
    "reviewedBy": "user_789",
    "reviewedAt": "2025-11-29T12:00:00Z",
    "notes": "This resource already exists in the database"
  }
}
```

## 📊 Analytics and Monitoring

### POST /api/analytics/events

Track user events and interactions.

#### Request

```json
{
  "event": "resource_view",
  "properties": {
    "resourceId": "res_123",
    "userId": "user_456",
    "page": "/resources/res_123"
  },
  "timestamp": "2025-11-29T12:00:00Z"
}
```

#### Response

```json
{
  "success": true,
  "event_id": "event_123"
}
```

### GET /api/analytics/search

Get search analytics data.

#### Query Parameters

- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)
- `limit` (optional): Number of results (default: 10)

#### Response

```json
{
  "popular_searches": [
    { "query": "javascript", "count": 125 },
    { "query": "react", "count": 89 },
    { "query": "vue", "count": 76 }
  ],
  "zero_result_searches": [
    { "query": "non-existent-tool", "count": 12 },
    { "query": "missing-resource", "count": 8 }
  ],
  "search_performance": {
    "avg_response_time": 45,
    "total_searches": 1250,
    "success_rate": 0.87
  },
  "trending_searches": [
    { "query": "ai tools", "growth": 1.45 },
    { "query": "react native", "growth": 1.23 }
  ]
}
```

### GET /api/analytics/data

Get comprehensive analytics data.

#### Query Parameters

- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)

#### Response

```json
{
  "user_engagement": {
    "total_users": 1250,
    "new_users": 45,
    "active_users": 320,
    "avg_session_duration": 125,
    "page_views": 5678
  },
  "resource_metrics": {
    "total_resources": 342,
    "new_resources": 12,
    "popular_categories": [
      { "name": "development", "count": 89 },
      { "name": "design", "count": 67 }
    ],
    "avg_rating": 4.2
  },
  "search_metrics": {
    "total_searches": 1250,
    "search_success_rate": 0.87,
    "avg_search_time": 45
  }
}
```

### GET /api/analytics/export/csv

Export analytics data as CSV.

#### Query Parameters

- `type` (required): Type of data to export (search, user, resource)
- `from` (optional): Start date
- `to` (optional): End date

#### Response

Returns CSV file with analytics data.

## ⚖️ Comparison Tools

### GET /api/v1/comparisons

Get a comparison of multiple resources.

#### Query Parameters

- `ids` (required): Comma-separated list of resource IDs

#### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "comparison": {
      "id": "cmp_123",
      "resources": ["res_1", "res_2"],
      "criteria": [],
      "scores": {}
    },
    "resources": [
      {
        "id": "res_1",
        "title": "React",
        "description": "JavaScript library for building UIs",
        "url": "https://reactjs.org"
      }
    ]
  }
}
```

### POST /api/v1/comparisons

Create a new resource comparison.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "resourceIds": ["res_123", "res_456", "res_789"],
  "criteria": [
    { "id": "pricing", "name": "Pricing", "weight": 0.3 },
    { "id": "features", "name": "Features", "weight": 0.5 },
    { "id": "ease_of_use", "name": "Ease of Use", "weight": 0.2 }
  ],
  "scores": {
    "res_123": { "pricing": 4.5, "features": 3.8, "ease_of_use": 4.2 },
    "res_456": { "pricing": 3.2, "features": 4.5, "ease_of_use": 3.9 },
    "res_789": { "pricing": 5.0, "features": 4.0, "ease_of_use": 4.5 }
  },
  "isPublic": true,
  "name": "Framework Comparison"
}
```

#### Response

```json
{
  "success": true,
  "comparison": {
    "id": "comp_123",
    "resourceIds": ["res_123", "res_456", "res_789"],
    "name": "Framework Comparison",
    "createdBy": "user_123",
    "createdAt": "2025-11-29T12:00:00Z",
    "isPublic": true,
    "slug": "framework-comparison-123"
  }
}
```

## 🔔 Webhook Management

### GET /api/v1/webhooks

Get user's webhooks (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `type` (optional): "my" for user's comparisons, "public" for public ones (default: "my")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

**Success (200):**

```json
{
  "data": [
    {
      "id": "comp_123",
      "name": "Framework Comparison",
      "resourceIds": ["res_123", "res_456", "res_789"],
      "resourceTitles": ["React", "Vue", "Angular"],
      "createdAt": "2025-11-29T12:00:00Z",
      "isPublic": true,
      "slug": "framework-comparison-123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Resource IDs are required for comparison",
    "category": "validation",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/comparisons"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resources not found: res_123, res_456",
    "category": "not_found",
    "details": {
      "resource": "Resources",
      "identifier": "res_123, res_456"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/comparisons"
  }
}
```

### GET /api/v1/comparisons/{id}

Get a specific comparison by ID.

#### Response

**Success (200):**

```json
{
  "id": "comp_123",
  "name": "Framework Comparison",
  "resources": [
    {
      "id": "res_123",
      "title": "React",
      "description": "JavaScript library for building user interfaces",
      "url": "https://reactjs.org"
    },
    {
      "id": "res_456",
      "title": "Vue",
      "description": "Progressive JavaScript framework",
      "url": "https://vuejs.org"
    },
    {
      "id": "res_789",
      "title": "Angular",
      "description": "Platform for building mobile and desktop web applications",
      "url": "https://angular.io"
    }
  ],
  "criteria": [
    { "id": "pricing", "name": "Pricing", "weight": 0.3 },
    { "id": "features", "name": "Features", "weight": 0.5 },
    { "id": "ease_of_use", "name": "Ease of Use", "weight": 0.2 }
  ],
  "scores": {
    "res_123": { "pricing": 4.5, "features": 3.8, "ease_of_use": 4.2 },
    "res_456": { "pricing": 3.2, "features": 4.5, "ease_of_use": 3.9 },
    "res_789": { "pricing": 5.0, "features": 4.0, "ease_of_use": 4.5 }
  },
  "createdAt": "2025-11-29T12:00:00Z",
  "createdBy": "user_123"
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Comparison not found: comp_123",
    "category": "not_found",
    "details": {
      "resource": "Comparison",
      "identifier": "comp_123"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/comparisons/comp_123"
  }
}
```

## 🔔 Webhook Management

### GET /api/v1/webhooks

Get user's webhooks (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

```json
{
  "data": [
    {
      "id": "webhook_123",
      "name": "Resource Updates",
      "url": "https://myapp.com/webhook/resources",
      "events": ["resource.created", "resource.updated"],
      "active": true,
      "createdAt": "2025-11-25T10:00:00Z",
      "lastTriggered": "2025-11-28T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/v1/webhooks

Create a new webhook (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "name": "Resource Updates",
  "url": "https://myapp.com/webhook/resources",
  "events": ["resource.created", "resource.updated"],
  "secret": "webhook_secret_123"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "webhook": {
    "id": "webhook_123",
    "name": "Resource Updates",
    "url": "https://myapp.com/webhook/resources",
    "events": ["resource.created", "resource.updated"],
    "active": true,
    "createdAt": "2025-11-29T12:00:00Z"
  }
}
```

**Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid webhook URL",
    "category": "validation",
    "details": "URL must be a valid HTTPS endpoint",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/webhooks"
  }
}
```

### PUT /api/v1/webhooks/{id}

Update a webhook (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "name": "Updated Resource Updates",
  "url": "https://myapp.com/webhook/resources-updated",
  "events": ["resource.created", "resource.updated", "resource.deleted"],
  "active": true
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "webhook": {
    "id": "webhook_123",
    "name": "Updated Resource Updates",
    "url": "https://myapp.com/webhook/resources-updated",
    "events": ["resource.created", "resource.updated", "resource.deleted"],
    "active": true,
    "updatedAt": "2025-11-29T12:00:00Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "API Key not found: webhook_123",
    "category": "not_found",
    "details": {
      "resource": "API Key",
      "identifier": "webhook_123"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/webhooks/webhook_123"
  }
}
```

### DELETE /api/v1/webhooks/{id}

Delete a webhook (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

**Success (200):**

```json
{
  "success": true
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Webhook not found: webhook_123",
    "category": "not_found",
    "details": {
      "resource": "Webhook",
      "identifier": "webhook_123"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/webhooks/webhook_123"
  }
}
```

### POST /api/v1/webhooks/trigger

Manually trigger a webhook for testing (requires authentication).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request

```json
{
  "webhookId": "webhook_123",
  "testPayload": {
    "event": "test.event",
    "data": {
      "test": true,
      "message": "This is a test webhook"
    }
  }
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "triggered": true,
  "response": {
    "status": 200,
    "timestamp": "2025-11-29T12:00:00Z"
  }
}
```

**Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Event type is required",
    "category": "validation",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/webhooks/trigger"
  }
}
```

### GET /api/v1/webhooks/queue

Get webhook queue statistics and dead letter queue (moderator/admin access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalQueued": 5,
      "totalDelivered": 152,
      "totalFailed": 3,
      "totalDeadLetter": 1
    },
    "queue": [
      {
        "id": "webhook_queue_1",
        "webhookId": "webhook_123",
        "event": "resource.created",
        "scheduledFor": "2025-11-29T12:05:00Z",
        "retryCount": 0,
        "maxRetries": 3,
        "createdAt": "2025-11-29T12:00:00Z"
      }
    ],
    "deadLetterQueue": [
      {
        "id": "dead_letter_1",
        "webhookId": "webhook_123",
        "event": "resource.updated",
        "failureReason": "Connection timeout",
        "lastAttemptAt": "2025-11-29T12:10:00Z",
        "deliveryAttempts": 3,
        "createdAt": "2025-11-29T12:00:00Z"
      }
    ]
  }
}
```

### GET /api/v1/webhooks/deliveries

Get webhook delivery history.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Query Parameters

- `webhookId` (optional): Filter by webhook ID
- `status` (optional): Filter by delivery status (success, failed, pending)
- `limit` (optional): Number of deliveries to return (default: 50, max: 100)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "delivery_123",
      "webhookId": "webhook_123",
      "event": "resource.created",
      "url": "https://myapp.com/webhook/resources",
      "status": "success",
      "statusCode": 200,
      "responseTime": 245,
      "attemptCount": 1,
      "createdAt": "2025-11-29T12:00:00Z",
      "completedAt": "2025-11-29T12:00:01Z"
    }
  ]
}
```

### POST /api/v1/webhooks/dead-letter/{id}/retry

Retry a webhook from the dead letter queue (moderator/admin access required).

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Webhook queued for retry",
  "deliveryId": "delivery_456"
}
```

**Error (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Dead letter webhook not found: dead_letter_1",
    "category": "not_found",
    "timestamp": "2026-01-10T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/v1/webhooks/dead-letter/dead_letter_1/retry"
  }
}
```

## 🏥 Health and Status

### GET /api/health-checks

Get application health status.

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-29T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": { "status": "healthy", "responseTime": 12 },
    "cache": { "status": "healthy", "responseTime": 5 },
    "storage": { "status": "healthy", "availableSpace": "85%" }
  }
}
```

### GET /api/resource-health

Get overall resource health statistics.

#### Response

```json
{
  "totalResources": 342,
  "healthyResources": 320,
  "unhealthyResources": 15,
  "unknownResources": 7,
  "healthPercentage": 93.6,
  "lastUpdated": "2025-11-29T11:45:00Z"
}
```

### GET /api/resource-health/[id]

Get health status for a specific resource.

#### Response

```json
{
  "resourceId": "res_123",
  "url": "https://example.com",
  "status": "healthy",
  "responseTime": 245,
  "lastChecked": "2025-11-29T11:45:00Z",
  "statusCode": 200,
  "sslValid": true,
  "certificateExpiry": "2026-01-15T00:00:00Z",
  "downtimeCount": 0,
  "uptimePercentage": 100
}
```

### POST /api/resources/[id]/health

Manually trigger health check for a specific resource.

#### Request

```json
{
  "force": true
}
```

#### Response

```json
{
  "success": true,
  "check": {
    "resourceId": "res_123",
    "status": "healthy",
    "responseTime": 234,
    "checkedAt": "2025-11-29T12:00:00Z",
    "details": {
      "statusCode": 200,
      "sslValid": true,
      "certificateExpiry": "2026-01-15T00:00:00Z"
    }
  }
}
```

---

## Standardized Error Responses

All API endpoints use a standardized error response format for consistent client error handling.

### Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "category": "error_category",
    "details": { "additional": "context" },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/example"
  }
}
```

### Common Error Codes

| Code                     | HTTP Status | Category           | Description                 |
| ------------------------ | ----------- | ------------------ | --------------------------- |
| `BAD_REQUEST`            | 400         | `validation`       | Invalid request data        |
| `UNAUTHORIZED`           | 401         | `authentication`   | Authentication required     |
| `FORBIDDEN`              | 403         | `authorization`    | Access forbidden            |
| `NOT_FOUND`              | 404         | `not_found`        | Resource not found          |
| `CONFLICT`               | 409         | `validation`       | Conflict with existing data |
| `VALIDATION_ERROR`       | 400         | `validation`       | Field validation failed     |
| `RATE_LIMIT_EXCEEDED`    | 429         | `rate_limit`       | Too many requests           |
| `INTERNAL_SERVER_ERROR`  | 500         | `internal`         | Server error                |
| `SERVICE_UNAVAILABLE`    | 503         | `external_service` | Service unavailable         |
| `EXTERNAL_SERVICE_ERROR` | 502         | `external_service` | Third-party service error   |

### Error Response Examples

#### Bad Request (400)

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request data",
    "category": "validation",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/resources"
  }
}
```

#### Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found: res_123",
    "category": "not_found",
    "details": {
      "resource": "Resource",
      "identifier": "res_123"
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/resources/res_123"
  }
}
```

#### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "category": "rate_limit",
    "details": {
      "retryAfter": 45
    },
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/analytics/events"
  }
}
```

#### Internal Server Error (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An internal server error occurred",
    "category": "internal",
    "details": "Detailed error message (development only)",
    "timestamp": "2026-01-09T12:00:00.000Z",
    "requestId": "req_1234567890_abc123",
    "path": "/api/example"
  }
}
```

---

_Last Updated: 2026-01-10_
