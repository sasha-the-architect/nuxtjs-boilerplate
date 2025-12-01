# Webhook API Documentation

## Overview

The webhook system allows external services to receive real-time notifications when specific events occur in the application.

## Authentication

All API endpoints require an API key for authentication, sent in the `X-API-Key` header.

## Webhook Events

- `resource.created` - Triggered when a new resource is created
- `resource.updated` - Triggered when a resource is updated
- `resource.deleted` - Triggered when a resource is deleted
- `resource.approved` - Triggered when a resource is approved
- `user.registered` - Triggered when a new user registers
- `submission.received` - Triggered when a new submission is received

## Endpoints

### GET /api/v1/webhooks

List all webhooks.

**Query Parameters:**

- `active` - Filter by active status (`true` or `false`)
- `event` - Filter by event type

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "wh_12345",
      "url": "https://example.com/webhook",
      "events": ["resource.created", "resource.updated"],
      "active": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "lastDeliveryAt": "2023-01-01T00:00:00Z",
      "lastDeliveryStatus": "success",
      "deliveryCount": 10,
      "failureCount": 1
    }
  ],
  "count": 1
}
```

### POST /api/v1/webhooks

Create a new webhook.

**Request Body:**

```json
{
  "url": "https://example.com/webhook",
  "events": ["resource.created", "resource.updated"],
  "active": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wh_12345",
    "url": "https://example.com/webhook",
    "events": ["resource.created", "resource.updated"],
    "active": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "deliveryCount": 0,
    "failureCount": 0
  }
}
```

### PUT /api/v1/webhooks/{id}

Update an existing webhook.

**Request Body:**

```json
{
  "url": "https://new-webhook-url.com",
  "events": ["resource.created"],
  "active": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wh_12345",
    "url": "https://new-webhook-url.com",
    "events": ["resource.created"],
    "active": false,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-02T00:00:00Z",
    "lastDeliveryAt": "2023-01-01T00:00:00Z",
    "lastDeliveryStatus": "success",
    "deliveryCount": 10,
    "failureCount": 1
  }
}
```

### DELETE /api/v1/webhooks/{id}

Delete a webhook.

**Response:**

```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

### GET /api/v1/webhooks/deliveries

Get webhook delivery logs.

**Query Parameters:**

- `webhookId` - Filter by webhook ID
- `status` - Filter by delivery status (`success`, `failed`, `pending`)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "del_12345",
      "webhookId": "wh_12345",
      "event": "resource.created",
      "status": "success",
      "responseCode": 200,
      "responseMessage": "OK",
      "attemptCount": 1,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

## API Key Management

### GET /api/v1/auth/api-keys

List all API keys.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "key_12345",
      "name": "My Application",
      "permissions": ["read", "write"],
      "createdAt": "2023-01-01T00:00:00Z",
      "expiresAt": "2024-01-01T00:00:00Z",
      "active": true
    }
  ],
  "count": 1
}
```

### POST /api/v1/auth/api-keys

Create a new API key.

**Request Body:**

```json
{
  "name": "My Application",
  "permissions": ["read", "write"],
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "key_12345",
    "name": "My Application",
    "key": "ak_randomstringofcharacters",
    "permissions": ["read", "write"],
    "createdAt": "2023-01-01T00:00:00Z",
    "expiresAt": "2024-01-01T00:00:00Z",
    "active": true
  }
}
```

### DELETE /api/v1/auth/api-keys/{id}

Revoke an API key.

**Response:**

```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

## Webhook Payload Signature

Webhook payloads include a signature in the `X-Webhook-Signature` header for verification. The signature uses HMAC-SHA256 with your webhook secret.
