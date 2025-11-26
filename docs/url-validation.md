# URL Validation and Link Health System

This document describes the automated URL validation and link checking system implemented in the Nuxt.js boilerplate.

## Overview

The URL validation system provides automated health checks for all resource URLs in the application. It includes validation engine, health tracking, dashboard API, and alerting capabilities.

## Features

### 1. URL Validation Engine

- Validates URLs by making HTTP requests to check status codes
- Handles redirects and SSL validation
- Monitors response times and performance
- Implements retry logic for transient failures

### 2. Health Status Tracking

- Tracks the health status of each resource URL
- Records status codes, response times, and error messages
- Stores the last checked timestamp
- Maintains historical health data

### 3. Health Dashboard API

- Provides `/api/v1/resources/health` endpoint
- Returns health status for all resources
- Includes filtering by category and health status
- Provides summary statistics (healthy/unhealthy counts)

### 4. Validation Script

- Command-line validation script for manual runs
- Batch processing with rate limiting
- Detailed logging and reporting

## Resource Schema Changes

The Resource interface has been extended with the following health tracking fields:

```typescript
interface Resource {
  // ... existing fields ...

  // URL health tracking fields
  lastChecked?: string // Timestamp of last health check
  statusCode?: number // HTTP status code from last check
  isHealthy?: boolean // Health status (true/false/undefined)
  responseTime?: number // Response time in milliseconds
  healthCheckError?: string // Error message if validation failed
}
```

## API Endpoints

### Health Status Endpoint

```
GET /api/v1/resources/health
```

Query parameters:

- `category` - Filter by category
- `status` - Filter by health status ('healthy', 'unhealthy', 'unknown')
- `limit` - Number of resources to return (default: 50, max: 200)
- `offset` - Number of resources to skip (default: 0)

Example response:

```json
{
  "success": true,
  "data": [...],
  "summary": {
    "total": 100,
    "healthy": 95,
    "unhealthy": 3,
    "unknown": 2,
    "healthyPercentage": 95
  },
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Usage

### Manual Validation

Run the validation script manually:

```bash
npm run validate-urls
```

This will validate all URLs in the resources file and update their health status.

### Scheduled Validation

The system can be integrated with cron jobs or task schedulers to run periodic validation:

```bash
# Run validation daily at 2 AM
0 2 * * * cd /path/to/project && npm run validate-urls
```

## Validation Parameters

The URL validation includes:

- **Timeout**: 10 seconds per request
- **Retries**: 3 attempts for failed requests
- **Rate Limiting**: 100ms delay between requests in batch processing
- **User Agent**: Identified as 'NuxtJS-Boilerplate-Health-Checker/1.0'

## Health Status

- **Healthy**: HTTP status 200-399
- **Unhealthy**: HTTP status 400-599 or network errors
- **Unknown**: Not yet validated or validation in progress

## Error Handling

The validation system handles various error types:

- Network errors
- Timeout errors
- Invalid URL format
- HTTP error status codes
- SSL/TLS connection issues

## Performance Considerations

- Batch processing with configurable delays to respect server resources
- Asynchronous validation to avoid blocking operations
- Pagination for large datasets
- Rate limiting to prevent overwhelming target servers

## Integration

The health status data is stored in the resource objects and can be used for:

- Displaying health indicators in the UI
- Filtering unhealthy resources
- Alerting when resources become unhealthy
- Generating health reports
