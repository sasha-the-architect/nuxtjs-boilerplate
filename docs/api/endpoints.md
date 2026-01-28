# API Endpoints

This document provides comprehensive documentation for API endpoints available in this repository, including request/response formats and usage examples.

**Note**: All API endpoints use standardized error responses. See [API Documentation](./README.md) for complete error response format.

## 📋 Table of Contents

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

## ℹ️ Authentication status

Server-side user authentication (register/login/JWT sessions) is **not implemented** in this repository at the moment.

Some endpoints below may still mention “requires authentication” conceptually (e.g. API key management), but the auth layer should be treated as a future enhancement until implemented.

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

Get user's API keys.

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

Create a new API key.

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

Delete an API key.

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

## 📤 Submissions

### POST /api/submissions

Submit a new resource for moderation.

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

Get list of submissions.

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

Get all tags.

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

Add a comment to a resource.

#### Request

```json
{
  "resourceId": "res_123",
  "content": "This is a great resource for learning!",
  "parentId": "comment_456"
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

Vote on a resource or comment.

#### Request

```json
{
  "targetId": "res_123",
  "targetType": "resource",
  "voteType": "up"
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

Report inappropriate content.

#### Request

```json
{
  "targetId": "res_123",
  "targetType": "resource",
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

Get moderation queue.

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
  ]
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

## ⚖️ Comparison Tools

### GET /api/v1/comparisons

Get a comparison of multiple resources.

## 🔔 Webhook Management

### GET /api/v1/webhooks

Get user's webhooks.

## 🏥 Health and Status

### GET /api/health-checks

Get application health status.

## Standardized Error Responses

All API endpoints use a standardized error response format for consistent client error handling.

_Last Updated: 2026-01-28_
