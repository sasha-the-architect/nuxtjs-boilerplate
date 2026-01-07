# API Documentation

This section contains documentation for project's architecture, components, and APIs.

## 📚 Available Documentation

### [API Endpoints](./endpoints.md)

- Complete API reference
- Request/Response examples
- Authentication requirements
- Usage guidelines

### [Integration Patterns](../integration-patterns.md)

- Circuit breaker pattern for resilience
- Retry with exponential backoff
- Standardized error responses
- Integration best practices

### [Project Architecture](../architecture/README.md)

- System design overview
- Component architecture
- Data flow patterns
- Technical decisions

## 🔔 Error Response Format

All API endpoints use a standardized error response format for consistent client error handling. See [Integration Patterns Guide](../integration-patterns.md#standardized-error-responses) for complete details.

### Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error description",
    "category": "validation",
    "details": {},
    "timestamp": "2025-01-07T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Categories

- `validation`: Request validation failures (400)
- `authentication`: Authentication required (401)
- `authorization`: Access forbidden (403)
- `not_found`: Resource not found (404)
- `rate_limit`: Rate limit exceeded (429)
- `external_service`: Third-party service failures (502/503/504)
- `internal`: Server errors (500)
- `network`: Network-related errors (500)

---

_Last Updated: 2025-01-07_
